import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ChatMessage from "@/models/ChatMessage";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ unreadCount: 0 });
    }

    await connectDB();
    const unreadCount = await ChatMessage.countDocuments({
      user: session.user.id,
      senderRole: "admin",
      readByUser: false,
    });

    return NextResponse.json({ unreadCount });
  } catch (error) {
    console.error("User unread count error:", error);
    return NextResponse.json({ unreadCount: 0 });
  }
}
