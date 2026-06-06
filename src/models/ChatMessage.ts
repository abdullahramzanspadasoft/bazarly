import mongoose, { Schema, Document, Model } from "mongoose";

export interface IChatMessageDocument extends Document {
  user: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  senderRole: "user" | "admin";
  senderName: string;
  message: string;
  readByAdmin: boolean;
  readByUser: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessageDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["user", "admin"], required: true },
    senderName: { type: String, required: true },
    message: { type: String, required: true, trim: true },
    readByAdmin: { type: Boolean, default: false },
    readByUser: { type: Boolean, default: true },
  },
  { timestamps: true }
);

ChatMessageSchema.index({ user: 1, createdAt: 1 });
ChatMessageSchema.index({ readByAdmin: 1, senderRole: 1 });

const ChatMessage: Model<IChatMessageDocument> =
  mongoose.models.ChatMessage ||
  mongoose.model<IChatMessageDocument>("ChatMessage", ChatMessageSchema);

export default ChatMessage;
