"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Truck } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

interface Order {
  _id: string;
  orderNumber: string;
  items: { title: string; quantity: number }[];
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-16" />;

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No orders yet"
        description="When you place an order, it will appear here."
        actionLabel="Start Shopping"
        actionHref="/shop"
      />
    );
  }

  const statusVariant = (status: string) => {
    if (status === "delivered") return "success" as const;
    if (status === "cancelled") return "danger" as const;
    if (status === "shipped") return "warning" as const;
    return "default" as const;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Order History</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="border border-neutral-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <Link
                  href={`/order-confirmation/${order.orderNumber}`}
                  className="font-semibold hover:underline"
                >
                  {order.orderNumber}
                </Link>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant(order.orderStatus)}>
                  {order.orderStatus}
                </Badge>
                <Badge variant="outline">{order.paymentMethod}</Badge>
              </div>
            </div>

            <div className="text-sm text-neutral-600 mb-3">
              {order.items.map((item, i) => (
                <span key={i}>
                  {item.title} x{item.quantity}
                  {i < order.items.length - 1 ? ", " : ""}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold">{formatPrice(order.total)}</span>
                {order.trackingNumber && (
                  <span className="flex items-center gap-1 text-neutral-500">
                    <Truck className="w-3.5 h-3.5" />
                    {order.trackingNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
