import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Product from "@/models/Product";
import { ADMIN_USERS } from "@/lib/admin-users";
import { removeSeedProducts } from "@/lib/products";
import { syncCategoryProductCounts } from "@/lib/categories";

export async function POST() {
  try {
    await connectDB();

    const admins = [];
    for (const admin of ADMIN_USERS) {
      let user = await User.findOne({ email: admin.email.toLowerCase() });
      if (user) {
        user.role = "admin";
        user.name = admin.name;
        if (admin.password) user.password = admin.password;
        await user.save();
      } else {
        user = await User.create({
          name: admin.name,
          email: admin.email.toLowerCase(),
          password: admin.password,
          role: "admin",
        });
      }
      admins.push({ email: user.email, role: user.role });
    }

    const removed = await removeSeedProducts();
    await syncCategoryProductCounts();

    return NextResponse.json({
      message: "Admin users ready. Seed products cleared. Only admin-added products will show in shop.",
      admins,
      removedSeedProducts: removed,
      adminProducts: await Product.countDocuments({ createdBy: { $exists: true, $ne: null } }),
    });
  } catch (error) {
    console.error("Setup users error:", error);
    return NextResponse.json({ error: "Setup failed" }, { status: 500 });
  }
}
