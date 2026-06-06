import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    await connectDB();
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or expired coupon" }, { status: 400 });
    }

    if (coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
    }

    if (subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        { error: `Minimum order amount is $${coupon.minOrderAmount}` },
        { status: 400 }
      );
    }

    const discount =
      coupon.discountType === "percentage"
        ? (subtotal * coupon.discount) / 100
        : coupon.discount;

    return NextResponse.json({
      code: coupon.code,
      discount,
      discountType: coupon.discountType,
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
