import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/app/models/task";
import User from "@/app/models/user";
import { NanoBananaCallbackPayload } from "@/lib/services/nanobanana";

const CREDITS_PER_GENERATION = 4;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Log the callback payload for debugging (remove in production if sensitive)
    console.log("NanoBanana callback received:", JSON.stringify(body, null, 2));
    
    const { code, msg, data } = body as NanoBananaCallbackPayload;
    
    // Extract taskId from data.taskId (according to callback docs)
    const taskId = data?.taskId;

    if (!taskId) {
      console.error("Callback missing taskId in data. Payload:", body);
      return NextResponse.json(
        { error: "taskId is required in data" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the task
    const task = await Task.findOne({ taskId });

    if (!task) {
      console.error(`Task not found for taskId: ${taskId}`);
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      );
    }

    // Check if task is already completed
    if (task.status === "completed" || task.status === "failed") {
      return NextResponse.json({
        success: true,
        message: "Task already processed",
      });
    }

    // Update task status based on callback code
    // According to docs: 200 = success, 400 = content policy violation, 500 = internal error, 501 = generation failed
    if (code === 200 && data?.info?.resultImageUrl) {
      // Task succeeded - extract image URL from data.info.resultImageUrl
      const resultImageUrl = data.info.resultImageUrl;
      
      if (resultImageUrl && resultImageUrl.trim().length > 0) {
        // Task succeeded
        task.status = "completed";
        task.images = [resultImageUrl]; // Store as array for consistency
        task.completedAt = new Date();

        // Deduct credits from user
        const user = await User.findById(task.userId);
        if (user && !task.creditsDeducted) {
          user.credits = Math.max(0, user.credits - task.creditsReserved);
          
          // Save generated image to history
          const generatedImage = {
            id: `${Date.now()}-0`,
            url: resultImageUrl,
            timestamp: new Date(),
            prompt: task.prompt,
          };

          // Add to image history
          user.imageHistory = [
            {
              id: generatedImage.id,
              url: generatedImage.url,
              timestamp: generatedImage.timestamp,
              prompt: generatedImage.prompt,
            },
            ...user.imageHistory,
          ].slice(0, 1000); // Keep last 1000 images

          // Increment images generated counter
          user.imagesGeneratedThisMonth = (user.imagesGeneratedThisMonth || 0) + 1;

          await user.save();
          task.creditsDeducted = true;
        }
      } else {
        // Success code but no image URL
        task.status = "failed";
        task.error = "No image URL returned from API";
        task.completedAt = new Date();
        // Don't deduct credits if no image was returned
      }
    } else {
      // Task failed (400, 500, 501, or 200 but no image)
      task.status = "failed";
      
      // Set appropriate error message based on code
      if (code === 400) {
        task.error = msg || "Content policy violation - your prompt was flagged";
      } else if (code === 500) {
        task.error = msg || "Internal error - please try again later";
      } else if (code === 501) {
        task.error = msg || "Image generation task failed";
      } else if (code === 200) {
        task.error = msg || "No image URL in response";
      } else {
        task.error = msg || "Unknown error";
      }
      
      task.completedAt = new Date();

      // Don't deduct credits for failed tasks
      // Credits were reserved but not deducted, so they remain available
      task.creditsDeducted = false;
    }

    await task.save();

    return NextResponse.json({
      success: true,
      message: "Callback processed",
    });
  } catch (error: any) {
    console.error("Error processing callback:", error);
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: error.message || "Failed to process callback"
      },
      { status: 500 }
    );
  }
}

