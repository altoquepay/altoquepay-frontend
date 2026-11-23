export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  field: string | null;
  details: { errors?: { field: string; message: string }[] } | null;
}
