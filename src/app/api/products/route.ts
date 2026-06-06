import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { auth } from "@/lib/auth";
import { canManageProducts } from "@/lib/admin-users";
import { productSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { adminProductFilter } from "@/lib/products";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const featured = searchParams.get("featured");
    const bestSeller = searchParams.get("bestSeller");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") === "asc" ? 1 : -1;

    const filter: Record<string, unknown> = { ...adminProductFilter };

    if (search) {
      filter.$text = { $search: search };
    }
    if (category) {
      filter.category = category;
    }
    if (featured === "true") {
      filter.featured = true;
    }
    if (bestSeller === "true") {
      filter.bestSeller = true;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, number>).$gte = parseFloat(minPrice);
      if (maxPrice) (filter.price as Record<string, number>).$lte = parseFloat(maxPrice);
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("category", "name slug")
        .sort({ [sort]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!canManageProducts(session?.user?.email, session?.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Session expired — please log in again" }, { status: 401 });
    }

    const body = await req.json();
    const validated = productSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.issues[0].message },
        { status: 400 }
      );
    }

    await connectDB();
    const baseSlug = slugify(validated.data.title);
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const product = await Product.create({
      ...validated.data,
      slug,
      images: body.images?.length
        ? body.images
        : ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80"],
      inStock: validated.data.stock > 0,
      createdBy: session.user.id,
      featured: true,
    });

    await Category.findByIdAndUpdate(validated.data.category, {
      $inc: { productCount: 1 },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Product create error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
