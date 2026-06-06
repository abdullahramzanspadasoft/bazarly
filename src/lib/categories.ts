import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { adminProductFilter } from "@/lib/products";
import type { ICategory } from "@/types";

export async function syncCategoryProductCounts() {
  await connectDB();
  const counts = await Product.aggregate<{ _id: string; count: number }>([
    { $match: adminProductFilter },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);

  const countMap = Object.fromEntries(
    counts.map((entry) => [entry._id.toString(), entry.count])
  );

  const categories = await Category.find().lean();
  await Promise.all(
    categories.map((cat) =>
      Category.findByIdAndUpdate(cat._id, {
        productCount: countMap[cat._id.toString()] ?? 0,
      })
    )
  );

  return countMap;
}

export async function getCategoriesWithCounts(): Promise<ICategory[]> {
  await connectDB();
  const [categories, counts] = await Promise.all([
    Category.find().sort({ name: 1 }).lean(),
    Product.aggregate<{ _id: string; count: number }>([
      { $match: adminProductFilter },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = Object.fromEntries(
    counts.map((entry) => [entry._id.toString(), entry.count])
  );

  return categories.map((cat) => ({
    ...JSON.parse(JSON.stringify(cat)),
    productCount: countMap[cat._id.toString()] ?? 0,
  })) as ICategory[];
}

export async function getCategoryProductCount(categoryId: string): Promise<number> {
  await connectDB();
  return Product.countDocuments({ category: categoryId, ...adminProductFilter });
}
