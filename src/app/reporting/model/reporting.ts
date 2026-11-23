export interface PurchaseTotals {
  count: number;
  amount: string;
  ordinary_interest: string;
  single_date_count: number;
  weekly_count: number;
}

export interface PaymentTotals {
  count: number;
  total: string;
  principal: string;
  ordinary_interest: string;
  late_interest: string;
  savings: string;
}

export interface ReportBcrpCap {
  max_tea: string;
  max_late_tea: string;
  valid_from: string;
  valid_to: string;
}

export interface UpcomingDue {
  type: string; // INSTALLMENT | CYCLE
  account_id: number;
  customer_name: string;
  due_date: string;
  amount: string;
}

export interface Dashboard {
  active_customers: number;
  outstanding_principal: string;
  overdue_installments: number;
  overdue_statements: number;
  overdue_amount: string;
  purchases_this_month: PurchaseTotals;
  payments_this_month: PaymentTotals;
  bcrp_cap: ReportBcrpCap | null;
  upcoming: UpcomingDue[];
  next_cutoff: string | null;
}

export interface PeriodReport {
  from_date: string;
  to_date: string;
  purchases: PurchaseTotals;
  payments: PaymentTotals;
}

export interface CustomerStore {
  store_id: number;
  business_name: string;
  store_status: string;
  account_status: string;
}

export interface PortalInstallment {
  installment_id: number;
  purchase_id: number;
  number: number;
  due_date: string;
  amount: string;
  status: string;
}

export interface AccountOverview {
  store_id: number;
  business_name: string;
  account_status: string;
  credit_limit: string;
  outstanding_principal: string;
  available_credit: string;
  tea: string;
  late_tea: string;
  cutoff_day: number;
  payment_day: number;
  max_weeks: number;
  installments: PortalInstallment[];
}

export interface PortalPurchase {
  purchase_id: number;
  purchased_at: string;
  mode: string;
  amount: string;
  tea: string;
  term_days: number | null;
  installments_count: number | null;
  installment_amount: string | null;
  ordinary_interest: string;
  status: string;
}

export interface PurchaseSchedule {
  purchase: PortalPurchase;
  installments: PortalInstallment[];
}

export interface CycleStatement {
  cycle_id: number;
  year: number;
  month: number;
  cutoff_date: string;
  payment_date: string;
  status: string;
  capital: string;
  ordinary_interest: string;
  late_interest: string;
  total: string;
}
