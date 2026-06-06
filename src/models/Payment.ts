import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPaymentDocument extends Document {
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  amount: number;
  method: "stripe" | "paypal" | "cod" | "card";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  readByAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: ["stripe", "paypal", "cod", "card"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    transactionId: String,
    readByAdmin: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Payment: Model<IPaymentDocument> =
  mongoose.models.Payment || mongoose.model<IPaymentDocument>("Payment", PaymentSchema);

export default Payment;
