export interface BcrpCap {
  id: number;
  max_tea: string;
  max_late_tea: string;
  valid_from: string;
  valid_to: string;
}

export interface RegisterBcrpCap {
  max_tea: string;
  valid_from: string;
  valid_to: string;
}
