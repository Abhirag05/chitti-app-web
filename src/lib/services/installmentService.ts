import installmentRepository from '../firestore/installmentRepo';
import { Installment, InstallmentCreateInput, InstallmentWithStatus } from '../../types';
import { normalizeDate } from '../../utils/dateHelpers';

const roundToTwo = (value: number): number => Math.round(value * 100) / 100;

const getEffectiveStatus = (installment: Installment): InstallmentWithStatus['effectiveStatus'] => {
  if (installment.status === 'paid') {
    return 'paid';
  }

  return normalizeDate(Date.now()) > normalizeDate(installment.dueDate) ? 'overdue' : 'pending';
};

class InstallmentService {
  generateInstallments(input: InstallmentCreateInput): Installment[] {
    const installments: Installment[] = [];
    const baseInstallment = roundToTwo(input.weeklyInstallment);

    for (let weekNumber = 1; weekNumber <= input.numberOfWeeks; weekNumber += 1) {
      const dueDate = new Date(input.firstDueDate);
      dueDate.setDate(dueDate.getDate() + (weekNumber - 1) * 7);

      const amount =
        weekNumber === input.numberOfWeeks
          ? roundToTwo(input.totalRepayableAmount - baseInstallment * (input.numberOfWeeks - 1))
          : baseInstallment;

      installments.push({
        id: installmentRepository.generateId(),
        loanId: input.loanId,
        borrowerId: input.borrowerId,
        borrowerName: input.borrowerName,
        ownerId: input.ownerId,
        weekNumber,
        dueDate: dueDate.getTime(),
        amount,
        status: 'pending',
        paidAt: null,
      });
    }

    return installments;
  }

  async createInstallments(installments: Installment[]): Promise<Installment[]> {
    return installmentRepository.createInstallments(installments);
  }

  async getInstallmentsByLoan(ownerId: string, loanId: string): Promise<InstallmentWithStatus[]> {
    const installments = await installmentRepository.getInstallmentsByLoan(ownerId, loanId);

    return installments
      .sort((left, right) => left.weekNumber - right.weekNumber)
      .map((installment) => ({
        ...installment,
        effectiveStatus: getEffectiveStatus(installment),
      }));
  }

  async markInstallmentAsPaid(installmentId: string): Promise<void> {
    await installmentRepository.markPaid(installmentId);
  }

  getEffectiveStatus(installment: Installment): InstallmentWithStatus['effectiveStatus'] {
    return getEffectiveStatus(installment);
  }
}

export default new InstallmentService();
