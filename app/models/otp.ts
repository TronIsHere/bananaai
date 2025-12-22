import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOTP extends Document {
  mobileNumber: string;
  hashedCode: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

const OTPSchema: Schema = new Schema(
  {
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    hashedCode: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired documents
    },
    attempts: {
      type: Number,
      required: true,
      default: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries and cleanup
OTPSchema.index({ mobileNumber: 1, createdAt: -1 });

// Prevent re-compilation during development
const OTP: Model<IOTP> =
  mongoose.models.OTP || mongoose.model<IOTP>("OTP", OTPSchema);

export default OTP;




