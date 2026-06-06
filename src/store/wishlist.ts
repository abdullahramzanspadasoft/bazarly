import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WishlistItem } from "@/types";

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  syncAddToDb: (item: WishlistItem) => Promise<void>;
  syncRemoveFromDb: (productId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get();
        if (!items.find((i) => i.productId === item.productId)) {
          set({ items: [...items, item] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      clearWishlist: () => set({ items: [] }),

      syncAddToDb: async (item) => {
        try {
          await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
        } catch {
          // local state already updated
        }
      },

      syncRemoveFromDb: async (productId) => {
        try {
          await fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`, {
            method: "DELETE",
          });
        } catch {
          // local state already updated
        }
      },
    }),
    { name: "bazaarly-wishlist" }
  )
);
