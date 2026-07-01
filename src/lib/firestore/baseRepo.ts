import { CollectionReference, DocumentData, QueryConstraint, collection, doc, getDoc, getDocs, query, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export abstract class BaseRepository {
  protected db = db;

  constructor(protected readonly collectionName: string) {}

  protected collectionRef(): CollectionReference<DocumentData> {
    return collection(this.db, this.collectionName);
  }

  protected docRef(id: string) {
    return doc(this.db, this.collectionName, id);
  }

  generateId(): string {
    return doc(this.collectionRef()).id;
  }

  async getById<T>(id: string): Promise<T | null> {
    const snapshot = await getDoc(this.docRef(id));
    if (!snapshot.exists()) {
      return null;
    }

    return snapshot.data() as T;
  }

  async save<T extends { id: string }>(record: T): Promise<T> {
    await setDoc(this.docRef(record.id), record as DocumentData);
    return record;
  }

  async getMany<T>(constraints: QueryConstraint[] = []): Promise<T[]> {
    const snapshot = await getDocs(query(this.collectionRef(), ...constraints));
    return snapshot.docs.map((documentSnapshot) => documentSnapshot.data() as T);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(this.docRef(id));
  }
}
