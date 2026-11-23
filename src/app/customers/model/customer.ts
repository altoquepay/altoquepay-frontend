export type AccountStatus = 'ACTIVE' | 'INACTIVE';

export interface CustomerAccount {
  id: number; // id de la cuenta en la bodega
  customer_id: number; // id de la persona
  dni: string;
  first_names: string;
  last_names: string;
  phone: string | null;
  address: string | null;
  credit_limit: string;
  cutoff_day: number;
  payment_day: number;
  tea: string;
  late_tea: string;
  max_weeks: number;
  status: AccountStatus;
  portal_linked: boolean;
  created_at: string;
}

export interface OpenAccount {
  dni: string;
  first_names: string;
  last_names: string;
  phone?: string | null;
  address?: string | null;
  credit_limit: string;
  cutoff_day?: number | null;
  payment_day?: number | null;
  tea?: string | null;
  late_tea?: string | null;
  max_weeks?: number | null;
}

export interface UpdateAccount {
  first_names: string;
  last_names: string;
  phone: string | null;
  address: string | null;
  credit_limit: string;
  cutoff_day: number;
  payment_day: number;
  tea: string;
  late_tea: string;
  max_weeks: number;
}

export interface OpenedAccount {
  account: CustomerAccount;
  access_code: AccessCode;
}

export interface PersonLookup {
  customer_id: number;
  dni: string;
  account_id: number | null;
  notice: string | null;
}

export interface AccessCode {
  code: string;
  expires_at: string;
}
