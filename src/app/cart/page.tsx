"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { formatPrice, calculateDiscount } from "@/lib/utils";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getSubtotal, getTotal, getItemCount } = useCartStore();
  const subtotal = getSubtotal();
  const total = getTotal();
  const shipping = subtotal > 100 ? 0 : 9.99;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Looks like you haven't added anything to your cart yet."
        actionLabel="Start Shopping"
        actionHref="/shop"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Shopping Cart ({getItemCount()} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const price = calculateDiscount(item.price, item.discount);
            return (
              <div key={item.productId} className="flex gap-3 sm:gap-4 p-3 sm:p-4 border border-border">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-muted shrink-0">
                  <Image src={item.image} alt={item.title} fill className="object-cover" />
                </div>
                <div className="flex-1">
                  <Link href={`/product/${item.productId}`} className="font-medium hover:underline">
                    {item.title}
                  </Link>
                  <p className="text-sm font-semibold mt-1">{formatPrice(price)}</p>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center border border-neutral-300">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 hover:bg-neutral-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 hover:bg-neutral-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-neutral-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="font-semibold">{formatPrice(price * item.quantity)}</p>
              </div>
            );
          })}
        </div>

        <div className="border border-neutral-200 p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-500">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Shipping</span>
              <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
            </div>
            {subtotal < 100 && (
              <p className="text-xs text-neutral-400">
                Add {formatPrice(100 - subtotal)} more for free shipping
              </p>
            )}
            <div className="border-t border-neutral-200 pt-3 flex justify-between font-semibold text-base">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
          <Link href="/checkout" className="block mt-6">
            <Button className="w-full" size="lg">Proceed to Checkout</Button>
          </Link>
          <Link href="/shop" className="block text-center text-sm text-neutral-500 hover:text-black mt-4">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
