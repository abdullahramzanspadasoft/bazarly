import ProductCard from "./ProductCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { Package } from "lucide-react";
import type { IProduct } from "@/types";

interface ProductGridProps {
  products: IProduct[];
  loading?: boolean;
}

export default function ProductGrid({ products, loading }: ProductGridProps) {
  if (loading) {
    return <LoadingSpinner size="lg" className="py-20" />;
  }

  if (!products.length) {
    return (
      <EmptyState
        icon={Package}
        title="No products found"
        description="Try adjusting your filters or search terms."
        actionLabel="Browse All"
        actionHref="/shop"
      />
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {products.map((product, i) => (
        <ProductCard key={product._id} product={product} index={i} />
      ))}
    </div>
  );
}
