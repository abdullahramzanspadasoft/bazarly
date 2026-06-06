import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ChatMessage from "@/models/ChatMessage";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-users";

function isAdmin(session: { user?: { email?: string | null; role?: string | null } | null } | null) {
  return session?.user?.role === "admin" && isAdminEmail(session.user.email || "");
}

export async function GET() {
  try {
    const session = await auth();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [unreadMessages, unreadPayments] = await Promise.all([
      ChatMessage.find({ senderRole: "user", readByAdmin: false })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Payment.find({ status: "completed", readByAdmin: false })
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const messageUserIds = [...new Set(unreadMessages.map((m) => m.user.toString()))];
    const paymentUserIds = [...new Set(unreadPayments.map((p) => p.user.toString()))];
    const paymentOrderIds = unreadPayments.map((p) => p.order);

    const [users, orders] = await Promise.all([
      User.find({ _id: { $in: [...messageUserIds, ...paymentUserIds] } })
        .select("name email")
        .lean(),
      Order.find({ _id: { $in: paymentOrderIds } }).select("orderNumber").lean(),
    ]);

    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));
    const orderMap = Object.fromEntries(orders.map((o) => [o._id.toString(), o]));

    const messageNotifications = unreadMessages.map((msg) => ({
      type: "message" as const,
      _id: msg._id.toString(),
      userId: msg.user.toString(),
      customerName: userMap[msg.user.toString()]?.name || msg.senderName,
      customerEmail: userMap[msg.user.toString()]?.email || "",
      message: msg.message,
      createdAt: msg.createdAt,
    }));

    const paymentNotifications = unreadPayments.map((payment) => ({
      type: "payment" as const,
      _id: payment._id.toString(),
      orderId: payment.order.toString(),
      orderNumber: orderMap[payment.order.toString()]?.orderNumber || "",
      customerName: userMap[payment.user.toString()]?.name || "Customer",
      customerEmail: userMap[payment.user.toString()]?.email || "",
      amount: payment.amount,
      method: payment.method,
      createdAt: payment.updatedAt || payment.createdAt,
    }));

    const notifications = [...messageNotifications, ...paymentNotifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      unreadCount: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Admin notifications fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paymentId } = await req.json();
    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID required" }, { status: 400 });
    }

    await connectDB();
    await Payment.findByIdAndUpdate(paymentId, { readByAdmin: true });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Mark payment read error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
