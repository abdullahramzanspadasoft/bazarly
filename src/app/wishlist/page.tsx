"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/store/wishlist";
import { useCartStore } from "@/store/cart";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { formatPrice, calculateDiscount } from "@/lib/utils";

export default function WishlistPage() {
  const { data: session } = useSession();
  const { items, removeItem, syncRemoveFromDb } = useWishlistStore();
  const addToCart = useCartStore((s) => s.addItem);

  const handleAddToCart = (item: typeof items[0]) => {
    addToCart({
      productId: item.productId,
      title: item.title,
      image: item.image,
      price: item.price,
      discount: item.discount,
      stock: 99,
    });
    toast.success("Added to cart");
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="Your wishlist is empty"
        description="Save items you love by clicking the heart icon on products."
        actionLabel="Browse Products"
        actionHref="/shop"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold mb-8">Wishlist ({items.length} items)</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const price = calculateDiscount(item.price, item.discount);
          return (
            <div key={item.productId} className="border border-neutral-200 group">
              <div className="relative aspect-[3/4] bg-neutral-100">
                <Image src={item.image} alt={item.title} fill className="object-cover" />
                <button
                  onClick={async () => {
                    removeItem(item.productId);
                    if (session) await syncRemoveFromDb(item.productId);
                    toast.success("Removed from wishlist");
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-white flex items-center justify-center hover:bg-neutral-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4">
                <Link href={`/product/${item.productId}`} className="font-medium hover:underline line-clamp-2">
                  {item.title}
                </Link>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-semibold">{formatPrice(price)}</span>
                  {item.discount > 0 && (
                    <span className="text-sm text-neutral-400 line-through">
                      {formatPrice(item.price)}
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => handleAddToCart(item)}
                  size="sm"
                  className="w-full mt-3"
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1" /> Add to Cart
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
