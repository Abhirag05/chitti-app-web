import { BaseRepository } from './baseRepo';
import { UserFinancials } from '../../types';
import { FirestoreCollections } from './collections';
import { setDoc, getDoc } from 'firebase/firestore';

export class FinancialsRepository extends BaseRepository {
  constructor() {
    super(FirestoreCollections.UserFinancials);
  }

  async getFinancials(userId: string): Promise<UserFinancials | null> {
    const snapshot = await getDoc(this.docRef(userId));
    if (!snapshot.exists()) {
      return null;
    }
    return snapshot.data() as UserFinancials;
  }

  async saveFinancials(financials: UserFinancials): Promise<UserFinancials> {
    if (!financials.userId) {
      throw new Error('UserId is required');
    }
    await setDoc(this.docRef(financials.userId), financials);
    return financials;
  }
}

export default new FinancialsRepository();
