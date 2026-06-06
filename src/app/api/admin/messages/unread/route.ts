import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ChatMessage from "@/models/ChatMessage";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-users";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin" || !isAdminEmail(session.user.email || "")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const [unreadCount, recentMessages] = await Promise.all([
      ChatMessage.countDocuments({ senderRole: "user", readByAdmin: false }),
      ChatMessage.find({ senderRole: "user", readByAdmin: false })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
    ]);

    const userIds = [...new Set(recentMessages.map((m) => m.user.toString()))];
    const users = await User.find({ _id: { $in: userIds } }).select("name email").lean();
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    const notifications = recentMessages.map((msg) => ({
      _id: msg._id.toString(),
      userId: msg.user.toString(),
      customerName: userMap[msg.user.toString()]?.name || msg.senderName,
      customerEmail: userMap[msg.user.toString()]?.email || "",
      message: msg.message,
      createdAt: msg.createdAt,
    }));

    return NextResponse.json({ unreadCount, notifications });
  } catch (error) {
    console.error("Unread notifications error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
