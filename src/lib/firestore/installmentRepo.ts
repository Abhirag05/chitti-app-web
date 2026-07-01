import { QueryConstraint, limit, orderBy, updateDoc, where, writeBatch } from 'firebase/firestore';
import { BaseRepository } from './baseRepo';
import { Installment, InstallmentStatus } from '../../types';
import { FirestoreCollections } from './collections';

const isMissingIndexError = (error: unknown): boolean => {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const code = 'code' in error ? String((error as { code?: unknown }).code ?? '') : '';
  return code.includes('failed-precondition');
};

const byDueDateAsc = (left: Installment, right: Installment): number => left.dueDate - right.dueDate;
const byPaidAtDesc = (left: Installment, right: Installment): number => (right.paidAt ?? 0) - (left.paidAt ?? 0);

export class InstallmentRepository extends BaseRepository {
  constructor() {
    super(FirestoreCollections.Installments);
  }

  async createInstallments(installments: Installment[]): Promise<Installment[]> {
    if (installments.length === 0) {
      return [];
    }

    const batch = writeBatch(this.db);

    installments.forEach((installment) => {
      batch.set(this.docRef(installment.id), installment);
    });

    await batch.commit();

    return installments;
  }

  async getInstallmentsByLoan(ownerId: string, loanId: string): Promise<Installment[]> {
    return this.getMany<Installment>([
      where('ownerId', '==', ownerId),
      where('loanId', '==', loanId),
    ]);
  }

  async deleteInstallmentsByLoan(ownerId: string, loanId: string): Promise<void> {
    const installments = await this.getInstallmentsByLoan(ownerId, loanId);
    if (installments.length === 0) return;

    const batch = writeBatch(this.db);
    installments.forEach((installment) => {
      batch.delete(this.docRef(installment.id));
    });
    await batch.commit();
  }

  async getInstallmentsByOwnerDueDateRange(
    ownerId: string,
    startDate: number,
    endDate: number,
    statuses: InstallmentStatus[]
  ): Promise<Installment[]> {
    const constraints: QueryConstraint[] = [
      where('ownerId', '==', ownerId),
      where('dueDate', '>=', startDate),
      where('dueDate', '<=', endDate),
      orderBy('dueDate', 'asc'),
    ];

    constraints.push(...this.buildStatusConstraints(statuses));

    try {
      return await this.getMany<Installment>(constraints);
    } catch (error) {
      if (!isMissingIndexError(error)) {
        throw error;
      }

      const fallback = await this.getMany<Installment>([where('ownerId', '==', ownerId)]);
      return fallback
        .filter((installment) => installment.dueDate >= startDate && installment.dueDate <= endDate)
        .filter((installment) => statuses.length === 0 || statuses.includes(installment.status))
        .sort(byDueDateAsc);
    }
  }

  async getInstallmentsByOwnerBeforeDate(
    ownerId: string,
    beforeDate: number,
    statuses: InstallmentStatus[]
  ): Promise<Installment[]> {
    const constraints: QueryConstraint[] = [
      where('ownerId', '==', ownerId),
      where('dueDate', '<', beforeDate),
      orderBy('dueDate', 'asc'),
    ];

    constraints.push(...this.buildStatusConstraints(statuses));

    try {
      return await this.getMany<Installment>(constraints);
    } catch (error) {
      if (!isMissingIndexError(error)) {
        throw error;
      }

      const fallback = await this.getMany<Installment>([where('ownerId', '==', ownerId)]);
      return fallback
        .filter((installment) => installment.dueDate < beforeDate)
        .filter((installment) => statuses.length === 0 || statuses.includes(installment.status))
        .sort(byDueDateAsc);
    }
  }

  async getInstallmentsByOwnerAndStatuses(ownerId: string, statuses: InstallmentStatus[]): Promise<Installment[]> {
    const constraints: QueryConstraint[] = [where('ownerId', '==', ownerId)];
    constraints.push(...this.buildStatusConstraints(statuses));

    try {
      return await this.getMany<Installment>(constraints);
    } catch (error) {
      if (!isMissingIndexError(error)) {
        throw error;
      }

      const fallback = await this.getMany<Installment>([where('ownerId', '==', ownerId)]);
      return fallback.filter((installment) => statuses.length === 0 || statuses.includes(installment.status));
    }
  }

  async getRecentPaidInstallmentsByOwner(ownerId: string, maxResults = 5): Promise<Installment[]> {
    try {
      return await this.getMany<Installment>([
        where('ownerId', '==', ownerId),
        where('status', '==', 'paid'),
        orderBy('paidAt', 'desc'),
        limit(maxResults),
      ]);
    } catch (error) {
      if (!isMissingIndexError(error)) {
        throw error;
      }

      const fallback = await this.getMany<Installment>([where('ownerId', '==', ownerId)]);
      return fallback
        .filter((installment) => installment.status === 'paid' && installment.paidAt !== null)
        .sort(byPaidAtDesc)
        .slice(0, maxResults);
    }
  }

  async markPaid(installmentId: string): Promise<void> {
    await updateDoc(this.docRef(installmentId), {
      status: 'paid',
      paidAt: Date.now(),
    });
  }

  private buildStatusConstraints(statuses: InstallmentStatus[]): QueryConstraint[] {
    if (statuses.length === 0) {
      return [];
    }

    if (statuses.length === 1) {
      return [where('status', '==', statuses[0])];
    }

    return [where('status', 'in', statuses)];
  }
}

export default new InstallmentRepository();
