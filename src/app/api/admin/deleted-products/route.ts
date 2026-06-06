import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import DeletedProduct from "@/models/DeletedProduct";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { auth } from "@/lib/auth";
import { canManageProducts } from "@/lib/admin-users";

export async function GET() {
  try {
    const session = await auth();
    if (!canManageProducts(session?.user?.email, session?.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const deletedProducts = await DeletedProduct.find()
      .populate("category", "name slug")
      .populate("deletedBy", "name email")
      .sort({ deletedAt: -1 })
      .lean();

    return NextResponse.json({ deletedProducts });
  } catch (error) {
    console.error("Deleted products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch deleted products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!canManageProducts(session?.user?.email, session?.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: "Deleted product ID required" }, { status: 400 });
    }

    await connectDB();
    const deleted = await DeletedProduct.findById(id);
    if (!deleted) {
      return NextResponse.json({ error: "Deleted product not found" }, { status: 404 });
    }

    const slugExists = await Product.findOne({ slug: deleted.slug });
    if (slugExists) {
      return NextResponse.json(
        { error: "A product with this slug already exists. Cannot restore." },
        { status: 409 }
      );
    }

    const product = await Product.create({
      title: deleted.title,
      slug: deleted.slug,
      description: deleted.description,
      price: deleted.price,
      discount: deleted.discount,
      images: deleted.images,
      category: deleted.category,
      stock: deleted.stock,
      inStock: deleted.inStock,
      featured: deleted.featured,
      bestSeller: deleted.bestSeller,
      ratings: deleted.ratings,
      averageRating: deleted.averageRating,
      numReviews: deleted.numReviews,
      tags: deleted.tags,
      createdBy: deleted.createdBy,
    });

    await Category.findByIdAndUpdate(deleted.category, { $inc: { productCount: 1 } });
    await DeletedProduct.findByIdAndDelete(id);

    return NextResponse.json({ message: "Product restored", product });
  } catch (error) {
    console.error("Product restore error:", error);
    return NextResponse.json({ error: "Failed to restore product" }, { status: 500 });
  }
}
