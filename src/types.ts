export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  unit: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
