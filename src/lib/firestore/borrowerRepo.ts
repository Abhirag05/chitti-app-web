import { QueryConstraint, orderBy, where } from 'firebase/firestore';
import { BaseRepository } from './baseRepo';
import { Borrower } from '../../types';
import { FirestoreCollections } from './collections';

export class BorrowerRepository extends BaseRepository {
  constructor() {
    super(FirestoreCollections.Borrowers);
  }

  async createBorrower(borrower: Borrower): Promise<Borrower> {
    return this.save(borrower);
  }

  async getBorrowersByOwner(ownerId: string): Promise<Borrower[]> {
    const constraints: QueryConstraint[] = [
      where('ownerId', '==', ownerId),
      orderBy('fullName', 'asc'),
    ];

    try {
      return await this.getMany<Borrower>(constraints);
    } catch (error) {
      // Fallback if composite index is missing
      const fallback = await this.getMany<Borrower>([where('ownerId', '==', ownerId)]);
      return fallback.sort((a, b) => a.fullName.localeCompare(b.fullName));
    }
  }

  async findByPhone(ownerId: string, phoneNumber: string): Promise<Borrower | null> {
    const constraints: QueryConstraint[] = [
      where('ownerId', '==', ownerId),
      where('phoneNumber', '==', phoneNumber),
    ];
    const results = await this.getMany<Borrower>(constraints);
    return results.length > 0 ? results[0] : null;
  }

  async getBorrowerById(ownerId: string, borrowerId: string): Promise<Borrower | null> {
    const borrower = await this.getById<Borrower>(borrowerId);
    if (!borrower || borrower.ownerId !== ownerId) {
      return null;
    }
    return borrower;
  }

  async deleteBorrower(borrowerId: string): Promise<void> {
    await this.delete(borrowerId);
  }
}

export default new BorrowerRepository();
