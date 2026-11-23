export type Role = 'SYSTEM_ADMIN' | 'STORE_ADMIN' | 'CUSTOMER';

export interface AccessToken {
  access_token: string;
  token_type: string;
  role: Role;
  must_change_password: boolean;
}

export interface CurrentUser {
  id: number;
  username: string;
  full_name: string | null;
  role: Role;
  store_id: number | null;
  customer_id: number | null;
  must_change_password: boolean;
}
