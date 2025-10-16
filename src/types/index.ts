export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  image_url: string | null;
  category: string | null;
}