"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { formatPrice } from "@/lib/utils";
import type { IProduct } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState<IProduct | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", price: "", discount: "0", category: "", stock: "" });
  const [categories, setCategories] = useState<Array<{ _id: string; name: string }>>([]);
  const [saving, setSaving] = useState(false);

  const fetchProducts = () => {
    fetch("/api/products?limit=100&admin=true")
      .then((r) => r.json())
      .then((data) => setProducts(data.products || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
    fetch("/api/categories").then((r) => r.json()).then(setCategories);
  }, []);

  const handleCreate = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          discount: parseFloat(form.discount),
          category: form.category,
          stock: parseInt(form.stock),
          images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"],
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        return;
      }
      toast.success("Product created!");
      setModalOpen(false);
      setForm({ title: "", description: "", price: "", discount: "0", category: "", stock: "" });
      fetchProducts();
    } catch {
      toast.error("Failed to create product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${deleteModal._id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete product");
        return;
      }
      toast.success("Product moved to deleted folder");
      setDeleteModal(null);
      fetchProducts();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner className="py-16" />;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold">Manage Products</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/admin/deleted">
            <Button size="sm" variant="outline">
              <Trash2 className="w-4 h-4 mr-1" /> Deleted
            </Button>
          </Link>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add Product
          </Button>
        </div>
      </div>

      <div className="border border-border overflow-x-auto -mx-3 sm:mx-0 rounded-sm">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Stock</th>
              <th className="text-left p-3">Status</th>
              <th className="text-left p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-neutral-500">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id} className="border-t border-neutral-200">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 bg-neutral-100 flex-shrink-0">
                        <Image src={product.images[0]} alt="" fill className="object-cover" />
                      </div>
                      <span className="font-medium truncate max-w-[200px]">{product.title}</span>
                    </div>
                  </td>
                  <td className="p-3">{formatPrice(product.price)}</td>
                  <td className="p-3">{product.stock}</td>
                  <td className="p-3">
                    <Badge variant={product.inStock ? "success" : "danger"}>
                      {product.inStock ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setDeleteModal(product)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Product">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div>
            <label className="block text-sm font-medium mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-neutral-300 focus:outline-none focus:border-black"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Input label="Discount %" type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-neutral-300 focus:outline-none focus:border-black bg-white"
              >
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>
            <Input label="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
          </div>
          <Button onClick={handleCreate} loading={saving} className="w-full">Create Product</Button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Product">
        <div className="space-y-4">
          <p className="text-neutral-600">
            Are you sure you want to delete <strong>{deleteModal?.title}</strong>?
            It will be moved to the deleted folder and removed from the store.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setDeleteModal(null)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              loading={deleting}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
