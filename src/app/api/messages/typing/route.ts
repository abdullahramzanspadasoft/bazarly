import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ChatTyping from "@/models/ChatTyping";
import { auth } from "@/lib/auth";

const TYPING_TIMEOUT_MS = 5000;

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ isTyping: false });
    }

    await connectDB();
    const typing = await ChatTyping.findOne({ user: session.user.id }).lean();

    if (!typing?.isTyping) {
      return NextResponse.json({ isTyping: false });
    }

    const updatedAt = typing.updatedAt ? new Date(typing.updatedAt).getTime() : 0;
    const isStale = Date.now() - updatedAt > TYPING_TIMEOUT_MS;

    if (isStale) {
      await ChatTyping.findOneAndUpdate({ user: session.user.id }, { isTyping: false });
      return NextResponse.json({ isTyping: false });
    }

    return NextResponse.json({
      isTyping: true,
      adminName: typing.adminName || "Support",
    });
  } catch (error) {
    console.error("User typing fetch error:", error);
    return NextResponse.json({ isTyping: false });
  }
}
