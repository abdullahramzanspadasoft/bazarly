import mongoose, { Schema, Document, Model } from "mongoose";

export interface IWishlistDocument extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  productId: string;
  title: string;
  image: string;
  price: number;
  discount: number;
}

const WishlistSchema = new Schema<IWishlistDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productId: { type: String, required: true },
    title: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

WishlistSchema.index({ user: 1, product: 1 }, { unique: true });

const Wishlist: Model<IWishlistDocument> =
  mongoose.models.Wishlist || mongoose.model<IWishlistDocument>("Wishlist", WishlistSchema);

export default Wishlist;
