"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatPrice } from "@/lib/utils";

interface AnalyticsData {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
    pendingOrders: number;
  };
  topProducts: Array<{
    _id: string;
    title: string;
    totalSold: number;
    revenue: number;
  }>;
  monthlySales: Array<{
    _id: { year: number; month: number };
    revenue: number;
    orders: number;
  }>;
  payments: Array<{
    _id: string;
    count: number;
    total: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-16" />;
  if (!data) return <p>Failed to load</p>;

  const maxRevenue = Math.max(...data.monthlySales.map((m) => m.revenue), 1);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6" /> Sales Analytics
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: formatPrice(data.stats.totalRevenue) },
          { label: "Total Orders", value: data.stats.totalOrders },
          { label: "Avg Order Value", value: formatPrice(data.stats.totalOrders ? data.stats.totalRevenue / data.stats.totalOrders : 0) },
          { label: "Pending Orders", value: data.stats.pendingOrders },
        ].map((stat) => (
          <div key={stat.label} className="border border-neutral-200 p-4">
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-neutral-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" /> Monthly Sales
          </h2>
          <div className="space-y-3">
            {data.monthlySales.map((month) => (
              <div key={`${month._id.year}-${month._id.month}`}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{month._id.month}/{month._id.year}</span>
                  <span className="font-medium">{formatPrice(month.revenue)} ({month.orders} orders)</span>
                </div>
                <div className="h-3 bg-neutral-100">
                  <div
                    className="h-full bg-black transition-all"
                    style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {data.monthlySales.length === 0 && (
              <p className="text-neutral-500 text-sm">No sales data yet</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Top Products</h2>
          <div className="space-y-3">
            {data.topProducts.map((product, i) => (
              <div key={product._id} className="flex items-center justify-between p-3 border border-neutral-200">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-black text-white text-xs flex items-center justify-center font-bold">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium truncate">{product.title}</span>
                </div>
                <div className="text-right text-sm">
                  <p className="font-medium">{product.totalSold} sold</p>
                  <p className="text-neutral-500">{formatPrice(product.revenue)}</p>
                </div>
              </div>
            ))}
            {data.topProducts.length === 0 && (
              <p className="text-neutral-500 text-sm">No product data yet</p>
            )}
          </div>
        </div>
      </div>

      {data.payments.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.payments.map((p) => (
              <div key={p._id} className="border border-neutral-200 p-4 text-center">
                <p className="font-semibold capitalize">{p._id}</p>
                <p className="text-2xl font-bold mt-1">{p.count}</p>
                <p className="text-sm text-neutral-500">{formatPrice(p.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
