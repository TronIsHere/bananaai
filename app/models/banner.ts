import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBanner extends Document {
  isActive: boolean; // Whether the banner is currently active
  imageUrl: string; // Banner image or GIF URL
  link: string; // Link to route when banner is clicked
  height: "small" | "medium" | "large"; // Banner height preset
  customHeight?: number; // Optional custom height in pixels
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema(
  {
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    link: {
      type: String,
      required: true,
      trim: true,
    },
    height: {
      type: String,
      enum: ["small", "medium", "large"],
      required: true,
      default: "small",
    },
    customHeight: {
      type: Number,
      min: 100,
      max: 600,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
BannerSchema.index({ isActive: 1 });

// Prevent re-compilation during development
const Banner: Model<IBanner> =
  mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema);

export default Banner;
