import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bazaarly";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  seeded: boolean;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
  var memoryMongoServer: MongoMemoryServer | undefined;
  var resolvedMongoUri: string | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
  seeded: false,
};
global.mongooseCache = cached;

async function resolveMongoUri(): Promise<string> {
  if (global.resolvedMongoUri) return global.resolvedMongoUri;

  const configuredUri = process.env.MONGODB_URI || MONGODB_URI;

  // When MONGODB_URI is set, always use it — never fall back to in-memory
  if (process.env.MONGODB_URI || process.env.NODE_ENV === "production") {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const testConn = await mongoose
          .createConnection(configuredUri, { serverSelectionTimeoutMS: 8000 })
          .asPromise();
        await testConn.close();
        global.resolvedMongoUri = configuredUri;
        console.log("Connected to MongoDB:", configuredUri);
        return configuredUri;
      } catch (err) {
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }

  // Dev fallback only when no MONGODB_URI is configured
  try {
    const testConn = await mongoose
      .createConnection(MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
      .asPromise();
    await testConn.close();
    global.resolvedMongoUri = MONGODB_URI;
    return MONGODB_URI;
  } catch {
    if (!global.memoryMongoServer) {
      global.memoryMongoServer = await MongoMemoryServer.create();
      console.warn("No MongoDB available — using in-memory database (data will not persist)");
    }
    global.resolvedMongoUri = global.memoryMongoServer.getUri();
    return global.resolvedMongoUri;
  }
}

async function autoSeedIfNeeded() {
  if (cached.seeded) return;

  const { syncCatalog } = await import("@/data/seed");
  const { removeSeedProducts } = await import("@/lib/products");
  const { default: User } = await import("@/models/User");
  const { ADMIN_USERS } = await import("@/lib/admin-users");

  await syncCatalog();
  await removeSeedProducts();

  // Ensure admin users always exist
  for (const admin of ADMIN_USERS) {
    const user = await User.findOne({ email: admin.email.toLowerCase() });
    if (user) {
      user.role = "admin";
      await user.save();
    } else {
      await User.create({
        name: admin.name,
        email: admin.email.toLowerCase(),
        password: admin.password,
        role: "admin",
      });
    }
  }

  cached.seeded = true;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = (async () => {
      const uri = await resolveMongoUri();
      const conn = await mongoose.connect(uri, { bufferCommands: false });
      cached.conn = conn;
      await autoSeedIfNeeded();
      return conn;
    })();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
