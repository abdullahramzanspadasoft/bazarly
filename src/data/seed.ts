import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Category from "@/models/Category";
import Product from "@/models/Product";
import Coupon from "@/models/Coupon";
import { slugify } from "@/lib/utils";

const categories = [
  {
    name: "Airpods",
    description: "Premium wireless earbuds with crystal-clear sound and all-day comfort.",
    image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800&q=80",
  },
  {
    name: "Kids Toys",
    description: "Soft plush toys and fun collectibles for kids and the young at heart.",
    image: "/categories/kids-toys.png",
  },
  {
    name: "Watches",
    description: "Exquisite timepieces from renowned brands. Precision engineering meets timeless elegance.",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
  },
];

const products = [
  // Men's Suits
  {
    title: "Classic Navy Three-Piece Suit",
    description: "A timeless navy three-piece suit crafted from premium Italian wool. Features a slim-fit jacket, matching waistcoat, and flat-front trousers. Perfect for business meetings, weddings, and formal occasions. Includes functional button cuffs and a half-canvas construction for superior drape.",
    price: 899,
    discount: 15,
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80",
    ],
    category: "Men's Suits",
    stock: 25,
    featured: true,
    bestSeller: true,
    tags: ["suit", "navy", "formal", "three-piece"],
    ratings: [5, 4, 5, 5, 4, 5, 4, 5],
  },
  {
    title: "Charcoal Grey Slim Fit Suit",
    description: "Sophisticated charcoal grey suit with a contemporary slim fit silhouette. Made from Super 120s wool blend for year-round comfort. Features peak lapels, jetted pockets, and a modern two-button closure. Ideal for corporate environments and evening events.",
    price: 749,
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    ],
    category: "Men's Suits",
    stock: 18,
    featured: true,
    bestSeller: false,
    tags: ["suit", "grey", "slim-fit", "business"],
    ratings: [4, 5, 4, 4, 5, 4],
  },
  {
    title: "Black Tuxedo Dinner Suit",
    description: "Elegant black tuxedo for black-tie events and galas. Satin peak lapels, satin-covered buttons, and satin stripe on trousers. Includes a matching bow tie and cummerbund. Tailored from fine merino wool for a luxurious feel.",
    price: 1299,
    discount: 20,
    images: [
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    ],
    category: "Men's Suits",
    stock: 12,
    featured: true,
    bestSeller: true,
    tags: ["tuxedo", "black-tie", "formal", "dinner"],
    ratings: [5, 5, 5, 4, 5, 5, 5],
  },
  {
    title: "Light Grey Linen Summer Suit",
    description: "Breathable linen-blend suit perfect for warm weather occasions. Relaxed fit with unstructured shoulders for casual elegance. Features patch pockets and a soft construction. Ideal for garden parties, summer weddings, and resort wear.",
    price: 599,
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1593030767877-71a705c2d2e?w=800&q=80",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80",
    ],
    category: "Men's Suits",
    stock: 30,
    featured: false,
    bestSeller: false,
    tags: ["linen", "summer", "casual", "light-grey"],
    ratings: [4, 4, 5, 3, 4],
  },
  {
    title: "Burgundy Velvet Dinner Jacket",
    description: "Statement burgundy velvet dinner jacket for the discerning gentleman. Shawl collar with satin trim, single-button closure. Pairs beautifully with black trousers for a sophisticated evening look. Limited edition piece.",
    price: 849,
    discount: 25,
    images: [
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80",
      "https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=800&q=80",
    ],
    category: "Men's Suits",
    stock: 8,
    featured: true,
    bestSeller: false,
    tags: ["velvet", "burgundy", "dinner-jacket", "evening"],
    ratings: [5, 5, 4, 5],
  },
  {
    title: "Pinstripe Double-Breasted Suit",
    description: "Bold pinstripe double-breasted suit that commands attention. Six-button configuration with peak lapels. Crafted from premium worsted wool with a classic fit. A power suit for boardrooms and high-stakes meetings.",
    price: 999,
    discount: 12,
    images: [
      "https://images.unsplash.com/photo-1593030767877-71a705c2d2e?w=800&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80",
    ],
    category: "Men's Suits",
    stock: 15,
    featured: false,
    bestSeller: true,
    tags: ["pinstripe", "double-breasted", "power-suit"],
    ratings: [4, 5, 4, 5, 4, 4, 5],
  },
  // Luxury Watches
  {
    title: "Chronograph Sport Steel Watch",
    description: "Precision chronograph with a 42mm stainless steel case and sapphire crystal. Features a tachymeter bezel, date display, and luminous hands. Water resistant to 100m. Swiss automatic movement with 48-hour power reserve.",
    price: 4500,
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      "https://images.unsplash.com/photo-1524592312884-fffc6a2d2a?w=800&q=80",
    ],
    category: "Watches",
    stock: 10,
    featured: true,
    bestSeller: true,
    tags: ["chronograph", "sport", "steel", "automatic"],
    ratings: [5, 5, 4, 5, 5, 5],
  },
  {
    title: "Rose Gold Dress Watch",
    description: "Elegant 40mm rose gold dress watch with an ivory dial and Roman numeral markers. Ultra-thin case profile at just 7.5mm. Hand-stitched alligator leather strap with rose gold deployant clasp. Manual-wind movement visible through exhibition caseback.",
    price: 8900,
    discount: 15,
    images: [
      "https://images.unsplash.com/photo-1524592312884-fffc6a2d2a?w=800&q=80",
      "https://images.unsplash.com/photo-1548171914-e79a0902e4a?w=800&q=80",
    ],
    category: "Watches",
    stock: 6,
    featured: true,
    bestSeller: false,
    tags: ["rose-gold", "dress", "leather", "manual-wind"],
    ratings: [5, 5, 5, 5, 4],
  },
  {
    title: "Diver's Automatic Watch",
    description: "Professional-grade diver's watch rated to 300m. 44mm brushed titanium case with unidirectional ceramic bezel. Helium escape valve and screw-down crown. Super-LumiNova coated indices and hands. COSC-certified chronometer movement.",
    price: 6200,
    discount: 8,
    images: [
      "https://images.unsplash.com/photo-1548171914-e79a0902e4a?w=800&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    ],
    category: "Watches",
    stock: 14,
    featured: true,
    bestSeller: true,
    tags: ["diver", "titanium", "automatic", "chronometer"],
    ratings: [5, 4, 5, 5, 5, 4, 5],
  },
  {
    title: "Skeleton Tourbillon Watch",
    description: "Masterpiece of horological art featuring a visible tourbillon complication. 18k white gold case with skeletonized dial revealing intricate movement finishing. Hand-engraved bridges and blued steel screws. Limited to 50 pieces worldwide.",
    price: 45000,
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80",
      "https://images.unsplash.com/photo-1524592312884-fffc6a2d2a?w=800&q=80",
    ],
    category: "Watches",
    stock: 3,
    featured: true,
    bestSeller: false,
    tags: ["tourbillon", "skeleton", "white-gold", "limited-edition"],
    ratings: [5, 5, 5, 5, 5],
  },
  {
    title: "Classic Moonphase Watch",
    description: "Refined 39mm dress watch with moonphase complication at 6 o'clock. Silver sunburst dial with applied baton indices. Polished steel case with display caseback. Automatic movement with 72-hour power reserve and COSC certification.",
    price: 7800,
    discount: 12,
    images: [
      "https://images.unsplash.com/photo-1587836374828-4dbafa94de0f?w=800&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    ],
    category: "Watches",
    stock: 9,
    featured: false,
    bestSeller: true,
    tags: ["moonphase", "dress", "automatic", "steel"],
    ratings: [5, 4, 5, 5, 4, 5],
  },
  {
    title: "GMT Traveler Watch",
    description: "Dual-timezone GMT watch for the global traveler. 42mm case with bi-directional rotating GMT bezel in blue and black ceramic. Independent GMT hand with 24-hour display. Quick-set date and hacking seconds. 70-hour power reserve.",
    price: 5400,
    discount: 18,
    images: [
      "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=800&q=80",
      "https://images.unsplash.com/photo-1548171914-e79a0902e4a?w=800&q=80",
    ],
    category: "Watches",
    stock: 11,
    featured: false,
    bestSeller: false,
    tags: ["gmt", "traveler", "dual-timezone", "ceramic"],
    ratings: [4, 5, 4, 4, 5, 5],
  },
  // Electronics
  {
    title: "Pro Wireless Earbuds ANC",
    description: "Premium true wireless earbuds with active noise cancellation, 36-hour battery life with case, IPX5 water resistance, and crystal-clear call quality. Features adaptive EQ and multipoint Bluetooth 5.3 connectivity.",
    price: 149,
    discount: 20,
    images: [
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80",
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800&q=80",
    ],
    category: "Electronics",
    stock: 45,
    featured: true,
    bestSeller: true,
    tags: ["earbuds", "wireless", "anc", "bluetooth"],
    ratings: [5, 4, 5, 5, 4, 5],
  },
  {
    title: "Ultra Slim Power Bank 20000mAh",
    description: "High-capacity 20000mAh power bank with 65W USB-C PD fast charging. Charges laptops, tablets, and phones simultaneously. Aircraft-safe, LED display shows remaining power. Premium aluminum body.",
    price: 79,
    discount: 15,
    images: [
      "https://images.unsplash.com/photo-1609091839311-9ed94a1a1f8?w=800&q=80",
      "https://images.unsplash.com/photo-1583863788433-e58f8d8b0e8?w=800&q=80",
    ],
    category: "Electronics",
    stock: 60,
    featured: true,
    bestSeller: true,
    tags: ["power-bank", "charging", "usb-c", "portable"],
    ratings: [4, 5, 4, 5, 5],
  },
  {
    title: "Smart Fitness Watch Pro",
    description: "Advanced fitness tracker with heart rate, SpO2, sleep monitoring, and GPS. 1.4\" AMOLED display, 14-day battery, 110+ workout modes. Water resistant to 50m. Compatible with iOS and Android.",
    price: 249,
    discount: 18,
    images: [
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17?w=800&q=80",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
    ],
    category: "Electronics",
    stock: 35,
    featured: true,
    bestSeller: false,
    tags: ["smartwatch", "fitness", "gps", "health"],
    ratings: [5, 4, 5, 4, 5, 5, 4],
  },
  {
    title: "Portable Bluetooth Speaker",
    description: "360° surround sound portable speaker with deep bass and 24-hour playtime. IP67 waterproof and dustproof. Party mode pairs two speakers for stereo. Built-in microphone for calls.",
    price: 129,
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e?w=800&q=80",
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80",
    ],
    category: "Electronics",
    stock: 40,
    featured: false,
    bestSeller: true,
    tags: ["speaker", "bluetooth", "portable", "waterproof"],
    ratings: [4, 5, 5, 4, 4],
  },
  {
    title: "4K Action Camera",
    description: "Compact 4K60fps action camera with electronic stabilization, waterproof to 10m without case. Dual screens, voice control, and WiFi transfer. Includes mounting kit for adventures.",
    price: 299,
    discount: 22,
    images: [
      "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80",
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
    ],
    category: "Electronics",
    stock: 22,
    featured: true,
    bestSeller: false,
    tags: ["camera", "4k", "action", "adventure"],
    ratings: [5, 5, 4, 5, 4],
  },
  {
    title: "Wireless Charging Pad Duo",
    description: "Dual-device wireless charging station for phone and earbuds. 15W fast charge, foreign object detection, and sleek vegan leather surface. Works with all Qi-enabled devices.",
    price: 59,
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1591290619762-d2f8d0c8e8e?w=800&q=80",
      "https://images.unsplash.com/photo-1583863788433-e58f8d8b0e8?w=800&q=80",
    ],
    category: "Electronics",
    stock: 55,
    featured: false,
    bestSeller: false,
    tags: ["charger", "wireless", "qi", "desk"],
    ratings: [4, 4, 5, 4],
  },
  // Portable Hand Fans
  {
    title: "Turbo Cool Mini Hand Fan",
    description: "Pocket-sized portable fan with 3-speed turbo mode delivering up to 5m/s airflow. USB-C rechargeable, 8-hour battery, whisper-quiet operation. Perfect for commuting and outdoor events.",
    price: 29,
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1631540577673-4b1e7e4ae0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80",
    ],
    category: "Portable Hand Fans",
    stock: 80,
    featured: true,
    bestSeller: true,
    tags: ["mini-fan", "portable", "rechargeable", "compact"],
    ratings: [5, 4, 5, 5, 4, 5, 5],
  },
  {
    title: "Bladeless Neck Fan",
    description: "Hands-free bladeless neck fan with 360° cooling. Lightweight ergonomic design, 16-hour battery, 3 airflow modes. Safe for children, ideal for sports, travel, and hot weather.",
    price: 45,
    discount: 15,
    images: [
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80",
      "https://images.unsplash.com/photo-1631540577673-4b1e7e4ae0e2?w=800&q=80",
    ],
    category: "Portable Hand Fans",
    stock: 65,
    featured: true,
    bestSeller: true,
    tags: ["neck-fan", "bladeless", "hands-free", "travel"],
    ratings: [4, 5, 5, 4, 5, 4],
  },
  {
    title: "Mist Spray Hand Fan",
    description: "2-in-1 cooling fan with fine mist spray function. 40ml water tank, 4-hour mist mode, foldable design fits in any bag. Instant relief on scorching summer days.",
    price: 35,
    discount: 12,
    images: [
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
      "https://images.unsplash.com/photo-1631540577673-4b1e7e4ae0e2?w=800&q=80",
    ],
    category: "Portable Hand Fans",
    stock: 50,
    featured: true,
    bestSeller: false,
    tags: ["mist-fan", "spray", "cooling", "summer"],
    ratings: [5, 4, 4, 5, 5],
  },
  {
    title: "Retro Desktop Hand Fan",
    description: "Stylish vintage-inspired desk fan with adjustable tilt and oscillation. Quiet brushless motor, 5 speed settings, remote control included. Elegant addition to home office decor.",
    price: 55,
    discount: 8,
    images: [
      "https://images.unsplash.com/photo-1631540577673-4b1e7e4ae0e2?w=800&q=80",
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80",
    ],
    category: "Portable Hand Fans",
    stock: 38,
    featured: false,
    bestSeller: false,
    tags: ["desk-fan", "retro", "oscillating", "office"],
    ratings: [4, 5, 4, 4, 5],
  },
  {
    title: "Kids Safe Cartoon Hand Fan",
    description: "Child-friendly portable fan with soft foam blades and cute design. BPA-free materials, 6-hour battery, lanyard included. Gentle breeze safe for little ones.",
    price: 19,
    discount: 0,
    images: [
      "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800&q=80",
      "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80",
    ],
    category: "Portable Hand Fans",
    stock: 90,
    featured: false,
    bestSeller: true,
    tags: ["kids", "safe", "cartoon", "foam-blades"],
    ratings: [5, 5, 4, 5, 4, 5],
  },
  // Shoes
  {
    title: "Classic Leather Oxford Shoes",
    description: "Handcrafted full-grain leather Oxford dress shoes with Goodyear welt construction. Cushioned leather insole, leather sole with rubber heel tap. Timeless elegance for formal occasions.",
    price: 289,
    discount: 15,
    images: [
      "https://images.unsplash.com/photo-1614252238956-b8b5b7a5e1e?w=800&q=80",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
    ],
    category: "Shoes",
    stock: 30,
    featured: true,
    bestSeller: true,
    tags: ["oxford", "leather", "formal", "dress-shoes"],
    ratings: [5, 5, 4, 5, 5],
  },
  {
    title: "Premium White Sneakers",
    description: "Minimalist premium white leather sneakers with memory foam insole. Versatile design pairs with suits or casual wear. Durable rubber outsole, padded collar for all-day comfort.",
    price: 159,
    discount: 10,
    images: [
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80",
      "https://images.unsplash.com/photo-1606107557195-0a29cbb1a2b?w=800&q=80",
    ],
    category: "Shoes",
    stock: 55,
    featured: true,
    bestSeller: true,
    tags: ["sneakers", "white", "casual", "leather"],
    ratings: [5, 4, 5, 5, 4, 5, 5],
  },
  {
    title: "Suede Chelsea Boots",
    description: "Luxurious Italian suede Chelsea boots with elastic side panels and pull tab. Blake-stitched construction, leather lining, crepe rubber sole. A wardrobe essential for the modern man.",
    price: 219,
    discount: 18,
    images: [
      "https://images.unsplash.com/photo-1608256246200-53bd3b1c5c?w=800&q=80",
      "https://images.unsplash.com/photo-1614252238956-b8b5b7a5e1e?w=800&q=80",
    ],
    category: "Shoes",
    stock: 28,
    featured: true,
    bestSeller: false,
    tags: ["chelsea", "suede", "boots", "italian"],
    ratings: [5, 5, 5, 4, 5],
  },
  {
    title: "Running Performance Trainers",
    description: "Lightweight performance running shoes with responsive foam midsole and breathable mesh upper. Enhanced heel support, reflective details for night runs. Engineered for speed and comfort.",
    price: 139,
    discount: 20,
    images: [
      "https://images.unsplash.com/photo-1606107557195-0a29cbb1a2b?w=800&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ],
    category: "Shoes",
    stock: 42,
    featured: false,
    bestSeller: true,
    tags: ["running", "trainers", "sport", "performance"],
    ratings: [4, 5, 5, 4, 5, 4, 5],
  },
  {
    title: "Penny Loafer Burgundy",
    description: "Classic burgundy penny loafers in polished calfskin leather. Moccasin construction with hand-stitched apron toe. Versatile slip-on style for business casual and smart occasions.",
    price: 199,
    discount: 12,
    images: [
      "https://images.unsplash.com/photo-1533867617855-6c0c0e0e0e0?w=800&q=80",
      "https://images.unsplash.com/photo-1614252238956-b8b5b7a5e1e?w=800&q=80",
    ],
    category: "Shoes",
    stock: 24,
    featured: false,
    bestSeller: false,
    tags: ["loafer", "burgundy", "calfskin", "slip-on"],
    ratings: [5, 4, 5, 4, 4],
  },
  {
    title: "Hiking Trail Boots",
    description: "Rugged waterproof hiking boots with Vibram outsole and Gore-Tex lining. Ankle support, reinforced toe cap, and moisture-wicking lining. Built for trails and outdoor adventures.",
    price: 179,
    discount: 15,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      "https://images.unsplash.com/photo-1608256246200-53bd3b1c5c?w=800&q=80",
    ],
    category: "Shoes",
    stock: 36,
    featured: false,
    bestSeller: false,
    tags: ["hiking", "boots", "waterproof", "outdoor"],
    ratings: [5, 5, 4, 5, 5, 4],
  },
];

const coupons = [
  {
    code: "WELCOME10",
    discount: 10,
    discountType: "percentage" as const,
    minOrderAmount: 50,
    maxUses: 1000,
    expiresAt: new Date("2027-12-31"),
  },
  {
    code: "SAVE50",
    discount: 50,
    discountType: "fixed" as const,
    minOrderAmount: 200,
    maxUses: 500,
    expiresAt: new Date("2027-06-30"),
  },
  {
    code: "LUXURY25",
    discount: 25,
    discountType: "percentage" as const,
    minOrderAmount: 500,
    maxUses: 200,
    expiresAt: new Date("2027-03-31"),
  },
];

export async function syncCatalog() {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  const allowedSlugs = categories.map((cat) => slugify(cat.name));
  await Category.deleteMany({ slug: { $nin: allowedSlugs } });

  for (const cat of categories) {
    await Category.findOneAndUpdate(
      { slug: slugify(cat.name) },
      { ...cat, slug: slugify(cat.name) },
      { upsert: true, new: true }
    );
  }

  const categoryDocs = await Category.find().lean();

  for (const cat of categoryDocs) {
    const count = await Product.countDocuments({ category: cat._id, createdBy: { $exists: true, $ne: null } });
    await Category.findByIdAndUpdate(cat._id, { productCount: count });
  }

  return {
    categories: categoryDocs.length,
    products: await Product.countDocuments({ createdBy: { $exists: true, $ne: null } }),
  };
}

export async function seedDatabase() {
  if (mongoose.connection.readyState !== 1) {
    await connectDB();
  }

  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  const admin = await User.create({
    name: "Admin User",
    email: "admin@bazaarly.com",
    password: "admin123",
    role: "admin",
  });

  const demoUser = await User.create({
    name: "John Doe",
    email: "demo@bazaarly.com",
    password: "demo123",
    role: "user",
    address: {
      street: "123 Fashion Ave",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
    },
  });

  const categoryDocs = await Category.insertMany(
    categories.map((cat) => ({
      ...cat,
      slug: slugify(cat.name),
    }))
  );

  const categoryMap = Object.fromEntries(
    categoryDocs.map((cat) => [cat.name, cat._id])
  );

  await Product.insertMany(
    products.map((product) => {
      const avgRating =
        product.ratings.reduce((a, b) => a + b, 0) / product.ratings.length;
      return {
        ...product,
        slug: slugify(product.title),
        category: categoryMap[product.category],
        inStock: product.stock > 0,
        averageRating: Math.round(avgRating * 10) / 10,
        numReviews: product.ratings.length,
      };
    })
  );

  await Category.updateMany({}, [
    {
      $set: {
        productCount: {
          $size: {
            $filter: {
              input: products.map((p) => p.category),
              cond: { $eq: ["$$this", "$name"] },
            },
          },
        },
      },
    },
  ]);

  for (const cat of categoryDocs) {
    const count = products.filter((p) => p.category === cat.name).length;
    await Category.findByIdAndUpdate(cat._id, { productCount: count });
  }

  await Coupon.insertMany(coupons);

  return {
    admin: { email: admin.email, password: "admin123" },
    demoUser: { email: demoUser.email, password: "demo123" },
    categories: categoryDocs.length,
    products: products.length,
    coupons: coupons.length,
  };
}
