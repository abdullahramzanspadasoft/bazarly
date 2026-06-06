"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RotateCcw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatPrice } from "@/lib/utils";

interface DeletedProduct {
  _id: string;
  title: string;
  images: string[];
  price: number;
  stock: number;
  deletedAt: string;
  category: { name: string } | string;
  deletedBy?: { name: string; email: string };
}

export default function AdminDeletedProductsPage() {
  const [products, setProducts] = useState<DeletedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);

  const fetchDeleted = () => {
    setLoading(true);
    fetch("/api/admin/deleted-products")
      .then((r) => r.json())
      .then((data) => setProducts(data.deletedProducts || []))
      .catch(() => toast.error("Failed to load deleted products"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDeleted();
  }, []);

  const handleRestore = async (id: string, title: string) => {
    if (!confirm(`Restore "${title}" back to active products?`)) return;
    setRestoring(id);
    try {
      const res = await fetch("/api/admin/deleted-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to restore");
        return;
      }
      toast.success("Product restored!");
      fetchDeleted();
    } catch {
      toast.error("Failed to restore product");
    } finally {
      setRestoring(null);
    }
  };

  if (loading) return <LoadingSpinner className="py-16" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Deleted Products</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Products removed from the store are kept here in MongoDB
          </p>
        </div>
        <Link href="/admin/products">
          <Button size="sm" variant="outline">Back to Products</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="border border-neutral-200 p-12 text-center text-neutral-500">
          <Trash2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No deleted products yet</p>
        </div>
      ) : (
        <div className="border border-neutral-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Stock</th>
                <th className="text-left p-3">Deleted At</th>
                <th className="text-left p-3">Deleted By</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-t border-neutral-200">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 bg-neutral-100 flex-shrink-0">
                        {product.images[0] && (
                          <Image src={product.images[0]} alt="" fill className="object-cover" />
                        )}
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{product.title}</span>
                    </div>
                  </td>
                  <td className="p-3">{formatPrice(product.price)}</td>
                  <td className="p-3">{product.stock}</td>
                  <td className="p-3 text-neutral-500">
                    {new Date(product.deletedAt).toLocaleDateString("en-PK", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-3 text-neutral-500">
                    {product.deletedBy?.name || "—"}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleRestore(product._id, product.title)}
                      disabled={restoring === product._id}
                      className="flex items-center gap-1 text-green-600 hover:text-green-800 disabled:opacity-50"
                      title="Restore product"
                    >
                      <RotateCcw className="w-4 h-4" />
                      {restoring === product._id ? "Restoring..." : "Restore"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
