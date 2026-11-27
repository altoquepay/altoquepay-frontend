export type PaymentMode = 'SINGLE_DATE' | 'WEEKLY';

export type PurchaseStatus = 'ACTIVE' | 'PAID' | 'PREPAID' | 'VOIDED';

export type InstallmentStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'OVERDUE';

export interface RequestedItem {
  product_id: number;
  quantity: number;
}

export interface RegisterPurchase {
  customer_id: number; // id de la CUENTA
  purchased_at: string;
  mode: PaymentMode;
  installments_count?: number | null;
  /** Solo en cuotas: semanas de gracia total antes de las cuotas (0 = sin gracia). */
  grace_weeks?: number;
  items: RequestedItem[];
}

export interface Installment {
  id: number | null;
  number: number;
  due_date: string;
  opening_balance: string;
  interest: string;
  amortization: string;
  amount: string;
  closing_balance: string;
  status: InstallmentStatus;
}

export interface InstallmentListItem extends Installment {
  purchase_id: number;
  customer_id: number;
}

export interface PurchaseItem {
  product_id: number;
  quantity: number;
  unit_list_price: string;
  subtotal: string;
}

export interface Purchase {
  id: number | null;
  customer_id: number;
  cycle_id: number;
  purchased_at: string;
  mode: PaymentMode;
  amount: string;
  tea: string;
  late_tea: string;
  term_days: number | null;
  grace_days: number | null;
  grace_weeks: number | null;
  capitalized_amount: string | null;
  weekly_rate: string | null;
  installments_count: number | null;
  installment_amount: string | null;
  ordinary_interest: string;
  total: string;
  status: PurchaseStatus;
  voided_at: string | null;
  voided_by: number | null;
}

/** Semana de gracia total: no se paga y su interés se suma al saldo. */
export interface GracePeriod {
  number: number;
  end_date: string;
  opening_balance: string;
  interest: string;
  closing_balance: string;
}

export interface PurchaseDetail extends Purchase {
  items: PurchaseItem[];
  grace_periods: GracePeriod[];
  installments: Installment[];
}
