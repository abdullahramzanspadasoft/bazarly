"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { formatPrice, calculateDiscount } from "@/lib/utils";

interface WishlistRecord {
  _id: string;
  user: { name: string; email: string };
  productId: string;
  title: string;
  image: string;
  price: number;
  discount: number;
  createdAt: string;
}

export default function AdminWishlistsPage() {
  const [wishlists, setWishlists] = useState<WishlistRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/wishlists")
      .then((r) => r.json())
      .then((data) => setWishlists(data.wishlists || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-16" />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">User Wishlists</h1>
      <p className="text-sm text-neutral-500 mb-6">
        MongoDB <code className="text-xs bg-neutral-100 px-1">wishlists</code> collection — saved items
      </p>

      {wishlists.length === 0 ? (
        <div className="border border-neutral-200 p-12 text-center text-neutral-500">
          <Heart className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No wishlist items in database yet</p>
        </div>
      ) : (
        <div className="border border-neutral-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Product</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Added</th>
              </tr>
            </thead>
            <tbody>
              {wishlists.map((item) => (
                <tr key={item._id} className="border-t border-neutral-200">
                  <td className="p-3">
                    <p className="font-medium">{item.user?.name || "—"}</p>
                    <p className="text-xs text-neutral-500">{item.user?.email}</p>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <div className="relative w-10 h-10 bg-neutral-100 shrink-0">
                          <Image src={item.image} alt="" fill className="object-cover" />
                        </div>
                      )}
                      <span className="font-medium truncate max-w-[220px]">{item.title}</span>
                    </div>
                  </td>
                  <td className="p-3">{formatPrice(calculateDiscount(item.price, item.discount))}</td>
                  <td className="p-3 text-neutral-500">
                    {new Date(item.createdAt).toLocaleString("en-PK")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-neutral-400 mt-4">
        Related: <Link href="/admin/carts" className="underline">Carts</Link> ·{" "}
        <Link href="/admin/orders" className="underline">Orders</Link>
      </p>
    </div>
  );
}
