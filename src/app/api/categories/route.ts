import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { auth } from "@/lib/auth";
import { categorySchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { getCategoriesWithCounts } from "@/lib/categories";

export async function GET() {
  try {
    const categories = await getCategoriesWithCounts();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = categorySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();
    const category = await Category.create({
      ...validated.data,
      slug: slugify(validated.data.name),
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Category create error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
