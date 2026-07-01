import financialsRepository from '../firestore/financialsRepo';
import loanRepository from '../firestore/loanRepo';
import installmentRepository from '../firestore/installmentRepo';
import { UserFinancials } from '../../types';

const roundToTwo = (value: number): number => Math.round(value * 100) / 100;

class FinancialsService {
  async getOrInitialize(userId: string): Promise<UserFinancials> {
    const existing = await financialsRepository.getFinancials(userId);
    if (existing) {
      return existing;
    }

    return this.initializeFromExistingData(userId);
  }

  async onInstallmentPaid(userId: string, amount: number): Promise<void> {
    const financials = await this.getOrInitialize(userId);

    financials.currentBalance = roundToTwo(financials.currentBalance + amount);
    financials.lastUpdatedAt = Date.now();

    await financialsRepository.saveFinancials(financials);
  }

  async onLoanCreated(userId: string, principalAmount: number, profitAmount: number): Promise<number> {
    const financials = await this.getOrInitialize(userId);

    const amountFromBalance = roundToTwo(Math.min(financials.currentBalance, principalAmount));
    const newExternalCapital = roundToTwo(principalAmount - amountFromBalance);

    financials.currentBalance = roundToTwo(financials.currentBalance - amountFromBalance);
    financials.totalAccumulatedAmount = roundToTwo(
      financials.totalAccumulatedAmount + newExternalCapital + profitAmount
    );
    financials.lastUpdatedAt = Date.now();

    await financialsRepository.saveFinancials(financials);

    return amountFromBalance;
  }

  async onLoanDeleted(
    userId: string,
    principalAmount: number,
    profitAmount: number,
    amountFundedFromBalance: number
  ): Promise<void> {
    const financials = await this.getOrInitialize(userId);

    const newExternalCapital = roundToTwo(principalAmount - amountFundedFromBalance);

    financials.currentBalance = roundToTwo(financials.currentBalance + amountFundedFromBalance);
    financials.totalAccumulatedAmount = roundToTwo(
      financials.totalAccumulatedAmount - newExternalCapital - profitAmount
    );
    financials.totalAccumulatedAmount = Math.max(0, financials.totalAccumulatedAmount);
    financials.lastUpdatedAt = Date.now();

    await financialsRepository.saveFinancials(financials);
  }

  private async initializeFromExistingData(userId: string): Promise<UserFinancials> {
    const [loans, paidInstallments] = await Promise.all([
      loanRepository.getLoansByOwner(userId),
      installmentRepository.getInstallmentsByOwnerAndStatuses(userId, ['paid']),
    ]);

    const totalPaidAmount = roundToTwo(
      paidInstallments.reduce((total, installment) => total + installment.amount, 0)
    );

    const totalPrincipalDisbursed = roundToTwo(
      loans.reduce((total, loan) => total + loan.principalAmount, 0)
    );

    const totalAccumulatedAmount = roundToTwo(
      loans.reduce((total, loan) => total + loan.principalAmount + loan.profitAmount, 0)
    );

    const currentBalance = Math.max(0, roundToTwo(totalPaidAmount - totalPrincipalDisbursed));

    const financials: UserFinancials = {
      userId,
      currentBalance,
      totalAccumulatedAmount,
      lastUpdatedAt: Date.now(),
    };

    await financialsRepository.saveFinancials(financials);

    return financials;
  }

  async setManualValue(
    userId: string,
    field: 'currentBalance' | 'totalAccumulatedAmount',
    value: number
  ): Promise<void> {
    const financials = await this.getOrInitialize(userId);

    financials[field] = roundToTwo(Math.max(0, value));
    financials.lastUpdatedAt = Date.now();

    await financialsRepository.saveFinancials(financials);
  }
}

export default new FinancialsService();
