import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bazaarly";

async function getUri() {
  try {
    const conn = await mongoose.createConnection(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    }).asPromise();
    await conn.close();
    return MONGODB_URI;
  } catch {
    const server = await MongoMemoryServer.create();
    return server.getUri();
  }
}

async function seed() {
  const uri = await getUri();
  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const User = mongoose.model("User", new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, lowercase: true },
    password: String,
    role: { type: String, default: "user" },
  }));

  await User.deleteMany({});
  const hash = async (pw) => bcrypt.hash(pw, 12);

  await User.create([
    { name: "Admin User", email: "admin@bazaarly.com", password: await hash("admin123"), role: "admin" },
    { name: "John Doe", email: "demo@bazaarly.com", password: await hash("demo123"), role: "user" },
  ]);

  console.log("Seeded demo accounts:");
  console.log("  Admin: admin@bazaarly.com / admin123");
  console.log("  User:  demo@bazaarly.com / demo123");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
