import installmentRepository from '../firestore/installmentRepo';
import loanRepository from '../firestore/loanRepo';
import {
  DashboardStats,
  Installment,
  InstallmentStatus,
  InstallmentTrackingItem,
} from '../../types';
import {
  TimestampRange,
  addDays,
  differenceInDays,
  endOfDay,
  getTodayRange,
  normalizeDate,
} from '../../utils/dateHelpers';
import installmentService from './installmentService';
import financialsService from './financialsService';

const OUTSTANDING_STATUSES: InstallmentStatus[] = ['pending', 'overdue'];

class TrackingService {
  async getDashboardStats(userId: string): Promise<DashboardStats> {
    const [loans, dueTodayInstallments, overdueInstallments, outstandingInstallments, recentPaid, financials] = await Promise.all([
      loanRepository.getLoansByOwner(userId),
      this.getDueTodayInstallments(userId),
      this.getOverdueInstallments(userId),
      installmentRepository.getInstallmentsByOwnerAndStatuses(userId, OUTSTANDING_STATUSES),
      installmentRepository.getRecentPaidInstallmentsByOwner(userId, 5),
      financialsService.getOrInitialize(userId),
    ]);

    const totalActiveLoans = loans.filter((loan) => loan.status === 'active').length;
    const completedLoansCount = loans.filter((loan) => loan.status === 'completed').length;
    const totalOutstandingAmount = outstandingInstallments.reduce((total, installment) => total + installment.amount, 0);
    const totalProfit = loans.reduce((total, loan) => total + loan.profitAmount, 0);

    return {
      totalActiveLoans,
      totalOutstandingAmount,
      totalProfit,
      dueTodayCount: dueTodayInstallments.length,
      overdueCount: overdueInstallments.length,
      completedLoansCount,
      currentBalance: financials.currentBalance,
      totalAccumulatedAmount: financials.totalAccumulatedAmount,
      recentPayments: recentPaid.map((installment) => this.mapInstallment(installment)),
    };
  }

  async getDueTodayInstallments(userId: string): Promise<InstallmentTrackingItem[]> {
    const todayRange = getTodayRange();
    const installments = await installmentRepository.getInstallmentsByOwnerDueDateRange(
      userId,
      todayRange.startDate,
      todayRange.endDate,
      OUTSTANDING_STATUSES
    );

    return installments
      .map((installment) => this.mapInstallment(installment))
      .filter((installment) => installment.effectiveStatus !== 'paid')
      .sort((left, right) => left.dueDate - right.dueDate);
  }

  async getOverdueInstallments(userId: string): Promise<InstallmentTrackingItem[]> {
    const { startDate } = getTodayRange();
    const installments = await installmentRepository.getInstallmentsByOwnerBeforeDate(
      userId,
      startDate,
      OUTSTANDING_STATUSES
    );

    return installments
      .map((installment) => this.mapInstallment(installment))
      .filter((installment) => installment.effectiveStatus === 'overdue')
      .sort((left, right) => left.dueDate - right.dueDate);
  }

  async getUpcomingInstallments(userId: string, dateRange: TimestampRange): Promise<InstallmentTrackingItem[]> {
    const today = normalizeDate(Date.now());
    const installments = await installmentRepository.getInstallmentsByOwnerDueDateRange(
      userId,
      dateRange.startDate,
      dateRange.endDate,
      OUTSTANDING_STATUSES
    );

    return installments
      .map((installment) => this.mapInstallment(installment))
      .filter((installment) => installment.effectiveStatus === 'pending' && installment.dueDate > today)
      .sort((left, right) => left.dueDate - right.dueDate);
  }

  getTomorrowRange(): TimestampRange {
    const tomorrow = addDays(Date.now(), 1);
    return {
      startDate: tomorrow,
      endDate: addDays(tomorrow, 1) - 1,
    };
  }

  getNextDaysRange(days: number): TimestampRange {
    const tomorrow = addDays(Date.now(), 1);
    return {
      startDate: tomorrow,
      endDate: endOfDay(addDays(Date.now(), days)),
    };
  }

  private mapInstallment(installment: Installment): InstallmentTrackingItem {
    return {
      ...installment,
      effectiveStatus: installmentService.getEffectiveStatus(installment),
      daysOverdue: differenceInDays(Date.now(), installment.dueDate),
      loanReference: `LN-${installment.loanId.slice(-6).toUpperCase()}`,
    };
  }
}

export default new TrackingService();
