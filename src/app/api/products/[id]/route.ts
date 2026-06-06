import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import DeletedProduct from "@/models/DeletedProduct";
import Review from "@/models/Review";
import { auth } from "@/lib/auth";
import { canManageProducts } from "@/lib/admin-users";
import Category from "@/models/Category";
import { adminProductFilter } from "@/lib/products";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectDB();

    const product = await Product.findOne({
      $or: [{ _id: id }, { slug: id }],
      ...adminProductFilter,
    })
      .populate("category", "name slug")
      .lean();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const reviews = await Review.find({ product: product._id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .lean();

    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      ...adminProductFilter,
    })
      .limit(4)
      .lean();

    return NextResponse.json({ product, reviews, related });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();
    const product = await Product.findByIdAndUpdate(
      id,
      { ...body, inStock: body.stock > 0 },
      { new: true }
    );

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!canManageProducts(session?.user?.email, session?.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await DeletedProduct.create({
      originalProductId: product._id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      price: product.price,
      discount: product.discount,
      images: product.images,
      category: product.category,
      stock: product.stock,
      inStock: product.inStock,
      featured: product.featured,
      bestSeller: product.bestSeller,
      ratings: product.ratings,
      averageRating: product.averageRating,
      numReviews: product.numReviews,
      tags: product.tags,
      createdBy: product.createdBy,
      deletedBy: session?.user?.id,
    });

    await Review.deleteMany({ product: product._id });
    await Product.findByIdAndDelete(id);

    await Category.findByIdAndUpdate(product.category, {
      $inc: { productCount: -1 },
    });

    return NextResponse.json({ message: "Product moved to deleted folder" });
  } catch (error) {
    console.error("Product delete error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
