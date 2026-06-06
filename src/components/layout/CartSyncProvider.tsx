"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { cartItemToPayload, mapDbCartItem, mapDbWishlistItem } from "@/lib/cart-sync";

function debounce<T extends (...args: never[]) => void>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

export default function CartSyncProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const syncedRef = useRef(false);
  const syncingRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) {
      syncedRef.current = false;
      return;
    }

    if (syncedRef.current) return;

    const loadFromDb = async () => {
      syncingRef.current = true;
      try {
        const localCart = useCartStore.getState();
        const localWishlist = useWishlistStore.getState();

        const cartRes = await fetch("/api/cart");
        const cartData = cartRes.ok ? await cartRes.json() : null;

        if (localCart.items.length > 0) {
          await fetch("/api/cart", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: localCart.items.map(cartItemToPayload),
              couponCode: localCart.couponCode,
              couponDiscount: localCart.couponDiscount,
              merge: true,
            }),
          });
        }

        const refreshedCart = await fetch("/api/cart").then((r) => r.json());
        if (refreshedCart.cart?.items) {
          useCartStore.setState({
            items: refreshedCart.cart.items.map(mapDbCartItem),
            couponCode: refreshedCart.cart.couponCode || "",
            couponDiscount: refreshedCart.cart.couponDiscount || 0,
          });
        } else if (cartData?.cart?.items) {
          useCartStore.setState({
            items: cartData.cart.items.map(mapDbCartItem),
            couponCode: cartData.cart.couponCode || "",
            couponDiscount: cartData.cart.couponDiscount || 0,
          });
        }

        for (const item of localWishlist.items) {
          await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item),
          });
        }

        const wishlistRes = await fetch("/api/wishlist");
        if (wishlistRes.ok) {
          const wishlistData = await wishlistRes.json();
          if (wishlistData.items) {
            useWishlistStore.setState({
              items: wishlistData.items.map(mapDbWishlistItem),
            });
          }
        }

        syncedRef.current = true;
      } catch {
        // keep local data if sync fails
      } finally {
        syncingRef.current = false;
      }
    };

    loadFromDb();
  }, [session?.user?.id, status]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const syncCart = debounce(async () => {
      if (syncingRef.current) return;
      const { items, couponCode, couponDiscount } = useCartStore.getState();
      try {
        await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map(cartItemToPayload),
            couponCode,
            couponDiscount,
          }),
        });
      } catch {
        // silent fail
      }
    }, 400);

    const unsubCart = useCartStore.subscribe((state, prev) => {
      if (
        state.items !== prev.items ||
        state.couponCode !== prev.couponCode ||
        state.couponDiscount !== prev.couponDiscount
      ) {
        if (syncedRef.current) syncCart();
      }
    });

    return unsubCart;
  }, [session?.user?.id, status]);

  return <>{children}</>;
}
