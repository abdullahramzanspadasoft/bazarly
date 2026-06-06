"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import { useCartStore } from "@/store/cart";
import { useWishlistStore } from "@/store/wishlist";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import type { IProduct } from "@/types";

interface ProductCardProps {
  product: IProduct;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { data: session } = useSession();
  const addToCart = useCartStore((s) => s.addItem);
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist, syncAddToDb, syncRemoveFromDb } = useWishlistStore();
  const inWishlist = isInWishlist(product._id);
  const discountedPrice = calculateDiscount(product.price, product.discount);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
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
    });
    toast.success("Added to cart");
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/product/${product.slug}`} className="group block">
        <div className="relative aspect-[3/4] bg-neutral-100 overflow-hidden mb-3">
          <Image
            src={product.images[0]}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
          {product.discount > 0 && (
            <Badge className="absolute top-3 left-3" variant="default">
              -{product.discount}%
            </Badge>
          )}
          {!product.inStock && (
            <Badge className="absolute top-3 right-3" variant="danger">
              Sold Out
            </Badge>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white py-2 text-xs font-medium flex items-center justify-center gap-1 hover:bg-neutral-800"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
            </button>
            <button
              onClick={handleWishlist}
              className="w-9 h-9 bg-white flex items-center justify-center hover:bg-neutral-100"
            >
              <Heart className={`w-4 h-4 ${inWishlist ? "fill-black" : ""}`} />
            </button>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-medium line-clamp-2 group-hover:underline">
            {product.title}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <StarRating rating={product.averageRating} size="sm" />
            <span className="text-xs text-neutral-500">({product.numReviews})</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-semibold">{formatPrice(discountedPrice)}</span>
            {product.discount > 0 && (
              <span className="text-sm text-neutral-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
