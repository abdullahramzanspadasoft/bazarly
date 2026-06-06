import { NextResponse } from "next/server";
import { syncCatalog } from "@/data/seed";

export async function POST() {
  try {
    const result = await syncCatalog();
    return NextResponse.json({
      message: "Catalog synced successfully",
      ...result,
    });
  } catch (error) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
