import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import ChatTyping from "@/models/ChatTyping";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-users";

const TYPING_TIMEOUT_MS = 5000;

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      session?.user?.role !== "admin" ||
      !isAdminEmail(session.user.email || "") ||
      !session.user.id
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, isTyping } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    await connectDB();
    await ChatTyping.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        adminId: session.user.id,
        adminName: session.user.name || "Support",
        isTyping: !!isTyping,
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Typing update error:", error);
    return NextResponse.json({ error: "Failed to update typing status" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ isTyping: false });
    }

    const userId = new URL(req.url).searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    await connectDB();
    const typing = await ChatTyping.findOne({ user: userId }).lean();
    if (!typing?.isTyping) {
      return NextResponse.json({ isTyping: false });
    }

    const updatedAt = typing.updatedAt ? new Date(typing.updatedAt).getTime() : 0;
    const isStale = Date.now() - updatedAt > TYPING_TIMEOUT_MS;

    if (isStale) {
      await ChatTyping.findOneAndUpdate({ user: userId }, { isTyping: false });
      return NextResponse.json({ isTyping: false });
    }

    return NextResponse.json({
      isTyping: true,
      adminName: typing.adminName || "Support",
    });
  } catch (error) {
    console.error("Typing fetch error:", error);
    return NextResponse.json({ isTyping: false });
  }
}
