export type StoreStatus = 'ACTIVE' | 'INACTIVE';

export interface Store {
  id: number;
  business_name: string;
  ruc: string;
  address: string | null;
  phone: string | null;
  status: StoreStatus;
  registered_at: string;
  default_cutoff_day: number;
  default_payment_day: number;
  default_tea: string;
  default_late_tea: string;
  default_max_weeks: number;
}

export interface StoreListItem {
  id: number;
  business_name: string;
  ruc: string;
  status: StoreStatus;
  registered_at: string;
  customers_count: number;
}

export interface RegisterStore {
  business_name: string;
  ruc: string;
  full_name: string;
  email: string;
  password: string;
}

export interface UpdateStoreProfile {
  business_name: string;
  address: string | null;
  phone: string | null;
  default_cutoff_day: number;
  default_payment_day: number;
  default_tea: string;
  default_late_tea: string;
  default_max_weeks: number;
}
