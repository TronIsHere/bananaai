import mongoose, { Schema, Document, Model } from "mongoose";

export interface IMessage {
  content: string;
  sender: "user" | "admin";
  senderId?: string; // User ID for user messages
  senderMobile?: string; // Admin mobile number for admin messages
  createdAt: Date;
}

export interface IContact extends Document {
  name: string;
  email: string;
  subject: string;
  message: string; // Initial message (kept for backward compatibility)
  status: "pending" | "responded" | "closed";
  response?: string; // Kept for backward compatibility
  respondedAt?: Date;
  respondedBy?: string; // Admin mobile number
  userId?: string; // User ID for support tickets (optional for anonymous contact form)
  type: "contact" | "support"; // Type: contact form or support ticket
  messages: IMessage[]; // Array of messages for chat functionality
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: ["pending", "responded", "closed"],
      default: "pending",
    },
    response: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    respondedAt: {
      type: Date,
    },
    respondedBy: {
      type: String,
      trim: true,
    },
    userId: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["contact", "support"],
      default: "contact",
    },
    messages: {
      type: [
        {
          content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
          },
          sender: {
            type: String,
            enum: ["user", "admin"],
            required: true,
          },
          senderId: {
            type: String,
            trim: true,
          },
          senderMobile: {
            type: String,
            trim: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
ContactSchema.index({ status: 1, createdAt: -1 });
ContactSchema.index({ createdAt: -1 });
ContactSchema.index({ userId: 1, createdAt: -1 });
ContactSchema.index({ type: 1, createdAt: -1 });

// Prevent re-compilation during development
const Contact: Model<IContact> =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", ContactSchema);

export default Contact;

