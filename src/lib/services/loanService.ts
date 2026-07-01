import loanRepository from '../firestore/loanRepo';
import installmentRepository from '../firestore/installmentRepo';
import installmentService from './installmentService';
import financialsService from './financialsService';
import { Loan, LoanCreateInput, LoanDetailView, LoanProgress, LoanSummary, LoanWithProgress } from '../../types';

const roundToTwo = (value: number): number => Math.round(value * 100) / 100;

class LoanService {
  calculateLoanSummary(principalAmount: number, totalRepayableAmount: number, numberOfWeeks: number): LoanSummary {
    const profitAmount = roundToTwo(totalRepayableAmount - principalAmount);
    const weeklyInstallment = roundToTwo(totalRepayableAmount / numberOfWeeks);

    return { profitAmount, weeklyInstallment };
  }

  calculateLoanProgress(loan: Loan, installments: { effectiveStatus: 'pending' | 'paid' | 'overdue'; amount: number }[]): LoanProgress {
    const completedWeeks = installments.filter((installment) => installment.effectiveStatus === 'paid').length;
    const pendingWeeks = installments.filter((installment) => installment.effectiveStatus === 'pending').length;
    const overdueWeeks = installments.filter((installment) => installment.effectiveStatus === 'overdue').length;
    const outstandingAmount = roundToTwo(
      installments
        .filter((installment) => installment.effectiveStatus !== 'paid')
        .reduce((total, installment) => total + installment.amount, 0)
    );

    return { completedWeeks, pendingWeeks, overdueWeeks, outstandingAmount };
  }

  async getLoansByBorrower(ownerId: string, borrowerId: string): Promise<LoanWithProgress[]> {
    const loans = await loanRepository.getLoansByOwnerAndBorrower(ownerId, borrowerId);

    const enrichedLoans = await Promise.all(
      loans.map(async (loan) => {
        const installments = await installmentService.getInstallmentsByLoan(ownerId, loan.id);
        const progress = this.calculateLoanProgress(loan, installments);

        return {
          ...loan,
          ...progress,
        };
      })
    );

    return enrichedLoans.sort((left, right) => right.createdAt - left.createdAt);
  }

  async getLoanDetail(ownerId: string, loanId: string): Promise<LoanDetailView | null> {
    const loan = await loanRepository.getLoanById(ownerId, loanId);
    if (!loan) {
      return null;
    }

    const installments = await installmentService.getInstallmentsByLoan(ownerId, loan.id);
    const progress = this.calculateLoanProgress(loan, installments);

    return {
      loan: {
        ...loan,
        ...progress,
      },
      installments,
    };
  }

  async markInstallmentAsPaid(ownerId: string, loanId: string, installmentId: string): Promise<LoanDetailView | null> {
    const loan = await loanRepository.getLoanById(ownerId, loanId);
    if (!loan) {
      return null;
    }

    const installments = await installmentService.getInstallmentsByLoan(ownerId, loanId);
    const targetInstallment = installments.find((i) => i.id === installmentId);

    await installmentService.markInstallmentAsPaid(installmentId);

    if (targetInstallment) {
      await financialsService.onInstallmentPaid(ownerId, targetInstallment.amount);
    }

    const refreshedDetail = await this.getLoanDetail(ownerId, loanId);
    if (!refreshedDetail) {
      return null;
    }

    if (refreshedDetail.loan.pendingWeeks === 0 && refreshedDetail.loan.overdueWeeks === 0) {
      await loanRepository.updateLoanStatus(loanId, 'completed');
      refreshedDetail.loan.status = 'completed';
    }

    return refreshedDetail;
  }

  async createLoanWithInstallments(input: LoanCreateInput): Promise<{ loan: Loan }> {
    const summary = this.calculateLoanSummary(
      input.principalAmount,
      input.totalRepayableAmount,
      input.numberOfWeeks
    );

    const now = Date.now();
    const loan: Loan = {
      id: loanRepository.generateId(),
      borrowerId: input.borrowerId,
      borrowerName: input.borrowerName,
      ownerId: input.ownerId,
      principalAmount: roundToTwo(input.principalAmount),
      totalRepayableAmount: roundToTwo(input.totalRepayableAmount),
      profitAmount: summary.profitAmount,
      numberOfWeeks: input.numberOfWeeks,
      weeklyInstallment: summary.weeklyInstallment,
      startDate: input.startDate,
      firstDueDate: input.firstDueDate,
      notes: input.notes?.trim() || '',
      status: 'active',
      createdAt: now,
      amountFundedFromBalance: 0,
    };

    const amountFundedFromBalance = await financialsService.onLoanCreated(
      input.ownerId,
      loan.principalAmount,
      loan.profitAmount
    );
    loan.amountFundedFromBalance = amountFundedFromBalance;

    await loanRepository.createLoan(loan);

    const installments = installmentService.generateInstallments({
      loanId: loan.id,
      borrowerId: loan.borrowerId,
      borrowerName: loan.borrowerName,
      ownerId: loan.ownerId,
      numberOfWeeks: loan.numberOfWeeks,
      firstDueDate: loan.firstDueDate,
      totalRepayableAmount: loan.totalRepayableAmount,
      weeklyInstallment: loan.weeklyInstallment,
    });

    await installmentService.createInstallments(installments);

    return { loan };
  }

  async deleteLoan(ownerId: string, loanId: string): Promise<void> {
    const loan = await loanRepository.getLoanById(ownerId, loanId);
    if (!loan) {
      throw new Error('Loan not found or access denied');
    }

    const amountFundedFromBalance = loan.amountFundedFromBalance ?? 0;

    const installments = await installmentService.getInstallmentsByLoan(ownerId, loanId);
    const totalPaidBack = roundToTwo(
      installments
        .filter((i) => i.effectiveStatus === 'paid')
        .reduce((total, i) => total + i.amount, 0)
    );

    await installmentRepository.deleteInstallmentsByLoan(ownerId, loanId);
    await loanRepository.deleteLoan(loanId);

    await financialsService.onLoanDeleted(ownerId, loan.principalAmount, loan.profitAmount, amountFundedFromBalance);

    if (totalPaidBack > 0) {
      const financials = await financialsService.getOrInitialize(ownerId);
      financials.currentBalance = Math.max(0, roundToTwo(financials.currentBalance - totalPaidBack));
      financials.lastUpdatedAt = Date.now();
      const financialsRepository = (await import('../firestore/financialsRepo')).default;
      await financialsRepository.saveFinancials(financials);
    }
  }

  async updateLoan(
    ownerId: string,
    loanId: string,
    input: Omit<LoanCreateInput, 'borrowerId' | 'borrowerName' | 'ownerId'>
  ): Promise<Loan> {
    const existing = await loanRepository.getLoanById(ownerId, loanId);
    if (!existing) {
      throw new Error('Loan not found or access denied');
    }

    const summary = this.calculateLoanSummary(
      input.principalAmount,
      input.totalRepayableAmount,
      input.numberOfWeeks
    );

    const updatedLoan: Loan = {
      ...existing,
      principalAmount: roundToTwo(input.principalAmount),
      totalRepayableAmount: roundToTwo(input.totalRepayableAmount),
      profitAmount: summary.profitAmount,
      numberOfWeeks: input.numberOfWeeks,
      weeklyInstallment: summary.weeklyInstallment,
      startDate: input.startDate,
      firstDueDate: input.firstDueDate,
      notes: input.notes?.trim() || '',
    };

    await loanRepository.createLoan(updatedLoan);

    const installments = await installmentService.getInstallmentsByLoan(ownerId, loanId);
    const hasPaidInstallments = installments.some((i) => i.status === 'paid');

    if (!hasPaidInstallments) {
      await installmentRepository.deleteInstallmentsByLoan(ownerId, loanId);
      const newInstallments = installmentService.generateInstallments({
        loanId: updatedLoan.id,
        borrowerId: updatedLoan.borrowerId,
        borrowerName: updatedLoan.borrowerName,
        ownerId: updatedLoan.ownerId,
        numberOfWeeks: updatedLoan.numberOfWeeks,
        firstDueDate: updatedLoan.firstDueDate,
        totalRepayableAmount: updatedLoan.totalRepayableAmount,
        weeklyInstallment: updatedLoan.weeklyInstallment,
      });
      await installmentService.createInstallments(newInstallments);
    }

    return updatedLoan;
  }
}

export default new LoanService();
