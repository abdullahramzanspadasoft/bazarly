import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ChatMessage from "@/models/ChatMessage";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-users";

function isAdmin(session: { user?: { email?: string | null; role?: string | null } | null } | null) {
  return session?.user?.role === "admin" && isAdminEmail(session.user.email || "");
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = new URL(req.url).searchParams.get("userId");

    await connectDB();

    if (userId) {
      const messages = await ChatMessage.find({ user: userId })
        .sort({ createdAt: 1 })
        .lean();

      await ChatMessage.updateMany(
        { user: userId, senderRole: "user", readByAdmin: false },
        { readByAdmin: true }
      );

      const customer = await User.findById(userId).select("name email").lean();

      return NextResponse.json({ messages, customer });
    }

    const conversations = await ChatMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$user",
          lastMessage: { $first: "$message" },
          lastMessageAt: { $first: "$createdAt" },
          senderName: { $first: "$senderName" },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ["$senderRole", "user"] }, { $eq: ["$readByAdmin", false] }] },
                1,
                0,
              ],
            },
          },
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    const userIds = conversations.map((c) => c._id);
    const users = await User.find({ _id: { $in: userIds } }).select("name email").lean();
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    const result = conversations.map((c) => ({
      userId: c._id.toString(),
      customer: userMap[c._id.toString()] || { name: c.senderName, email: "" },
      lastMessage: c.lastMessage,
      lastMessageAt: c.lastMessageAt,
      unreadCount: c.unreadCount,
    }));

    return NextResponse.json({ conversations: result });
  } catch (error) {
    console.error("Admin messages fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!isAdmin(session) || !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, message } = await req.json();
    if (!userId || !message?.trim()) {
      return NextResponse.json({ error: "User and message required" }, { status: 400 });
    }

    await connectDB();
    const chatMessage = await ChatMessage.create({
      user: userId,
      sender: session.user.id,
      senderRole: "admin",
      senderName: session.user.name || "Admin",
      message: message.trim(),
      readByAdmin: true,
      readByUser: false,
    });

    return NextResponse.json({ message: chatMessage }, { status: 201 });
  } catch (error) {
    console.error("Admin reply error:", error);
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}
