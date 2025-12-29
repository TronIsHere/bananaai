import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Task from "@/app/models/task";
import User from "@/app/models/user";
import { NanoBananaCallbackPayload } from "@/lib/services/nanobanana";
import {
  KlingCallbackPayload,
  parseKlingResultJson,
} from "@/lib/services/kling";

const CREDITS_PER_GENERATION = 4;

/**
 * Process NanoBanana callback asynchronously
 */
async function processNanoBananaCallback(
  taskId: string,
  code: number,
  msg: string,
  resultImageUrl?: string
) {
  try {
    await connectDB();

    // Find the task
    const task = await Task.findOne({ taskId });

    if (!task) {
      console.error(`[Callback] Task not found for taskId: ${taskId}`);
      return;
    }

    // Idempotency check: If task is already completed/failed, skip processing
    // This handles cases where the same taskId receives multiple callbacks
    if (task.status === "completed" || task.status === "failed") {
      console.log(
        `[Callback] Task ${taskId} already processed with status: ${task.status}`
      );
      return;
    }

    // Update task status based on callback code
    // According to docs:
    // 200 = success, 400 = content policy violation, 500 = internal error, 501 = generation failed
    if (code === 200 && resultImageUrl && resultImageUrl.trim().length > 0) {
      // Task succeeded
      task.status = "completed";
      task.images = [resultImageUrl];
      task.completedAt = new Date();

      // Deduct credits from user (idempotent: only if not already deducted)
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
        console.log(
          `[Callback] Task ${taskId} completed successfully. Credits deducted: ${task.creditsReserved}`
        );
      }
    } else {
      // Task failed (400, 500, 501, or 200 but no image)
      task.status = "failed";

      // Set appropriate error message based on code
      let errorMsg = "";
      if (code === 400) {
        errorMsg = msg || "نقض سیاست محتوا - متن شما رد شده است";
        console.warn(
          `[Callback] Task ${taskId} failed: Content policy violation`
        );
      } else if (code === 500) {
        errorMsg = msg || "خطای داخلی - لطفاً بعداً دوباره تلاش کنید";
        console.error(`[Callback] Task ${taskId} failed: Internal error`);
      } else if (code === 501) {
        errorMsg = msg || "تولید تصویر با خطا مواجه شد";
        console.error(`[Callback] Task ${taskId} failed: Generation failed`);
      } else if (code === 200) {
        errorMsg = msg || "هیچ آدرس تصویری در پاسخ وجود ندارد";
        console.warn(
          `[Callback] Task ${taskId} failed: Success code but no image URL`
        );
      } else {
        errorMsg = msg || "خطای نامشخص";
        console.error(
          `[Callback] Task ${taskId} failed: Unknown error code ${code}`
        );
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
      console.log(
        `[Callback] Task ${taskId} marked as failed. Credits not deducted.`
      );
    }

    await task.save();
  } catch (error: any) {
    // Log error but don't throw - we've already responded
    console.error(`[Callback] Error processing NanoBanana task ${taskId}:`, error);
  }
}

/**
 * Process Kling callback asynchronously
 */
async function processKlingCallback(
  taskId: string,
  code: number,
  msg: string,
  state: string,
  resultJson?: string,
  failCode?: string | null,
  failMsg?: string | null
) {
  try {
    await connectDB();

    // Find the task
    const task = await Task.findOne({ taskId });

    if (!task) {
      console.error(`[Callback] Task not found for taskId: ${taskId}`);
      return;
    }

    // Idempotency check
    if (task.status === "completed" || task.status === "failed") {
      console.log(
        `[Callback] Task ${taskId} already processed with status: ${task.status}`
      );
      return;
    }

    // Update task status based on state and code
    // Kling uses: state = "success" or "fail", code = 200 (success) or 501 (fail)
    if (
      code === 200 &&
      state === "success" &&
      resultJson &&
      resultJson.trim().length > 0
    ) {
      // Task succeeded - parse video URLs from resultJson
      const videoUrls = parseKlingResultJson(resultJson);

      if (videoUrls.length > 0) {
        task.status = "completed";
        task.taskType = "video"; // Ensure taskType is set
        task.videos = videoUrls;
        task.completedAt = new Date();

        // Deduct credits from user (idempotent: only if not already deducted)
        const user = await User.findById(task.userId);
        if (user && !task.creditsDeducted) {
          user.credits = Math.max(0, user.credits - task.creditsReserved);

          // Save generated videos to history (skip for free plan)
          if (user.currentPlan !== "free") {
            // Create video history entries for all videos
            const newVideos = videoUrls.map((videoUrl, index) => ({
              id: `${Date.now()}-${index}`,
              url: videoUrl,
              timestamp: new Date(),
              prompt: task.prompt,
            }));

            // Add all videos to video history at once
            user.videoHistory = [
              ...newVideos,
              ...user.videoHistory,
            ].slice(0, 1000); // Keep last 1000 videos
          }

          // Increment images generated counter (used for both images and videos)
          user.imagesGeneratedThisMonth =
            (user.imagesGeneratedThisMonth || 0) + 1;

          await user.save();
          task.creditsDeducted = true;
          console.log(
            `[Callback] Kling task ${taskId} completed successfully. Credits deducted: ${task.creditsReserved}`
          );
        }
      } else {
        // Success code but no video URLs
        task.status = "failed";
        task.error = msg || "هیچ آدرس ویدیویی در پاسخ وجود ندارد";
        task.completedAt = new Date();
        task.creditsDeducted = false;
        console.warn(
          `[Callback] Kling task ${taskId} failed: Success code but no video URLs`
        );
      }
    } else {
      // Task failed
      task.status = "failed";

      // Set appropriate error message
      let errorMsg = "";
      if (code === 501 || state === "fail") {
        errorMsg = failMsg || msg || "تولید ویدیو با خطا مواجه شد";
        console.error(
          `[Callback] Kling task ${taskId} failed: ${failCode || "Unknown error"}`
        );
      } else if (code === 200 && state !== "success") {
        errorMsg = msg || "وضعیت نامعتبر در پاسخ";
        console.warn(
          `[Callback] Kling task ${taskId} failed: Invalid state ${state}`
        );
      } else {
        errorMsg = msg || "خطای نامشخص";
        console.error(
          `[Callback] Kling task ${taskId} failed: Code ${code}, State ${state}`
        );
      }

      task.error = errorMsg;
      task.completedAt = new Date();
      task.creditsDeducted = false;
      console.log(
        `[Callback] Kling task ${taskId} marked as failed. Credits not deducted.`
      );
    }

    await task.save();
  } catch (error: any) {
    // Log error but don't throw - we've already responded
    console.error(`[Callback] Error processing Kling task ${taskId}:`, error);
  }
}

/**
 * Unified Callback Handler for NanoBanana and Kling APIs
 *
 * This endpoint receives callbacks from both APIs when generation tasks complete.
 * According to API docs:
 * - Must respond quickly (within 15 seconds for NanoBanana)
 * - Should handle multiple callbacks for the same taskId (idempotent)
 * - Must handle all status codes appropriately
 *
 * Best Practices Implemented:
 * - Quick response: Returns 200 immediately, processes asynchronously
 * - Idempotent processing: Checks if task already processed
 * - Complete error handling: Handles all documented status codes
 * - Async processing: Heavy operations done after response
 * - Auto-detection: Detects callback type by payload structure
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get raw text first to handle JSON parsing errors more gracefully
    let body: any;
    let rawText: string = "";
    try {
      rawText = await request.text();
      if (!rawText || rawText.trim().length === 0) {
        throw new Error("Empty request body");
      }
      body = JSON.parse(rawText);
    } catch (parseError: any) {
      console.error("[Callback] JSON parsing error:", parseError);
      // Log the raw text for debugging (truncate if too long)
      console.error(
        "[Callback] Raw request body (first 500 chars):",
        rawText.substring(0, 500)
      );
      console.error("[Callback] Parse error details:", parseError.message);
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON format",
          message: "فرمت داده‌های دریافتی نامعتبر است",
        },
        { status: 200 } // Return 200 to prevent retries
      );
    }

    // Log callback for monitoring (sanitize sensitive data in production)
    console.log(
      `[Callback] Received callback at ${new Date().toISOString()}:`,
      JSON.stringify({ code: body.code, taskId: body.data?.taskId }, null, 2)
    );

    // Detect callback type: Kling has data.state, NanoBanana has data.info
    const isKlingCallback = body.data?.state !== undefined;
    const isNanoBananaCallback = body.data?.info !== undefined;

    if (!isKlingCallback && !isNanoBananaCallback) {
      console.error("[Callback] Unknown callback type. Payload:", body);
      return NextResponse.json(
        {
          error: "Invalid callback type",
          message: "نوع callback نامعتبر است",
        },
        { status: 400 }
      );
    }

    const { code, msg, data } = body;

    // Validate callback payload structure
    if (!data || typeof data !== "object") {
      console.error("[Callback] Invalid callback payload structure:", body);
      return NextResponse.json(
        {
          error: "Invalid payload structure",
          message: "داده‌های دریافتی نامعتبر است",
        },
        { status: 400 }
      );
    }

    // Extract taskId
    const taskId = data.taskId;

    if (!taskId || typeof taskId !== "string") {
      console.error("[Callback] Missing or invalid taskId. Payload:", body);
      return NextResponse.json(
        {
          error: "Task ID is required",
          message: "شناسه وظیفه در داده‌ها الزامی است",
        },
        { status: 400 }
      );
    }

    // Process callback based on type
    if (isKlingCallback) {
      // Kling callback
      const klingPayload = body as KlingCallbackPayload;
      const state = klingPayload.data?.state || "";
      const resultJson = klingPayload.data?.resultJson;
      const failCode = klingPayload.data?.failCode;
      const failMsg = klingPayload.data?.failMsg;

      // Validate Kling status code
      const validKlingCodes = [200, 501];
      if (!validKlingCodes.includes(code)) {
        console.error(
          `[Callback] Invalid Kling status code: ${code} for taskId: ${taskId}`
        );
        return NextResponse.json(
          {
            error: "Invalid status code",
            message: "کد وضعیت نامعتبر است",
          },
          { status: 400 }
        );
      }

      // Process Kling callback asynchronously
      processKlingCallback(
        taskId,
        code,
        msg || "",
        state,
        resultJson,
        failCode,
        failMsg
      ).catch((error) => {
        console.error(
          `[Callback] Unexpected error in async processing for Kling task ${taskId}:`,
          error
        );
      });
    } else {
      // NanoBanana callback
      const nanoBananaPayload = body as NanoBananaCallbackPayload;

      // Validate NanoBanana status code
      const validNanoBananaCodes = [200, 400, 500, 501];
      if (!validNanoBananaCodes.includes(code)) {
        console.error(
          `[Callback] Invalid NanoBanana status code: ${code} for taskId: ${taskId}`
        );
        return NextResponse.json(
          {
            error: "Invalid status code",
            message: "کد وضعیت نامعتبر است",
          },
          { status: 400 }
        );
      }

      // Extract result image URL if present
      const resultImageUrl = nanoBananaPayload.data?.info?.resultImageUrl;

      // Process NanoBanana callback asynchronously
      processNanoBananaCallback(taskId, code, msg || "", resultImageUrl).catch(
        (error) => {
          console.error(
            `[Callback] Unexpected error in async processing for NanoBanana task ${taskId}:`,
            error
          );
        }
      );
    }

    const responseTime = Date.now() - startTime;
    console.log(
      `[Callback] Responded to ${isKlingCallback ? "Kling" : "NanoBanana"} callback for task ${taskId} in ${responseTime}ms`
    );

    // Return success immediately
    return NextResponse.json({
      success: true,
      message: "Callback received and queued for processing",
    });
  } catch (error: any) {
    // Handle JSON parsing errors or other request errors
    console.error("[Callback] Error processing callback request:", error);

    // Still return 200 to avoid retries for malformed requests
    // But log the error for investigation
    return NextResponse.json(
      {
        success: false,
        error: "Invalid request format",
        message: error.message || "خطا در پردازش درخواست",
      },
      { status: 200 } // Return 200 to prevent retries
    );
  }
}
