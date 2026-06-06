"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatPrice } from "@/lib/utils";

interface CartRecord {
  _id: string;
  user: { name: string; email: string };
  items: Array<{
    title: string;
    quantity: number;
    price: number;
    discount: number;
  }>;
  couponCode?: string;
  couponDiscount?: number;
  updatedAt: string;
}

export default function AdminCartsPage() {
  const [carts, setCarts] = useState<CartRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/carts")
      .then((r) => r.json())
      .then((data) => setCarts(data.carts || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-16" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">User Carts</h1>
      <p className="text-sm text-neutral-500 mb-6">
        MongoDB <code className="text-xs bg-neutral-100 px-1">carts</code> collection — add to cart data
      </p>

      {carts.length === 0 ? (
        <div className="border border-neutral-200 p-12 text-center text-neutral-500">
          <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No carts in database yet</p>
        </div>
      ) : (
        <div className="border border-neutral-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Items</th>
                <th className="text-left p-3">Coupon</th>
                <th className="text-left p-3">Est. Total</th>
                <th className="text-left p-3">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {carts.map((cart) => {
                const subtotal = cart.items.reduce(
                  (sum, item) => sum + (item.price - (item.price * item.discount) / 100) * item.quantity,
                  0
                );
                const total = Math.max(0, subtotal - (cart.couponDiscount || 0) + (subtotal > 100 ? 0 : 9.99));

                return (
                  <tr key={cart._id} className="border-t border-neutral-200">
                    <td className="p-3">
                      <p className="font-medium">{cart.user?.name || "—"}</p>
                      <p className="text-xs text-neutral-500">{cart.user?.email}</p>
                    </td>
                    <td className="p-3">
                      {cart.items.length === 0 ? (
                        <span className="text-neutral-400">Empty</span>
                      ) : (
                        <ul className="space-y-1">
                          {cart.items.map((item, i) => (
                            <li key={i} className="text-xs">
                              {item.title} × {item.quantity}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="p-3 text-neutral-500">
                      {cart.couponCode || "—"}
                    </td>
                    <td className="p-3 font-medium">{formatPrice(total)}</td>
                    <td className="p-3 text-neutral-500">
                      {new Date(cart.updatedAt).toLocaleString("en-PK")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-neutral-400 mt-4">
        Related: <Link href="/admin/orders" className="underline">Orders</Link> ·{" "}
        <Link href="/admin/payments" className="underline">Payments</Link>
      </p>
    </div>
  );
}
