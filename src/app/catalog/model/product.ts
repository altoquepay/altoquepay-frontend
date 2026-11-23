export interface ProductDetails {
  code: string;
  description: string;
  brand: string;
  category: string;
  unit: string;
  supplier: string | null;
  cash_price: string;
  list_price: string;
}

export interface Product extends ProductDetails {
  id: number;
  image_url: string | null;
  is_active: boolean;
}
