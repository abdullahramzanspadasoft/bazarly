import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICategoryDocument extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    productCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Category: Model<ICategoryDocument> =
  mongoose.models.Category || mongoose.model<ICategoryDocument>("Category", CategorySchema);

export default Category;
