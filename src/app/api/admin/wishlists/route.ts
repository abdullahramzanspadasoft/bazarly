import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const wishlists = await Wishlist.find()
      .populate("user", "name email")
      .populate("product", "title slug")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ wishlists });
  } catch (error) {
    console.error("Admin wishlists fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch wishlists" }, { status: 500 });
  }
}
