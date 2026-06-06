import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICartItem {
  product: mongoose.Types.ObjectId;
  productId: string;
  slug?: string;
  title: string;
  image: string;
  price: number;
  discount: number;
  quantity: number;
  stock: number;
}

export interface ICartDocument extends Document {
  user: mongoose.Types.ObjectId;
  items: ICartItem[];
  couponCode: string;
  couponDiscount: number;
}

const CartItemSchema = new Schema<ICartItem>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productId: { type: String, required: true },
    slug: String,
    title: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    quantity: { type: Number, required: true, min: 1 },
    stock: { type: Number, default: 99 },
  },
  { _id: false }
);

const CartSchema = new Schema<ICartDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [CartItemSchema],
    couponCode: { type: String, default: "" },
    couponDiscount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Cart: Model<ICartDocument> =
  mongoose.models.Cart || mongoose.model<ICartDocument>("Cart", CartSchema);

export default Cart;
