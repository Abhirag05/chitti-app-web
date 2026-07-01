import borrowerRepository from '../firestore/borrowerRepo';
import loanService from './loanService';
import { Borrower, BorrowerCreateInput, BorrowerSummary } from '../../types';

const normalizePhoneNumber = (value: string): string => value.replace(/\D/g, '');

class BorrowerService {
  async createBorrower(ownerId: string, input: BorrowerCreateInput): Promise<Borrower> {
    const now = Date.now();
    const borrower: Borrower = {
      id: borrowerRepository.generateId(),
      ownerId,
      fullName: input.fullName.trim(),
      phoneNumber: normalizePhoneNumber(input.phoneNumber),
      address: input.address.trim(),
      reference: input.reference.trim(),
      createdAt: now,
    };

    return borrowerRepository.createBorrower(borrower);
  }

  async getBorrowersByUser(ownerId: string): Promise<Borrower[]> {
    return borrowerRepository.getBorrowersByOwner(ownerId);
  }

  async findBorrowerByPhone(ownerId: string, phoneNumber: string): Promise<Borrower | null> {
    return borrowerRepository.findByPhone(ownerId, normalizePhoneNumber(phoneNumber));
  }

  async getBorrowerById(ownerId: string, borrowerId: string): Promise<Borrower | null> {
    return borrowerRepository.getBorrowerById(ownerId, borrowerId);
  }

  async getBorrowersByUserWithSummary(ownerId: string): Promise<BorrowerSummary[]> {
    const borrowers = await this.getBorrowersByUser(ownerId);

    const summaries = await Promise.all(
      borrowers.map(async (borrower) => {
        const loans = await loanService.getLoansByBorrower(ownerId, borrower.id);
        const totalActiveLoansCount = loans.filter((loan) => loan.status === 'active').length;
        const totalOutstandingAmount = loans.reduce((total, loan) => total + loan.outstandingAmount, 0);

        return {
          ...borrower,
          totalActiveLoansCount,
          totalOutstandingAmount,
        };
      })
    );

    return summaries.sort((left, right) => right.createdAt - left.createdAt);
  }
  
  async updateBorrower(ownerId: string, borrowerId: string, input: BorrowerCreateInput): Promise<Borrower> {
    const existing = await this.getBorrowerById(ownerId, borrowerId);
    if (!existing) {
      throw new Error('Borrower not found or access denied');
    }

    const updatedBorrower: Borrower = {
      ...existing,
      fullName: input.fullName.trim(),
      phoneNumber: normalizePhoneNumber(input.phoneNumber),
      address: input.address.trim(),
      reference: input.reference.trim(),
    };

    return borrowerRepository.createBorrower(updatedBorrower);
  }

  async deleteBorrower(ownerId: string, borrowerId: string): Promise<void> {
    const borrower = await this.getBorrowerById(ownerId, borrowerId);
    if (!borrower) {
      throw new Error('Borrower not found or access denied');
    }

    const loans = await loanService.getLoansByBorrower(ownerId, borrowerId);

    // Delete all loans associated with this borrower
    await Promise.all(loans.map((loan) => loanService.deleteLoan(ownerId, loan.id)));

    // Delete the borrower
    await borrowerRepository.deleteBorrower(borrowerId);
  }
}

export default new BorrowerService();
