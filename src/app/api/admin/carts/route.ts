import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const carts = await Cart.find()
      .populate("user", "name email")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({ carts });
  } catch (error) {
    console.error("Admin carts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch carts" }, { status: 500 });
  }
}
