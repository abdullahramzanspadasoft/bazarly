"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

interface CategorySearchBarProps {
  slug: string;
  placeholder?: string;
}

export default function CategorySearchBar({ slug, placeholder }: CategorySearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set("search", query.trim());
    } else {
      params.delete("search");
    }
    params.delete("page");
    router.push(`/categories/${slug}?${params.toString()}`);
  };

  const clearSearch = () => {
    setQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("search");
    params.delete("page");
    router.push(`/categories/${slug}?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xl">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || "Search products in this category..."}
        className="w-full pl-11 pr-10 py-3 border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
      />
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
