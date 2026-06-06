import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

async function resolveProduct(productId: string, title?: string) {
  if (mongoose.Types.ObjectId.isValid(productId)) {
    const product = await Product.findById(productId);
    if (product) return product;
  }
  if (title) {
    const product = await Product.findOne({ title });
    if (product) return product;
  }
  return null;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const items = await Wishlist.find({ user: session.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, title, image, price, discount = 0 } = body;

    if (!productId || !title) {
      return NextResponse.json({ error: "Product details required" }, { status: 400 });
    }

    await connectDB();
    const product = await resolveProduct(productId, title);
    const resolvedId = product?._id ?? new mongoose.Types.ObjectId(productId);

    const item = await Wishlist.findOneAndUpdate(
      { user: session.user.id, product: resolvedId },
      {
        user: session.user.id,
        product: resolvedId,
        productId: resolvedId.toString(),
        title: product?.title ?? title,
        image: product?.images?.[0] ?? image ?? "",
        price: product?.price ?? price,
        discount: product?.discount ?? discount,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Wishlist add error:", error);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productId = new URL(req.url).searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    await connectDB();
    await Wishlist.findOneAndDelete({
      user: session.user.id,
      $or: [{ productId }, { product: productId }],
    });

    return NextResponse.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Wishlist remove error:", error);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}
