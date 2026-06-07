import Link from "next/link";
import { Suspense } from "react";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { canManageProducts } from "@/lib/admin-users";
import Category from "@/models/Category";
import Product from "@/models/Product";
import CategorySearchBar from "@/components/product/CategorySearchBar";
import CategoryFilters from "@/components/product/CategoryFilters";
import CategoryProductSection from "@/components/category/CategoryProductSection";
import LiveProductCount from "@/components/product/LiveProductCount";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { IProduct } from "@/types";
import { notFound } from "next/navigation";
import { adminProductFilter } from "@/lib/products";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    order?: string;
    page?: string;
  }>;
}

async function getCategoryProducts(
  slug: string,
  params: Awaited<CategoryPageProps["searchParams"]>
) {
  try {
    await connectDB();
    const category = await Category.findOne({ slug }).lean();
    if (!category) return null;

    const page = parseInt(params.page || "1");
    const limit = 12;
    const filter: Record<string, unknown> = {
      category: category._id.toString(),
      ...adminProductFilter,
    };

    if (params.search) {
      filter.$text = { $search: params.search };
    }
    if (params.minPrice || params.maxPrice) {
      filter.price = {};
      if (params.minPrice) (filter.price as Record<string, number>).$gte = parseFloat(params.minPrice);
      if (params.maxPrice) (filter.price as Record<string, number>).$lte = parseFloat(params.maxPrice);
    }

    const sort = params.sort || "createdAt";
    const order = params.order === "asc" ? 1 : -1;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort({ [sort]: order })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return {
      category: JSON.parse(JSON.stringify(category)),
      products: JSON.parse(JSON.stringify(products)) as IProduct[],
      total,
      pages: Math.ceil(total / limit),
      page,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = await params;
  const data = await getCategoryProducts(slug, {});
  if (!data) return { title: "Category Not Found" };
  return {
    title: data.category.name,
    description: data.category.description,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const session = await auth();
  const isAdmin = canManageProducts(session?.user?.email, session?.user?.role);
  const data = await getCategoryProducts(slug, query);
  if (!data) notFound();

  const { category, products, total, pages, page } = data;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/categories" className="hover:text-foreground">Categories</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{category.name}</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
            <p className="text-sm text-muted-foreground mt-2">
              <LiveProductCount
                initialTotal={total}
                query={{
                  category: category._id,
                  ...(query.search && { search: query.search }),
                  ...(query.minPrice && { minPrice: query.minPrice }),
                  ...(query.maxPrice && { maxPrice: query.maxPrice }),
                }}
              />
              {query.search && ` for "${query.search}"`}
            </p>
          </div>
          {isAdmin && (
            <span className="text-xs bg-foreground text-background px-3 py-1.5 font-medium uppercase tracking-wider flex-shrink-0">
              Admin Mode
            </span>
          )}
        </div>
      </div>

      {!isAdmin && (
        <div className="mb-6">
          <Suspense fallback={<LoadingSpinner size="sm" />}>
            <CategorySearchBar slug={slug} />
          </Suspense>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
        {!isAdmin && (
          <Suspense fallback={<LoadingSpinner />}>
            <CategoryFilters slug={slug} />
          </Suspense>
        )}

        <div className="flex-1 min-w-0 w-full">
          <CategoryProductSection
            products={products}
            categoryId={category._id}
            categoryName={category.name}
            categorySlug={slug}
            isAdmin={isAdmin}
            liveQuery={{
              ...(query.search && { search: query.search }),
              ...(query.minPrice && { minPrice: query.minPrice }),
              ...(query.maxPrice && { maxPrice: query.maxPrice }),
              ...(query.sort && { sort: query.sort }),
              ...(query.order && { order: query.order }),
              ...(query.page && { page: query.page }),
            }}
          />

          {!isAdmin && pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/categories/${slug}?${new URLSearchParams({
                    ...query,
                    page: p.toString(),
                  } as Record<string, string>).toString()}`}
                  className={`w-10 h-10 flex items-center justify-center text-sm border ${
                    p === page
                      ? "bg-foreground text-background border-foreground"
                      : "border-border hover:border-foreground"
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
