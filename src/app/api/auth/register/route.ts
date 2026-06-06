import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validations";
import { isAdminEmail } from "@/lib/admin-users";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = registerSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = validated.data;

    await connectDB();
    const existing = await User.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: isAdminEmail(email) ? "admin" : "user",
    });

    return NextResponse.json(
      { message: "Registration successful", userId: user._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
