"use client";

import LiveProductGrid from "@/components/product/LiveProductGrid";
import type { IProduct } from "@/types";

interface ShopProductListProps {
  initialProducts: IProduct[];
  query: Record<string, string>;
}

export default function ShopProductList({ initialProducts, query }: ShopProductListProps) {
  return (
    <LiveProductGrid
      initialProducts={initialProducts}
      query={{ ...query, limit: "12" }}
    />
  );
}
