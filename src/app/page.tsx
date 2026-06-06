import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from "lucide-react";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { getCategoriesWithCounts } from "@/lib/categories";
import { adminProductFilter } from "@/lib/products";
import Button from "@/components/ui/Button";
import HomeProductSections from "@/components/home/HomeProductSections";
import type { IProduct, ICategory } from "@/types";

async function getHomeData() {
  try {
    await connectDB();
    const [featured, bestSellers, categories] = await Promise.all([
      Product.find({ ...adminProductFilter, featured: true }).limit(4).lean(),
      Product.find({ ...adminProductFilter, bestSeller: true }).limit(4).lean(),
      getCategoriesWithCounts(),
    ]);
    return {
      featured: JSON.parse(JSON.stringify(featured)) as IProduct[],
      bestSellers: JSON.parse(JSON.stringify(bestSellers)) as IProduct[],
      categories: categories as ICategory[],
    };
  } catch {
    return { featured: [], bestSellers: [], categories: [] };
  }
}

export default async function HomePage() {
  const { featured, bestSellers, categories } = await getHomeData();

  return (
    <>
      <section className="relative h-[70vh] min-h-[500px] bg-black text-white flex items-center">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
            alt="Bazaarly Hero"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-xl animate-fade-in">
            <p className="text-sm uppercase tracking-[0.3em] mb-4 text-neutral-300">
              Premium Collection 2026
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Elevate Your Style with Bazaarly
            </h1>
            <p className="text-neutral-300 text-lg mb-8 leading-relaxed">
              Discover curated men&apos;s suits and luxury timepieces crafted for those who demand excellence.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-white text-black hover:bg-neutral-200">
                  Shop Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/categories">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
                  Browse Categories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: "Free Shipping", desc: "On orders over $100" },
            { icon: Shield, title: "Secure Payment", desc: "100% protected" },
            { icon: RefreshCw, title: "Easy Returns", desc: "30-day policy" },
            { icon: Headphones, title: "24/7 Support", desc: "Dedicated help" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <item.icon className="w-8 h-8 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-neutral-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Shop by Category</h2>
            <p className="text-neutral-500">Explore our curated collections</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                href={`/categories/${cat.slug}`}
                className="group relative aspect-[16/9] overflow-hidden bg-neutral-100"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  <h3 className="text-2xl font-bold mb-1">{cat.name}</h3>
                  <p className="text-sm text-neutral-200">{cat.productCount} Products</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <HomeProductSections featured={featured} bestSellers={bestSellers} />

      <section className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Bazaarly Community</h2>
          <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
            Sign up today and get 10% off your first order with code WELCOME10
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-black hover:bg-neutral-200">
              Create Account
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
