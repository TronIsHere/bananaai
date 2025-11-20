import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITask extends Document {
  taskId: string; // NanoBanana API task ID
  userId: string; // User who requested the generation
  prompt: string;
  numImages: number;
  status: "pending" | "processing" | "completed" | "failed";
  images?: string[]; // Generated image URLs
  error?: string; // Error message if failed
  creditsReserved: number; // Credits reserved for this task
  creditsDeducted: boolean; // Whether credits have been deducted
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const TaskSchema: Schema = new Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    numImages: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
    error: {
      type: String,
    },
    creditsReserved: {
      type: Number,
      required: true,
      min: 0,
    },
    creditsDeducted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
TaskSchema.index({ userId: 1, status: 1 });
// Note: taskId already has an index from unique: true, so we don't need to add it again

// Prevent re-compilation during development
const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);

export default Task;

