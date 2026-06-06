"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { ShoppingBag, Heart, Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import type { IProduct } from "@/types";

interface ProductActionsProps {
  product: IProduct;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const { data: session } = useSession();
  const addToCart = useCartStore((s) => s.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist, syncAddToDb, syncRemoveFromDb } = useWishlistStore();
  const inWishlist = isInWishlist(product._id);

  const handleAddToCart = () => {
    if (!product.inStock) {
      toast.error("Out of stock");
      return;
    }
    addToCart({
      productId: product._id,
      slug: product.slug,
      title: product.title,
      image: product.images[0],
      price: product.price,
      discount: product.discount,
      stock: product.stock,
      quantity,
    });
    toast.success("Added to cart");
  };

  const handleWishlist = async () => {
    if (inWishlist) {
      removeFromWishlist(product._id);
      if (session) await syncRemoveFromDb(product._id);
      toast.success("Removed from wishlist");
    } else {
      const item = {
        productId: product._id,
        title: product.title,
        image: product.images[0],
        price: product.price,
        discount: product.discount,
      };
      addToWishlist(item);
      if (session) await syncAddToDb(item);
      toast.success("Added to wishlist");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium">Quantity:</span>
        <div className="flex items-center border border-neutral-300">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 hover:bg-neutral-100"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            className="p-2 hover:bg-neutral-100"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          size="lg"
          className="flex-1"
        >
          <ShoppingBag className="w-4 h-4 mr-2" />
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
        <Button
          onClick={handleWishlist}
          variant="outline"
          size="lg"
          className="px-4"
        >
          <Heart className={`w-4 h-4 ${inWishlist ? "fill-black" : ""}`} />
        </Button>
      </div>
    </div>
  );
}
