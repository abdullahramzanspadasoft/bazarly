"use client";

import { useEffect, useState } from "react";
import { DollarSign, Package, Users, ShoppingCart } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

interface Analytics {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
    pendingOrders: number;
  };
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    orderStatus: string;
    user: { name: string };
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-16" />;
  if (!data) return <p>Failed to load analytics</p>;

  const stats = [
    { icon: DollarSign, label: "Revenue", value: formatPrice(data.stats.totalRevenue) },
    { icon: ShoppingCart, label: "Orders", value: data.stats.totalOrders },
    { icon: Package, label: "Products", value: data.stats.totalProducts },
    { icon: Users, label: "Customers", value: data.stats.totalCustomers },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-neutral-200 p-4">
            <stat.icon className="w-5 h-5 mb-2 text-neutral-400" />
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {data.stats.pendingOrders > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 mb-6 text-sm">
          {data.stats.pendingOrders} pending order{data.stats.pendingOrders > 1 ? "s" : ""} require attention
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left p-3 font-medium">Order</th>
              <th className="text-left p-3 font-medium">Customer</th>
              <th className="text-left p-3 font-medium">Total</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.recentOrders.map((order) => (
              <tr key={order._id} className="border-t border-neutral-200">
                <td className="p-3 font-medium">{order.orderNumber}</td>
                <td className="p-3">{order.user?.name}</td>
                <td className="p-3">{formatPrice(order.total)}</td>
                <td className="p-3">
                  <Badge variant={order.orderStatus === "delivered" ? "success" : "default"}>
                    {order.orderStatus}
                  </Badge>
                </td>
                <td className="p-3 text-neutral-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
