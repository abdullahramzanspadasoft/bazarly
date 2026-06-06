"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

interface Order {
  _id: string;
  orderNumber: string;
  user: { name: string; email: string };
  total: number;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setOrders(data); })
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, orderStatus: string) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderStatus, paymentStatus: orderStatus === "delivered" ? "paid" : undefined }),
    });
    if (res.ok) {
      toast.success("Order updated");
      setOrders((prev) => prev.map((o) => o._id === id ? { ...o, orderStatus } : o));
    }
  };

  if (loading) return <LoadingSpinner className="py-16" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Orders</h1>

      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Total</th>
              <th className="text-left p-3">Payment</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t border-neutral-200">
                <td className="p-3">
                  <p className="font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-neutral-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="p-3">
                  <p>{order.user?.name}</p>
                  <p className="text-xs text-neutral-500">{order.user?.email}</p>
                </td>
                <td className="p-3 font-medium">{formatPrice(order.total)}</td>
                <td className="p-3 capitalize">{order.paymentMethod}</td>
                <td className="p-3">
                  <Badge variant={order.orderStatus === "delivered" ? "success" : "default"}>
                    {order.orderStatus}
                  </Badge>
                </td>
                <td className="p-3">
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                    className="text-xs border border-neutral-300 px-2 py-1 bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
