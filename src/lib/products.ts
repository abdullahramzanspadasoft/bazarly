import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import { syncCategoryProductCounts } from "@/lib/categories";

export const adminProductFilter = {
  createdBy: { $exists: true, $ne: null },
};

export async function removeSeedProducts() {
  await connectDB();

  const seedProducts = await Product.find({
    $or: [{ createdBy: { $exists: false } }, { createdBy: null }],
  }).select("_id");

  if (seedProducts.length === 0) return 0;

  const ids = seedProducts.map((p) => p._id);
  await Review.deleteMany({ product: { $in: ids } });
  await Product.deleteMany({ _id: { $in: ids } });
  await syncCategoryProductCounts();

  return seedProducts.length;
}
