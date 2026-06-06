import type { CartItem, WishlistItem } from "@/types";

export function cartItemToPayload(item: CartItem) {
  return {
    productId: item.productId,
    slug: item.slug,
    title: item.title,
    image: item.image,
    price: item.price,
    discount: item.discount,
    quantity: item.quantity,
    stock: item.stock,
  };
}

export function mapDbCartItem(item: {
  productId: string;
  slug?: string;
  title: string;
  image: string;
  price: number;
  discount: number;
  quantity: number;
  stock: number;
}): CartItem {
  return {
    productId: item.productId,
    slug: item.slug,
    title: item.title,
    image: item.image,
    price: item.price,
    discount: item.discount,
    quantity: item.quantity,
    stock: item.stock,
  };
}

export function mapDbWishlistItem(item: {
  productId: string;
  title: string;
  image: string;
  price: number;
  discount: number;
}): WishlistItem {
  return {
    productId: item.productId,
    title: item.title,
    image: item.image,
    price: item.price,
    discount: item.discount,
  };
}
