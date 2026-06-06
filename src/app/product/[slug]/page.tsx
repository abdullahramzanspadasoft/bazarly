import Image from "next/image";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import ProductGrid from "@/components/product/ProductGrid";
import ProductActions from "@/components/product/ProductActions";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import ReviewForm from "@/components/product/ReviewForm";
import { formatPrice, calculateDiscount } from "@/lib/utils";
import type { IProduct } from "@/types";
import { notFound } from "next/navigation";
import { adminProductFilter } from "@/lib/products";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    await connectDB();
    const product = await Product.findOne({ slug, ...adminProductFilter })
      .populate("category", "name slug")
      .lean();

    if (!product) return null;

    const [reviews, related] = await Promise.all([
      Review.find({ product: product._id })
        .populate("user", "name avatar")
        .sort({ createdAt: -1 })
        .lean(),
      Product.find({
        category: product.category,
        _id: { $ne: product._id },
        ...adminProductFilter,
      })
        .limit(4)
        .lean(),
    ]);

    return {
      product: JSON.parse(JSON.stringify(product)) as IProduct,
      reviews: JSON.parse(JSON.stringify(reviews)),
      related: JSON.parse(JSON.stringify(related)) as IProduct[],
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) return { title: "Product Not Found" };
  return {
    title: data.product.title,
    description: data.product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const data = await getProduct(slug);
  if (!data) notFound();

  const { product, reviews, related } = data;
  const discountedPrice = calculateDiscount(product.price, product.discount);
  const category = product.category as { name: string; slug: string };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <nav className="text-sm text-neutral-500 mb-6">
        <Link href="/" className="hover:text-black">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-black">Shop</Link>
        <span className="mx-2">/</span>
        <Link href={`/categories/${category.slug}`} className="hover:text-black">
          {category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-black">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
        <div className="space-y-4">
          <div className="relative aspect-square bg-neutral-100 overflow-hidden">
            <Image
              src={product.images[0]}
              alt={product.title}
              fill
              className="object-cover"
              priority
            />
            {product.discount > 0 && (
              <Badge className="absolute top-4 left-4">-{product.discount}%</Badge>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1).map((img, i) => (
                <div key={i} className="relative aspect-square bg-neutral-100">
                  <Image src={img} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-neutral-500 uppercase tracking-wider mb-2">
            {category.name}
          </p>
          <h1 className="text-3xl font-bold mb-4">{product.title}</h1>

          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.averageRating} />
            <span className="text-sm text-neutral-500">
              {product.averageRating.toFixed(1)} ({product.numReviews} reviews)
            </span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold">{formatPrice(discountedPrice)}</span>
            {product.discount > 0 && (
              <span className="text-lg text-neutral-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <p className="text-neutral-600 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-4 mb-6 text-sm">
            <span className={product.inStock ? "text-green-600" : "text-red-600"}>
              {product.inStock ? `In Stock (${product.stock} available)` : "Out of Stock"}
            </span>
          </div>

          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
          )}

          <ProductActions product={product} />
        </div>
      </div>

      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <ReviewForm productId={product._id} />
        <div className="mt-8 space-y-6">
          {reviews.length === 0 ? (
            <p className="text-neutral-500">No reviews yet. Be the first to review!</p>
          ) : (
            reviews.map((review: { _id: string; user: { name: string }; rating: number; comment: string; createdAt: string }) => (
              <div key={review._id} className="border-b border-neutral-200 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-sm font-medium">
                    {review.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{review.user.name}</p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                </div>
                <p className="text-neutral-600 text-sm">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
