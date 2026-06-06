"use client";

import { useState, useEffect, useRef } from "react";
import type { IProduct } from "@/types";

interface UseLiveProductsOptions {
  initialProducts: IProduct[];
  query?: Record<string, string>;
  intervalMs?: number;
  enabled?: boolean;
}

export function useLiveProducts({
  initialProducts,
  query = {},
  intervalMs = 5000,
  enabled = true,
}: UseLiveProductsOptions) {
  const [products, setProducts] = useState<IProduct[]>(initialProducts);
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const queryRef = useRef(query);
  queryRef.current = query;

  useEffect(() => {
    if (!enabled) return;

    const fetchProducts = async () => {
      try {
        const params = new URLSearchParams(queryRef.current);
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
        }
      } catch {
        // keep showing last known products
      }
    };

    const id = setInterval(fetchProducts, intervalMs);
    return () => clearInterval(id);
  }, [queryKey, intervalMs, enabled]);

  return products;
}

export function useLiveProductCount({
  initialTotal,
  query = {},
  intervalMs = 5000,
  enabled = true,
}: {
  initialTotal: number;
  query?: Record<string, string>;
  intervalMs?: number;
  enabled?: boolean;
}) {
  const [total, setTotal] = useState(initialTotal);
  const queryKey = JSON.stringify(query);

  useEffect(() => {
    setTotal(initialTotal);
  }, [initialTotal]);

  const queryRef = useRef(query);
  queryRef.current = query;

  useEffect(() => {
    if (!enabled) return;

    const fetchCount = async () => {
      try {
        const params = new URLSearchParams({ ...queryRef.current, limit: "1" });
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.pagination?.total !== undefined) {
          setTotal(data.pagination.total);
        }
      } catch {
        // keep last count
      }
    };

    const id = setInterval(fetchCount, intervalMs);
    return () => clearInterval(id);
  }, [queryKey, intervalMs, enabled]);

  return total;
}
