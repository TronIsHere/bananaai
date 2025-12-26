import mongoose, { Schema, Document, Model } from "mongoose";

export interface IDiscount extends Document {
  code: string; // Discount code (e.g., "SUMMER2024")
  discountType: "percentage" | "fixed"; // Percentage or fixed amount discount
  discountValue: number; // Percentage (0-100) or fixed amount in Toman
  capacity: number; // Maximum number of times this code can be used
  usedCount: number; // Number of times this code has been used
  expiresAt: Date | null; // Expiry date (null = no expiry)
  isActive: boolean; // Whether the discount code is active
  createdAt: Date;
  updatedAt: Date;
  isValid(): boolean;
  calculateDiscount(originalAmount: number): number;
}

const DiscountSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // Store codes in uppercase
      minlength: 3,
      maxlength: 50,
    },
    discountType: {
      type: String,
      required: true,
      enum: ["percentage", "fixed"],
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    usedCount: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// Note: code field already has unique: true which creates an index, so we don't need to add it again
DiscountSchema.index({ isActive: 1, expiresAt: 1 });

// Method to check if discount code is valid
DiscountSchema.methods.isValid = function (): boolean {
  if (!this.isActive) return false;
  if (this.usedCount >= this.capacity) return false;
  if (this.expiresAt && new Date() > this.expiresAt) return false;
  return true;
};

// Method to calculate discount amount
DiscountSchema.methods.calculateDiscount = function (originalAmount: number): number {
  if (!this.isValid()) return 0;

  if (this.discountType === "percentage") {
    const discount = (originalAmount * this.discountValue) / 100;
    return Math.round(discount);
  } else {
    // Fixed amount discount
    return Math.min(this.discountValue, originalAmount);
  }
};

// Prevent re-compilation during development
const Discount: Model<IDiscount> =
  mongoose.models.Discount || mongoose.model<IDiscount>("Discount", DiscountSchema);

export default Discount;

