import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const USD_TO_PKR_RATE = Number(process.env.NEXT_PUBLIC_USD_TO_PKR_RATE) || 280;

export function formatPrice(price: number): string {
  const pkr = Math.round(price * USD_TO_PKR_RATE);
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(pkr);
}

export function calculateDiscount(price: number, discount: number): number {
  return price - (price * discount) / 100;
}

export function isUploadedImage(src: string): boolean {
  return (
    src.startsWith("/uploads/") ||
    src.startsWith("/api/images/") ||
    src.includes("res.cloudinary.com")
  );
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BZ-${timestamp}-${random}`;
}

export function getAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
}
