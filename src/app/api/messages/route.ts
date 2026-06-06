import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ChatMessage from "@/models/ChatMessage";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const messages = await ChatMessage.find({ user: session.user.id })
      .sort({ createdAt: 1 })
      .lean();

    await ChatMessage.updateMany(
      { user: session.user.id, senderRole: "admin", readByUser: false },
      { readByUser: true }
    );

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Messages fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please sign in to send a message" }, { status: 401 });
    }

    const { message } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    await connectDB();
    const chatMessage = await ChatMessage.create({
      user: session.user.id,
      sender: session.user.id,
      senderRole: "user",
      senderName: session.user.name || "User",
      message: message.trim(),
      readByAdmin: false,
      readByUser: true,
    });

    return NextResponse.json({ message: chatMessage }, { status: 201 });
  } catch (error) {
    console.error("Message send error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
