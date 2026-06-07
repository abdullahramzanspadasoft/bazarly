"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Package } from "lucide-react";
import toast from "react-hot-toast";
import ProductCard from "@/components/product/ProductCard";
import ProductGrid from "@/components/product/ProductGrid";
import { useLiveProducts } from "@/hooks/useLiveProducts";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUploader from "@/components/ui/ImageUploader";
import type { IProduct } from "@/types";

interface CategoryProductSectionProps {
  products: IProduct[];
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  isAdmin: boolean;
  liveQuery?: Record<string, string>;
}

export default function CategoryProductSection({
  products: initialProducts,
  categoryId,
  categoryName,
  categorySlug,
  isAdmin,
  liveQuery = {},
}: CategoryProductSectionProps) {
  const router = useRouter();
  const [adminProducts, setAdminProducts] = useState<IProduct[]>(initialProducts);

  useEffect(() => {
    setAdminProducts(initialProducts);
  }, [initialProducts]);

  const liveProducts = useLiveProducts({
    initialProducts,
    query: { category: categoryId, limit: "50", ...liveQuery },
    enabled: !isAdmin,
  });

  const products = isAdmin ? adminProducts : liveProducts;
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    discount: "0",
    stock: "10",
    image: "",
  });

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.price) {
      toast.error("Title, description and price are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          discount: parseFloat(form.discount) || 0,
          category: categoryId,
          stock: parseInt(form.stock) || 10,
          images: form.image
            ? [form.image]
            : ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to add product");
        return;
      }

      toast.success("Product added successfully!");
      setModalOpen(false);
      setForm({ title: "", description: "", price: "", discount: "0", stock: "10", image: "" });

      // Immediately show new product in list
      const newProduct = {
        ...data,
        _id: data._id,
        category: { name: categoryName, slug: categorySlug },
      };
      setAdminProducts((prev) => [newProduct as IProduct, ...prev]);
      router.refresh();
    } catch {
      toast.error("Failed to add product");
    } finally {
      setSaving(false);
    }
  };

  const addProductModal = (
    <Modal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      title={`Add Product — ${categoryName}`}
      className="max-w-lg max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-4">
        <ImageUploader
          value={form.image}
          onChange={(url) => setForm({ ...form, image: url })}
        />

        <Input
          label="Product Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Rolex Submariner"
        />
        <div>
          <label className="block text-sm font-medium mb-1.5">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Product description..."
            className="w-full px-4 py-2.5 border border-border bg-background focus:outline-none focus:border-foreground text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Price ($)"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="99"
          />
          <Input
            label="Discount (%)"
            type="number"
            value={form.discount}
            onChange={(e) => setForm({ ...form, discount: e.target.value })}
            placeholder="0"
          />
        </div>
        <Input
          label="Stock"
          type="number"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: e.target.value })}
        />
        <Button onClick={handleCreate} loading={saving} className="w-full" size="lg">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>
    </Modal>
  );

  if (isAdmin) {
    return (
      <>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="aspect-[3/4] border-2 border-dashed border-foreground/30 hover:border-foreground bg-muted/30 hover:bg-muted flex flex-col items-center justify-center gap-3 transition-all group"
          >
            <div className="w-14 h-14 bg-foreground text-background flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8" />
            </div>
            <span className="text-sm font-semibold">Add Product</span>
            <span className="text-xs text-muted-foreground px-4 text-center">
              {products.length === 0 ? "0 items — tap to add" : `${products.length} items — add more`}
            </span>
          </button>

          {products.map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-center text-xs text-muted-foreground mt-6">
            Products you add here will appear in <strong>Shop</strong> for all users.
          </p>
        )}

        {addProductModal}
      </>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Package className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="font-semibold mb-2">No products available</h3>
        <p className="text-sm text-muted-foreground">Check back soon for new items in {categoryName}.</p>
      </div>
    );
  }

  return <ProductGrid products={products} />;
}
