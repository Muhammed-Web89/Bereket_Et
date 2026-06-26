import { create } from 'zustand';
import { Product, CartItem } from '../types';

interface CartState {
  cart: CartItem[];
  isCartOpen: boolean;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getTotalAmount: () => number;
  getTotalCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  isCartOpen: false,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  setCartOpen: (open) => set({ isCartOpen: open }),
  addToCart: (product) => set((state) => {
    const exists = state.cart.find((item) => item.product.id === product.id);
    if (exists) {
      return {
        cart: state.cart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    return { cart: [...state.cart, { product, quantity: 1 }] };
  }),
  updateQuantity: (productId, quantity) => set((state) => {
    if (quantity <= 0) {
      return { cart: state.cart.filter((item) => item.product.id !== productId) };
    }
    return {
      cart: state.cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    };
  }),
  clearCart: () => set({ cart: [] }),
  getCartTotal: () => {
    return get().cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },
  getTotalAmount: () => {
    return get().cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },
  getTotalCount: () => {
    return get().cart.reduce((count, item) => count + item.quantity, 0);
  },
}));

export const addProductToCart = (product: Product) => useCartStore.getState().addToCart(product);
