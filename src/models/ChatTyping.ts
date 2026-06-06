import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatTypingDocument extends Document {
  user: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  adminName: string;
  isTyping: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatTypingSchema = new Schema<IChatTypingDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    adminId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    adminName: { type: String, default: "Support" },
    isTyping: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ChatTyping: Model<IChatTypingDocument> =
  mongoose.models.ChatTyping ||
  mongoose.model<IChatTypingDocument>("ChatTyping", ChatTypingSchema);

export default ChatTyping;
