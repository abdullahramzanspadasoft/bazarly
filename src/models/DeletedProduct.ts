import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDeletedProductDocument extends Document {
  originalProductId: mongoose.Types.ObjectId;
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
  deletedAt: Date;
  deletedBy?: mongoose.Types.ObjectId;
}

const DeletedProductSchema = new Schema<IDeletedProductDocument>(
  {
    originalProductId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    images: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    stock: { type: Number, default: 0 },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    ratings: [{ type: Number }],
    averageRating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    tags: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date, default: Date.now },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

DeletedProductSchema.index({ deletedAt: -1 });
DeletedProductSchema.index({ originalProductId: 1 });

const DeletedProduct: Model<IDeletedProductDocument> =
  mongoose.models.DeletedProduct ||
  mongoose.model<IDeletedProductDocument>("DeletedProduct", DeletedProductSchema);

export default DeletedProduct;
