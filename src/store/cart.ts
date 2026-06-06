import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/types";
import { calculateDiscount } from "@/lib/utils";

interface CartStore {
  items: CartItem[];
  couponCode: string;
  couponDiscount: number;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (code: string, discount: number) => void;
  clearCoupon: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
  clearCartInDb: () => Promise<void>;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: "",
      couponDiscount: 0,

      addItem: (item) => {
        const { items } = get();
        const existing = items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: Math.min(i.quantity + (item.quantity || 1), i.stock) }
                : i
            ),
          });
        } else {
          set({ items: [...items, { ...item, quantity: item.quantity || 1 }] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [], couponCode: "", couponDiscount: 0 }),

      clearCartInDb: async () => {
        try {
          await fetch("/api/cart", { method: "DELETE" });
        } catch {
          // local cart already cleared
        }
      },

      setCoupon: (code, discount) => set({ couponCode: code, couponDiscount: discount }),

      clearCoupon: () => set({ couponCode: "", couponDiscount: 0 }),

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = calculateDiscount(item.price, item.discount);
          return sum + price * item.quantity;
        }, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().couponDiscount;
        const shipping = subtotal > 100 ? 0 : 9.99;
        return Math.max(0, subtotal - discount + shipping);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    { name: "bazaarly-cart" }
  )
);
