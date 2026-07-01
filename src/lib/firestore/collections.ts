export const FirestoreCollections = {
  Borrowers: 'borrowers',
  Loans: 'loans',
  Installments: 'installments',
  UserFinancials: 'userFinancials',
} as const;

export type FirestoreCollectionName = (typeof FirestoreCollections)[keyof typeof FirestoreCollections];
