import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICouponDocument extends Document {
  code: string;
  discount: number;
  discountType: "percentage" | "fixed";
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: Date;
  isActive: boolean;
}

const CouponSchema = new Schema<ICouponDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    discount: { type: Number, required: true, min: 0 },
    discountType: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    minOrderAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Coupon: Model<ICouponDocument> =
  mongoose.models.Coupon || mongoose.model<ICouponDocument>("Coupon", CouponSchema);

export default Coupon;
