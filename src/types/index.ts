export type Borrower = {
  id: string;
  ownerId: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  reference: string;
  createdAt: number;
};

export type BorrowerCreateInput = {
  fullName: string;
  phoneNumber: string;
  address: string;
  reference: string;
};

export type LoanStatus = 'active' | 'completed';

export type Loan = {
  id: string;
  borrowerId: string;
  borrowerName: string;
  ownerId: string;
  principalAmount: number;
  totalRepayableAmount: number;
  profitAmount: number;
  numberOfWeeks: number;
  weeklyInstallment: number;
  startDate: number;
  firstDueDate: number;
  notes: string;
  status: LoanStatus;
  createdAt: number;
  /** How much of the principal was funded from collected balance (vs external capital). Defaults to 0 for legacy loans. */
  amountFundedFromBalance: number;
};

export type LoanCreateInput = {
  borrowerId: string;
  borrowerName: string;
  ownerId: string;
  principalAmount: number;
  totalRepayableAmount: number;
  numberOfWeeks: number;
  startDate: number;
  firstDueDate: number;
  notes?: string;
};

export type LoanSummary = {
  profitAmount: number;
  weeklyInstallment: number;
};

export type InstallmentStatus = 'pending' | 'paid' | 'overdue';

export type Installment = {
  id: string;
  loanId: string;
  borrowerId: string;
  borrowerName: string;
  ownerId: string;
  weekNumber: number;
  dueDate: number;
  amount: number;
  status: InstallmentStatus;
  paidAt: number | null;
};

export type InstallmentCreateInput = {
  loanId: string;
  borrowerId: string;
  borrowerName: string;
  ownerId: string;
  numberOfWeeks: number;
  firstDueDate: number;
  totalRepayableAmount: number;
  weeklyInstallment: number;
};

export type UserFinancials = {
  userId: string;
  currentBalance: number;
  totalAccumulatedAmount: number;
  lastUpdatedAt: number;
};

export type BorrowerSummary = Borrower & {
  totalActiveLoansCount: number;
  totalOutstandingAmount: number;
};

export type LoanProgress = {
  completedWeeks: number;
  pendingWeeks: number;
  overdueWeeks: number;
  outstandingAmount: number;
};

export type LoanWithProgress = Loan & LoanProgress;

export type InstallmentWithStatus = Installment & {
  effectiveStatus: InstallmentStatus;
};

export type LoanDetailView = {
  loan: LoanWithProgress;
  installments: InstallmentWithStatus[];
};

export type InstallmentTrackingItem = InstallmentWithStatus & {
  daysOverdue: number;
  loanReference: string;
};

export type DashboardStats = {
  totalActiveLoans: number;
  totalOutstandingAmount: number;
  totalProfit: number;
  dueTodayCount: number;
  overdueCount: number;
  completedLoansCount: number;
  currentBalance: number;
  totalAccumulatedAmount: number;
  recentPayments: InstallmentTrackingItem[];
};
