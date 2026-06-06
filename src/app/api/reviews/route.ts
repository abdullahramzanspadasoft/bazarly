import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";
import { reviewSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = reviewSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { productId } = body;
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    await connectDB();

    const existing = await Review.findOne({
      user: session.user.id,
      product: productId,
    });
    if (existing) {
      return NextResponse.json({ error: "You already reviewed this product" }, { status: 400 });
    }

    const review = await Review.create({
      user: session.user.id,
      product: productId,
      ...validated.data,
    });

    const product = await Product.findById(productId);
    if (product) {
      product.ratings.push(validated.data.rating);
      product.numReviews = product.ratings.length;
      product.averageRating =
        product.ratings.reduce((a, b) => a + b, 0) / product.ratings.length;
      await product.save();
    }

    const populated = await Review.findById(review._id)
      .populate("user", "name avatar")
      .lean();

    return NextResponse.json(populated, { status: 201 });
  } catch (error) {
    console.error("Review create error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}
