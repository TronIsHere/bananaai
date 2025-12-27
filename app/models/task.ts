import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITask extends Document {
  taskId: string; // API task ID (NanoBanana or Kling)
  userId: string; // User who requested the generation
  prompt: string;
  numImages: number;
  taskType: "image" | "video"; // Type of task: image or video
  status: "pending" | "processing" | "completed" | "failed";
  images?: string[]; // Generated image URLs
  videos?: string[]; // Generated video URLs
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
    taskType: {
      type: String,
      enum: ["image", "video"],
      default: "image",
      index: true,
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
    videos: {
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

