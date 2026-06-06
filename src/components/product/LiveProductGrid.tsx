"use client";

import ProductGrid from "./ProductGrid";
import { useLiveProducts } from "@/hooks/useLiveProducts";
import type { IProduct } from "@/types";

interface LiveProductGridProps {
  initialProducts: IProduct[];
  query?: Record<string, string>;
  intervalMs?: number;
  enabled?: boolean;
}

export default function LiveProductGrid({
  initialProducts,
  query = {},
  intervalMs = 5000,
  enabled = true,
}: LiveProductGridProps) {
  const products = useLiveProducts({
    initialProducts,
    query,
    intervalMs,
    enabled,
  });

  return <ProductGrid products={products} />;
}
