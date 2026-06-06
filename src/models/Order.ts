import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderDocument extends Document {
  user: mongoose.Types.ObjectId;
  orderNumber: string;
  items: {
    product: mongoose.Types.ObjectId;
    title: string;
    image: string;
    price: number;
    quantity: number;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: "stripe" | "paypal" | "cod" | "card";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  couponCode?: string;
  trackingNumber?: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  paidAt?: Date;
  deliveredAt?: Date;
}

const OrderSchema = new Schema<IOrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, required: true, unique: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        title: { type: String, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zipCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      enum: ["stripe", "paypal", "cod", "card"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    total: { type: Number, required: true },
    couponCode: String,
    trackingNumber: String,
    stripePaymentIntentId: String,
    paypalOrderId: String,
    paidAt: Date,
    deliveredAt: Date,
  },
  { timestamps: true }
);

const Order: Model<IOrderDocument> =
  mongoose.models.Order || mongoose.model<IOrderDocument>("Order", OrderSchema);

export default Order;
