export type CycleStatus = 'OPEN' | 'CLOSED' | 'PAID' | 'OVERDUE';

export type PaymentKind =
  | 'CYCLE_STATEMENT'
  | 'INSTALLMENT'
  | 'INSTALLMENT_ADVANCE'
  | 'SINGLE_DATE_EARLY'
  | 'FULL_PREPAYMENT';

export interface Cycle {
  id: number;
  customer_id: number;
  year: number;
  month: number;
  cutoff_date: string;
  payment_date: string;
  status: CycleStatus;
  capital: string | null;
  ordinary_interest: string | null;
  late_interest: string | null;
  total: string | null;
}

export interface StatementPurchase {
  purchase_id: number;
  purchased_at: string;
  mode: string;
  amount: string;
  ordinary_interest: string;
  status: string;
}

export interface Statement {
  cycle_id: number;
  customer_id: number;
  year: number;
  month: number;
  cutoff_date: string;
  payment_date: string;
  status: CycleStatus;
  capital: string;
  ordinary_interest: string;
  late_interest: string;
  total: string;
  purchases: StatementPurchase[];
}

export interface PaymentTarget {
  kind: PaymentKind;
  cycle_id?: number | null;
  installment_id?: number | null;
  purchase_id?: number | null;
}

export interface RegisterPayment extends PaymentTarget {
  amount: string;
}

export interface PaymentQuote {
  kind: PaymentKind;
  customer_id: number;
  paid_on: string;
  cycle_id: number | null;
  installment_id: number | null;
  purchase_id: number | null;
  late_interest: string;
  ordinary_interest: string;
  principal: string;
  total: string;
  savings: string;
  days_late: number;
  interest_days: number | null;
}

export interface Payment {
  id: number;
  customer_id: number;
  kind: PaymentKind;
  paid_on: string;
  cycle_id: number | null;
  installment_id: number | null;
  purchase_id: number | null;
  late_interest: string;
  ordinary_interest: string;
  principal: string;
  total: string;
  savings: string;
  created_at: string;
}
