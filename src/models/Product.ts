import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProductDocument extends Document {
  title: string;
  slug: string;
  description: string;
  price: number;
  discount: number;
  images: string[];
  category: mongoose.Types.ObjectId;
  stock: number;
  inStock: boolean;
  featured: boolean;
  bestSeller: boolean;
  ratings: number[];
  averageRating: number;
  numReviews: number;
  tags: string[];
  createdBy?: mongoose.Types.ObjectId;
}

const ProductSchema = new Schema<IProductDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    images: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    stock: { type: Number, default: 0, min: 0 },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    ratings: [{ type: Number, min: 1, max: 5 }],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    tags: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ProductSchema.index({ title: "text", description: "text", tags: "text" });

const Product: Model<IProductDocument> =
  mongoose.models.Product || mongoose.model<IProductDocument>("Product", ProductSchema);

export default Product;
