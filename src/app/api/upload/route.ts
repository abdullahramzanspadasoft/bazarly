import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { canManageProducts } from "@/lib/admin-users";
import { isCloudinaryConfigured, uploadImageToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!canManageProducts(session?.user?.email, session?.user?.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    let buffer: Buffer;
    let ext = "jpg";

    if (contentType.includes("application/json")) {
      const { image } = await req.json();
      if (!image) {
        return NextResponse.json({ error: "No image data" }, { status: 400 });
      }

      const matches = image.match(/^data:image\/(\w+);base64,(.+)$/);
      if (matches) {
        ext = matches[1] === "jpeg" ? "jpg" : matches[1];
        buffer = Buffer.from(matches[2], "base64");
      } else {
        buffer = Buffer.from(image, "base64");
      }
    } else {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      buffer = Buffer.from(bytes);
      const nameParts = file.name.split(".");
      if (nameParts.length > 1) {
        ext = nameParts.pop()!.toLowerCase();
      }
    }

    if (buffer.length > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image must be under 5MB" }, { status: 400 });
    }

    // Vercel has a read-only filesystem — use Cloudinary in production
    if (isCloudinaryConfigured()) {
      const url = await uploadImageToCloudinary(buffer, ext);
      return NextResponse.json({ url });
    }

    if (process.env.VERCEL) {
      return NextResponse.json(
        {
          error:
            "Image upload not configured on server. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in Vercel environment variables.",
        },
        { status: 500 }
      );
    }

    // Local development fallback — save to public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const filename = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    await writeFile(filepath, buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
