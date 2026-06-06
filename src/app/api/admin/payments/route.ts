import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Payment from "@/models/Payment";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const payments = await Payment.find()
      .populate("user", "name email")
      .populate("order", "orderNumber total")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Payments fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch payments" }, { status: 500 });
  }
}
