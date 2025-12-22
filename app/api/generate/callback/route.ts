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
        {
          error: "شناسه وظیفه در داده‌ها الزامی است",
          message: "شناسه وظیفه در داده‌ها الزامی است",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the task
    const task = await Task.findOne({ taskId });

    if (!task) {
      console.error(`Task not found for taskId: ${taskId}`);
      return NextResponse.json(
        { error: "وظیفه یافت نشد", message: "وظیفه یافت نشد" },
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

          // Save generated image to history (skip for free plan)
          if (user.currentPlan !== "free") {
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
          }

          // Increment images generated counter
          user.imagesGeneratedThisMonth =
            (user.imagesGeneratedThisMonth || 0) + 1;

          await user.save();
          task.creditsDeducted = true;
        }
      } else {
        // Success code but no image URL
        task.status = "failed";
        task.error = "تصویری دریافت نشد لطفا دوباره تلاش کنید";
        task.completedAt = new Date();
        // Don't deduct credits if no image was returned - credits remain available
        task.creditsDeducted = false;
      }
    } else {
      // Task failed (400, 500, 501, or 200 but no image)
      task.status = "failed";

      // Set appropriate error message based on code
      let errorMsg = "";
      if (code === 400) {
        errorMsg = msg || "نقض سیاست محتوا - متن شما رد شده است";
      } else if (code === 500) {
        errorMsg = msg || "خطای داخلی - لطفاً بعداً دوباره تلاش کنید";
      } else if (code === 501) {
        errorMsg = msg || "تولید تصویر با خطا مواجه شد";
      } else if (code === 200) {
        errorMsg = msg || "هیچ آدرس تصویری در پاسخ وجود ندارد";
      } else {
        errorMsg = msg || "خطای نامشخص";
      }

      // Check for pattern matching error and replace with user-friendly message
      if (
        errorMsg.toLowerCase().includes("string") &&
        (errorMsg.toLowerCase().includes("pattern") ||
          errorMsg.toLowerCase().includes("matched"))
      ) {
        errorMsg = "مشکلی پیش امده لطفا دوباره امتحان کنید";
      }

      task.error = errorMsg;
      task.completedAt = new Date();

      // Don't deduct credits for failed tasks
      // Credits were reserved but not deducted, so they remain available
      // This ensures users get their credits back when generation fails
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
        error: "خطای سرور",
        message: error.message || "خطا در پردازش بازگشت",
      },
      { status: 500 }
    );
  }
}
