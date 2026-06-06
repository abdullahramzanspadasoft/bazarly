"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Badge from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

interface Payment {
  _id: string;
  user: { name: string; email: string };
  order: { orderNumber: string; total: number };
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((r) => r.json())
      .then(setPayments)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-16" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Payments</h1>

      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Method</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id} className="border-t border-neutral-200">
                <td className="p-3 font-medium">{payment.order?.orderNumber}</td>
                <td className="p-3">{payment.user?.name}</td>
                <td className="p-3 font-medium">{formatPrice(payment.amount)}</td>
                <td className="p-3 capitalize">{payment.method}</td>
                <td className="p-3">
                  <Badge variant={payment.status === "completed" ? "success" : payment.status === "failed" ? "danger" : "warning"}>
                    {payment.status}
                  </Badge>
                </td>
                <td className="p-3 text-neutral-500">
                  {new Date(payment.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
