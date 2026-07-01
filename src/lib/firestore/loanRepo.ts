import { QueryConstraint, orderBy, updateDoc, where } from 'firebase/firestore';
import { BaseRepository } from './baseRepo';
import { Loan, LoanStatus } from '../../types';
import { FirestoreCollections } from './collections';

export class LoanRepository extends BaseRepository {
  constructor() {
    super(FirestoreCollections.Loans);
  }

  async createLoan(loan: Loan): Promise<Loan> {
    return this.save(loan);
  }

  async getLoansByOwner(ownerId: string): Promise<Loan[]> {
    const constraints: QueryConstraint[] = [
      where('ownerId', '==', ownerId),
      orderBy('createdAt', 'desc'),
    ];

    try {
      return await this.getMany<Loan>(constraints);
    } catch (error) {
      const fallback = await this.getMany<Loan>([where('ownerId', '==', ownerId)]);
      return fallback.sort((a, b) => b.createdAt - a.createdAt);
    }
  }

  async getLoansByOwnerAndBorrower(ownerId: string, borrowerId: string): Promise<Loan[]> {
    const constraints: QueryConstraint[] = [
      where('ownerId', '==', ownerId),
      where('borrowerId', '==', borrowerId),
      orderBy('createdAt', 'desc'),
    ];

    try {
      return await this.getMany<Loan>(constraints);
    } catch (error) {
      const fallback = await this.getMany<Loan>([
        where('ownerId', '==', ownerId),
        where('borrowerId', '==', borrowerId),
      ]);
      return fallback.sort((a, b) => b.createdAt - a.createdAt);
    }
  }

  async getLoanById(ownerId: string, loanId: string): Promise<Loan | null> {
    const loan = await this.getById<Loan>(loanId);
    if (!loan || loan.ownerId !== ownerId) {
      return null;
    }
    return loan;
  }

  async updateLoanStatus(loanId: string, status: LoanStatus): Promise<void> {
    await updateDoc(this.docRef(loanId), { status });
  }

  async deleteLoan(loanId: string): Promise<void> {
    await this.delete(loanId);
  }
}

export default new LoanRepository();
