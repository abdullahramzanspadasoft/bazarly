import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const customers = await User.find({ role: "user" })
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    const customersWithOrders = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ user: customer._id }).lean();
        const totalSpent = orders.reduce((sum, o) => sum + o.total, 0);
        return {
          ...customer,
          orderCount: orders.length,
          totalSpent,
        };
      })
    );

    return NextResponse.json(customersWithOrders);
  } catch (error) {
    console.error("Customers fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}
