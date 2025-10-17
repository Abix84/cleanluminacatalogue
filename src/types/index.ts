export interface UtilityCategory {
  id: string;
  name: string;
  color: string;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  utilityCategoryId: string | null;
  brandId: string | null;
}