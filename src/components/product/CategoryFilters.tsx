"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import Button from "@/components/ui/Button";

interface CategoryFiltersProps {
  slug: string;
}

export default function CategoryFilters({ slug }: CategoryFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentSort = searchParams.get("sort") || "createdAt";
  const currentOrder = searchParams.get("order") || "desc";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/categories/${slug}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/categories/${slug}`);
  };

  const filterContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={currentMinPrice}
            onBlur={(e) => updateFilter("minPrice", e.target.value)}
            className="w-full px-3 py-2 border border-border text-sm focus:outline-none focus:border-foreground bg-background"
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={currentMaxPrice}
            onBlur={(e) => updateFilter("maxPrice", e.target.value)}
            className="w-full px-3 py-2 border border-border text-sm focus:outline-none focus:border-foreground bg-background"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Sort By</h3>
        <select
          value={currentSort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="w-full px-3 py-2 border border-border text-sm focus:outline-none focus:border-foreground bg-background mb-3"
        >
          <option value="createdAt">Newest</option>
          <option value="price">Price</option>
          <option value="averageRating">Rating</option>
          <option value="title">Name</option>
        </select>
        <select
          value={currentOrder}
          onChange={(e) => updateFilter("order", e.target.value)}
          className="w-full px-3 py-2 border border-border text-sm focus:outline-none focus:border-foreground bg-background"
        >
          <option value="desc">High to Low / Z-A</option>
          <option value="asc">Low to High / A-Z</option>
        </select>
      </div>

      <Button variant="outline" size="sm" onClick={clearFilters} className="w-full">
        Clear Filters
      </Button>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden flex items-center justify-center gap-2 w-full px-4 py-2 border border-border text-sm mb-4"
      >
        <SlidersHorizontal className="w-4 h-4" /> Filters
      </button>

      <aside className="hidden lg:block w-56 flex-shrink-0">{filterContent}</aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-semibold">Filters</h2>
            <button onClick={() => setMobileOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">{filterContent}</div>
        </div>
      )}
    </>
  );
}
