import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import Task from "@/app/models/task";
import User from "@/app/models/user";
import { getNanoBananaTaskStatus } from "@/lib/services/nanobanana";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ taskId: string }> | { taskId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "عدم دسترسی",
          message: "لطفاً ابتدا وارد حساب کاربری خود شوید",
        },
        { status: 401 }
      );
    }

    // Extract taskId from params (handle both sync and async params)
    let taskId: string | undefined;
    try {
      const params = context.params;
      if (params instanceof Promise) {
        const resolvedParams = await params;
        taskId = resolvedParams?.taskId;
      } else {
        taskId = params?.taskId;
      }
    } catch (err) {
      console.error("Error extracting taskId from params:", err);
    }

    // Fallback: extract from URL path
    if (!taskId) {
      const urlPath = new URL(request.url).pathname;
      const match = urlPath.match(/\/task-status\/([^\/\?]+)/);
      taskId = match?.[1];
    }

    if (!taskId) {
      console.error(
        "Task status route - missing taskId. URL:",
        request.url,
        "Params:",
        context.params
      );
      return NextResponse.json(
        { error: "taskId is required", message: "شناسه وظیفه الزامی است" },
        { status: 400 }
      );
    }

    await connectDB();

    // Timeout threshold: 15 minutes
    const TIMEOUT_MS = 15 * 60 * 1000;

    let task = await Task.findOne({ taskId, userId: session.user.id });

    if (!task) {
      return NextResponse.json(
        { error: "وظیفه یافت نشد", message: "وظیفه یافت نشد" },
        { status: 404 }
      );
    }

    // Check for timeout: if task has been pending for more than 15 minutes, mark as failed
    const taskAge = Date.now() - new Date(task.createdAt).getTime();
    if (
      (task.status === "pending" || task.status === "processing") &&
      taskAge > TIMEOUT_MS &&
      !task.creditsDeducted
    ) {
      task.status = "failed";
      task.error = "زمان انتظار به پایان رسید. اعتبارات شما بازگردانده شد.";
      task.completedAt = new Date();
      task.creditsDeducted = false; // Ensure credits are not deducted for timed-out tasks
      await task.save();
    }

    // If task is still pending/processing, attempt to fetch latest status directly from NanoBanana API
    if (task.status === "pending" || task.status === "processing") {
      try {
        const remoteStatus = await getNanoBananaTaskStatus(taskId);

        // Extract data from the wrapped response structure
        const statusData = remoteStatus.data;

        if (
          statusData?.successFlag === 1 &&
          statusData.response?.resultImageUrl
        ) {
          // Success - update task with image URL
          const imageUrl = statusData.response.resultImageUrl;
          task.status = "completed";
          task.images = [imageUrl];
          task.completedAt = new Date();

          // Deduct credits from user if not already deducted
          const user = await User.findById(task.userId);
          if (user && !task.creditsDeducted) {
            user.credits = Math.max(0, user.credits - task.creditsReserved);

            // Save generated image to history (skip for free plan)
            if (user.currentPlan !== "free") {
              const generatedImage = {
                id: `${Date.now()}-0`,
                url: imageUrl,
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

          await task.save();
        } else if (statusData?.successFlag === 2) {
          task.status = "failed";
          let errorMsg =
            statusData.errorMessage ||
            "ایجاد وظیفه با خطا مواجه شد (گزارش شده توسط NanoBanana)";
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
          task.creditsDeducted = false; // Don't deduct credits for failed tasks - credits remain available
          await task.save();
        } else if (statusData?.successFlag === 3) {
          task.status = "failed";
          let errorMsg =
            statusData.errorMessage ||
            "تولید تصویر با خطا مواجه شد (گزارش شده توسط NanoBanana)";
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
          task.creditsDeducted = false; // Don't deduct credits for failed tasks - credits remain available
          await task.save();
        }
      } catch (remoteError) {
        console.error(
          "Failed to refresh task status from NanoBanana:",
          remoteError
        );
        // If we can't reach NanoBanana and task is old, mark as failed
        const taskAge = Date.now() - new Date(task.createdAt).getTime();
        if (taskAge > TIMEOUT_MS && !task.creditsDeducted) {
          task.status = "failed";
          task.error = "خطا در ارتباط با سرویس. اعتبارات شما بازگردانده شد.";
          task.completedAt = new Date();
          task.creditsDeducted = false; // Ensure credits are not deducted
          await task.save();
        }
      }

      // Re-fetch task to ensure latest data
      task = await Task.findOne({ taskId, userId: session.user.id });
    }

    return NextResponse.json({
      taskId: task?.taskId,
      status: task?.status,
      images: task?.images || [],
      error: task?.error,
      prompt: task?.prompt,
      createdAt: task?.createdAt,
      completedAt: task?.completedAt,
    });
  } catch (error: any) {
    console.error("Error fetching task status:", error);

    return NextResponse.json(
      {
        error: "خطای سرور",
        message: error.message || "خطا در دریافت وضعیت وظیفه",
      },
      { status: 500 }
    );
  }
}
