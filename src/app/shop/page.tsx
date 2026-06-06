import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getCategoriesWithCounts } from "@/lib/categories";
import { adminProductFilter } from "@/lib/products";
import ProductFilters from "@/components/product/ProductFilters";
import ShopProductList from "@/components/shop/ShopProductList";
import LiveProductCount from "@/components/product/LiveProductCount";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { IProduct, ICategory } from "@/types";

interface ShopPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    featured?: string;
    bestSeller?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    order?: string;
    page?: string;
  }>;
}

async function getProducts(params: Awaited<ShopPageProps["searchParams"]>) {
  try {
    await connectDB();
    const page = parseInt(params.page || "1");
    const limit = 12;
    const filter: Record<string, unknown> = { ...adminProductFilter };

    if (params.search) filter.$text = { $search: params.search };
    if (params.category) filter.category = params.category;
    if (params.featured === "true") filter.featured = true;
    if (params.bestSeller === "true") filter.bestSeller = true;
    if (params.minPrice || params.maxPrice) {
      filter.price = {};
      if (params.minPrice) (filter.price as Record<string, number>).$gte = parseFloat(params.minPrice);
      if (params.maxPrice) (filter.price as Record<string, number>).$lte = parseFloat(params.maxPrice);
    }

    const sort = params.sort || "createdAt";
    const order = params.order === "asc" ? 1 : -1;

    const [products, total, categories] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort({ [sort]: order })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
      getCategoriesWithCounts(),
    ]);

    return {
      products: JSON.parse(JSON.stringify(products)) as IProduct[],
      total,
      pages: Math.ceil(total / limit),
      page,
      categories: categories as ICategory[],
    };
  } catch {
    return { products: [], total: 0, pages: 0, page: 1, categories: [] };
  }
}

export const metadata = {
  title: "Shop",
  description: "Browse our collection of premium suits and luxury watches.",
};

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const params = await searchParams;
  const { products, total, pages, page, categories } = await getProducts(params);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shop</h1>
        <p className="text-neutral-500">
          <LiveProductCount
            initialTotal={total}
            query={{
              ...(params.search && { search: params.search }),
              ...(params.category && { category: params.category }),
              ...(params.featured === "true" && { featured: "true" }),
              ...(params.bestSeller === "true" && { bestSeller: "true" }),
              ...(params.minPrice && { minPrice: params.minPrice }),
              ...(params.maxPrice && { maxPrice: params.maxPrice }),
            }}
          />
          {params.search && ` for "${params.search}"`}
        </p>
      </div>

      <div className="flex gap-8">
        <Suspense fallback={<LoadingSpinner />}>
          <ProductFilters categories={categories} />
        </Suspense>

        <div className="flex-1">
          <ShopProductList
            initialProducts={products}
            query={{
              ...(params.search && { search: params.search }),
              ...(params.category && { category: params.category }),
              ...(params.featured === "true" && { featured: "true" }),
              ...(params.bestSeller === "true" && { bestSeller: "true" }),
              ...(params.minPrice && { minPrice: params.minPrice }),
              ...(params.maxPrice && { maxPrice: params.maxPrice }),
              ...(params.sort && { sort: params.sort }),
              ...(params.order && { order: params.order }),
              ...(params.page && { page: params.page }),
            }}
          />

          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/shop?${new URLSearchParams({ ...params, page: p.toString() } as Record<string, string>).toString()}`}
                  className={`w-10 h-10 flex items-center justify-center text-sm border ${
                    p === page
                      ? "bg-black text-white border-black"
                      : "border-neutral-300 hover:border-black"
                  }`}
                >
                  {p}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
