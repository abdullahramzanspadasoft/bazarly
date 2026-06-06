"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Package, Heart, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

export default function DashboardPage() {
  const { data: session } = useSession();
  const cartCount = useCartStore((s) => s.getItemCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const [orders, setOrders] = useState<Array<{ _id: string; orderNumber: string; total: number; orderStatus: string; createdAt: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">
        Welcome back, {session?.user?.name}
      </h1>
      <p className="text-neutral-500 mb-8">Manage your account and track your orders</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Package, label: "Total Orders", value: orders.length, href: "/dashboard/orders" },
          { icon: ShoppingBag, label: "Cart Items", value: cartCount, href: "/cart" },
          { icon: Heart, label: "Wishlist", value: wishlistCount, href: "/wishlist" },
        ].map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="border border-neutral-200 p-4 hover:border-black transition-colors"
          >
            <stat.icon className="w-5 h-5 mb-2" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-neutral-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : orders.length === 0 ? (
          <p className="text-neutral-500 text-sm">No orders yet. Start shopping!</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/order-confirmation/${order.orderNumber}`}
                className="flex items-center justify-between p-4 border border-neutral-200 hover:border-black transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{order.orderNumber}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={order.orderStatus === "delivered" ? "success" : "default"}>
                    {order.orderStatus}
                  </Badge>
                  <span className="font-semibold text-sm">{formatPrice(order.total)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
