import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import Payment from "@/models/Payment";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [
      totalOrders,
      totalRevenue,
      totalProducts,
      totalCustomers,
      recentOrders,
      topProducts,
      monthlySales,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $match: { paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Product.countDocuments(),
      User.countDocuments({ role: "user" }),
      Order.find()
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            totalSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
            title: { $first: "$items.title" },
          },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            revenue: { $sum: "$total" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    const pendingOrders = await Order.countDocuments({ orderStatus: "pending" });
    const payments = await Payment.aggregate([
      { $group: { _id: "$method", count: { $sum: 1 }, total: { $sum: "$amount" } } },
    ]);

    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalProducts,
        totalCustomers,
        pendingOrders,
      },
      recentOrders,
      topProducts,
      monthlySales,
      payments,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
