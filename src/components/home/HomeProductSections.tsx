"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LiveProductGrid from "@/components/product/LiveProductGrid";
import type { IProduct } from "@/types";

interface HomeProductSectionsProps {
  featured: IProduct[];
  bestSellers: IProduct[];
}

export default function HomeProductSections({ featured, bestSellers }: HomeProductSectionsProps) {
  return (
    <>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-1">Featured Products</h2>
              <p className="text-neutral-500">Handpicked for you</p>
            </div>
            <Link href="/shop?featured=true" className="text-sm font-medium hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <LiveProductGrid
            initialProducts={featured}
            query={{ featured: "true", limit: "4" }}
          />
      </section>

      <section className="bg-neutral-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-1">Best Sellers</h2>
                <p className="text-neutral-500">Most loved by our customers</p>
              </div>
              <Link href="/shop?bestSeller=true" className="text-sm font-medium hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <LiveProductGrid
              initialProducts={bestSellers}
              query={{ bestSeller: "true", limit: "4" }}
            />
          </div>
      </section>
    </>
  );
}
