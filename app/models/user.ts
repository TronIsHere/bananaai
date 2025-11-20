import mongoose, { Schema, Document, Model } from "mongoose";

// Billing History Schema
export interface IBillingHistory {
  id: string;
  date: Date;
  amount: number;
  plan: string;
  status: "paid" | "pending" | "failed";
  invoiceUrl?: string;
}

const BillingHistorySchema = new Schema<IBillingHistory>(
  {
    id: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    plan: {
      type: String,
      required: true,
      enum: ["رایگان", "کاوشگر", "خلاق", "استودیو"],
    },
    status: {
      type: String,
      required: true,
      enum: ["paid", "pending", "failed"],
      default: "pending",
    },
    invoiceUrl: {
      type: String,
      default: undefined,
    },
  },
  { _id: false }
);

// Image History Schema
export interface IImageHistory {
  id: string;
  url: string;
  timestamp: Date;
  prompt: string;
}

const ImageHistorySchema = new Schema<IImageHistory>(
  {
    id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    prompt: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

// User Schema
export interface IUser extends Document {
  mobileNumber: string;
  firstName: string;
  lastName: string;
  // Credits and Plan
  credits: number; // Remaining image credits
  currentPlan: "رایگان" | "کاوشگر" | "خلاق" | "استودیو" | null;
  planStartDate: Date | null; // When current plan started
  planEndDate: Date | null; // When current plan expires/renews
  imagesGeneratedThisMonth: number; // Counter for monthly usage
  monthlyResetDate: Date | null; // Next reset date for monthly limits
  // History
  billingHistory: IBillingHistory[];
  imageHistory: IImageHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    mobileNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: /^09\d{9}$/,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    // Credits and Plan
    credits: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    currentPlan: {
      type: String,
      enum: ["رایگان", "کاوشگر", "خلاق", "استودیو", null],
      default: "رایگان",
    },
    planStartDate: {
      type: Date,
      default: null,
    },
    planEndDate: {
      type: Date,
      default: null,
    },
    imagesGeneratedThisMonth: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    monthlyResetDate: {
      type: Date,
      default: null,
    },
    // History
    billingHistory: {
      type: [BillingHistorySchema],
      default: [],
    },
    imageHistory: {
      type: [ImageHistorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
// Note: mobileNumber already has an index from unique: true, so we don't need to add it again
UserSchema.index({ "imageHistory.timestamp": -1 });
UserSchema.index({ "billingHistory.date": -1 });

// Prevent re-compilation during development
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

// Drop problematic index if it exists (legacy index from when billingHistory.id had unique: true)
// This index causes duplicate key errors when users have empty billingHistory arrays
if (mongoose.connection.readyState === 1) {
  User.collection.dropIndex("billingHistory.id_1").catch(() => {
    // Index doesn't exist or already dropped, ignore error
  });
}

export default User;
