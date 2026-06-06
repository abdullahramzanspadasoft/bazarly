"use client";

import { useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatPrice } from "@/lib/utils";

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then(setCustomers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-16" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Customers</h1>

      <div className="border border-neutral-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Orders</th>
              <th className="text-left p-3">Total Spent</th>
              <th className="text-left p-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id} className="border-t border-neutral-200">
                <td className="p-3 font-medium">{customer.name}</td>
                <td className="p-3">{customer.email}</td>
                <td className="p-3">{customer.orderCount}</td>
                <td className="p-3 font-medium">{formatPrice(customer.totalSpent)}</td>
                <td className="p-3 text-neutral-500">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
