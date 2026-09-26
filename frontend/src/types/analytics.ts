export interface DashboardKpi {
  totalLoans: number;
  pendingLoans: number;
  activeLoans: number;
  completedLoans: number;
  rejectedLoans: number;
  totalCustomers: number;
  totalDisbursed: number;
  totalRevenue: number;
  totalOutstanding: number;
  approvalRate: number;
}

export interface TrendPoint {
  period: string;
  applications: number;
  approvals: number;
  rejections: number;
}

export interface RevenuePoint {
  period: string;
  interestRevenue: number;
  lateFees: number;
}

export interface LoanTypeBreakdown {
  code: string;
  name: string;
  count: number;
  total: number;
  approvalRate: number;
}
