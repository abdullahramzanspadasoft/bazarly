"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import Button from "@/components/ui/Button";
import type { ICategory } from "@/types";

interface ProductFiltersProps {
  categories: ICategory[];
}

export default function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "createdAt";
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
    router.push(`/shop?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push("/shop");
  };

  const filterContent = (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Categories</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateFilter("category", "")}
            className={`block text-sm w-full text-left py-1 ${
              !currentCategory ? "font-semibold" : "text-neutral-600 hover:text-black"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateFilter("category", cat._id)}
              className={`block text-sm w-full text-left py-1 ${
                currentCategory === cat._id ? "font-semibold" : "text-neutral-600 hover:text-black"
              }`}
            >
              {cat.name} ({cat.productCount})
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            defaultValue={currentMinPrice}
            onBlur={(e) => updateFilter("minPrice", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-black"
          />
          <input
            type="number"
            placeholder="Max"
            defaultValue={currentMaxPrice}
            onBlur={(e) => updateFilter("maxPrice", e.target.value)}
            className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-black"
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider mb-3">Sort By</h3>
        <select
          value={currentSort}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="w-full px-3 py-2 border border-neutral-300 text-sm focus:outline-none focus:border-black bg-white"
        >
          <option value="createdAt">Newest</option>
          <option value="price">Price</option>
          <option value="averageRating">Rating</option>
          <option value="title">Name</option>
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
        className="lg:hidden flex items-center gap-2 px-4 py-2 border border-neutral-300 text-sm mb-4"
      >
        <SlidersHorizontal className="w-4 h-4" /> Filters
      </button>

      <aside className="hidden lg:block w-64 flex-shrink-0">{filterContent}</aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between p-4 border-b">
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
