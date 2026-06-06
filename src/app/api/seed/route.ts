import { NextResponse } from "next/server";
import { seedDatabase } from "@/data/seed";

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({
      message: "Database seeded successfully",
      ...result,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Seeding failed" }, { status: 500 });
  }
}
