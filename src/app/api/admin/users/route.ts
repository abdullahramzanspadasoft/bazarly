import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-users";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const allUsers = await User.find()
      .select("-password -resetPasswordToken -resetPasswordExpires")
      .sort({ createdAt: -1 })
      .lean();

    const admins = allUsers
      .filter((u) => u.role === "admin")
      .map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || "",
        isPrimaryAdmin: isAdminEmail(u.email),
        createdAt: u.createdAt,
      }));

    const users = allUsers
      .filter((u) => u.role === "user")
      .map((u) => ({
        _id: u._id,
        name: u.name,
        email: u.email,
        phone: u.phone || "",
        createdAt: u.createdAt,
      }));

    return NextResponse.json({ admins, users });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
