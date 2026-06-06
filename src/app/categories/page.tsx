import Image from "next/image";
import Link from "next/link";
import { getCategoriesWithCounts } from "@/lib/categories";
import type { ICategory } from "@/types";

async function getCategories() {
  try {
    return await getCategoriesWithCounts();
  } catch {
    return [] as ICategory[];
  }
}

export const metadata = {
  title: "Categories",
  description: "Browse product categories at Bazaarly.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Categories</h1>
        <p className="text-neutral-500">Explore our curated collections</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/categories/${cat.slug}`}
            className="group relative aspect-[16/10] overflow-hidden bg-neutral-100"
          >
            <Image
              src={cat.image}
              alt={cat.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h2 className="text-2xl font-bold mb-1">{cat.name}</h2>
              <p className="text-sm text-neutral-300 mb-2">{cat.description}</p>
              <p className="text-sm font-medium">{cat.productCount} Products</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
