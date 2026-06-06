import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

interface CartItemInput {
  productId: string;
  slug?: string;
  title: string;
  image?: string;
  price: number;
  discount?: number;
  quantity: number;
  stock?: number;
}

async function resolveProductId(item: CartItemInput) {
  if (mongoose.Types.ObjectId.isValid(item.productId)) {
    const product = await Product.findById(item.productId);
    if (product) return product._id;
  }
  if (item.slug) {
    const product = await Product.findOne({ slug: item.slug });
    if (product) return product._id;
  }
  const product = await Product.findOne({ title: item.title });
  return product?._id ?? new mongoose.Types.ObjectId(item.productId);
}

function mergeCartItems(existing: CartItemInput[], incoming: CartItemInput[]) {
  const merged = [...existing];

  for (const item of incoming) {
    const index = merged.findIndex((entry) => entry.productId === item.productId);
    if (index >= 0) {
      const stock = merged[index].stock ?? item.stock ?? 99;
      merged[index] = {
        ...merged[index],
        ...item,
        quantity: Math.min(merged[index].quantity + item.quantity, stock),
        stock,
      };
    } else {
      merged.push(item);
    }
  }

  return merged;
}

async function buildCartItems(items: CartItemInput[]) {
  const cartItems = [];

  for (const item of items) {
    const productId = await resolveProductId(item);
    cartItems.push({
      product: productId,
      productId: productId.toString(),
      slug: item.slug,
      title: item.title,
      image: item.image || "",
      price: item.price,
      discount: item.discount ?? 0,
      quantity: item.quantity,
      stock: item.stock ?? 99,
    });
  }

  return cartItems;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    let cart = await Cart.findOne({ user: session.user.id }).lean();

    if (!cart) {
      cart = await Cart.create({
        user: session.user.id,
        items: [],
        couponCode: "",
        couponDiscount: 0,
      }).then((doc) => doc.toObject());
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items = [], couponCode = "", couponDiscount = 0, merge = false } = body;

    await connectDB();
    const existing = await Cart.findOne({ user: session.user.id });
    const mergedItems = merge
      ? mergeCartItems(
          (existing?.items ?? []).map((item) => ({
            productId: item.productId,
            slug: item.slug,
            title: item.title,
            image: item.image,
            price: item.price,
            discount: item.discount,
            quantity: item.quantity,
            stock: item.stock,
          })),
          items as CartItemInput[]
        )
      : (items as CartItemInput[]);

    const cartItems = await buildCartItems(mergedItems);

    const cart = await Cart.findOneAndUpdate(
      { user: session.user.id },
      {
        user: session.user.id,
        items: cartItems,
        couponCode,
        couponDiscount,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ cart });
  } catch (error) {
    console.error("Cart save error:", error);
    return NextResponse.json({ error: "Failed to save cart" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const cart = await Cart.findOneAndUpdate(
      { user: session.user.id },
      { items: [], couponCode: "", couponDiscount: 0 },
      { upsert: true, new: true }
    );

    return NextResponse.json({ cart, message: "Cart cleared" });
  } catch (error) {
    console.error("Cart clear error:", error);
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 });
  }
}
