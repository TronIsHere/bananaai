import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";
import Task from "@/app/models/task";
import { createKlingTask } from "@/lib/services/kling";

/**
 * Calculate credits required for video generation based on duration and sound
 * @param duration Video duration in seconds ("5" or "10")
 * @param sound Whether audio is enabled
 * @returns Number of credits required
 */
function calculateVideoCredits(duration: "5" | "10", sound: boolean): number {
  // Base cost: 5 seconds = 55 credits, 10 seconds = 110 credits
  const baseCredits = duration === "10" ? 110 : 55;
  // If sound is enabled, double the cost
  return sound ? baseCredits * 2 : baseCredits;
}

/**
 * Get callback URL for Kling API
 *
 * @param request NextRequest object
 * @returns HTTPS callback URL
 */
function getCallbackUrl(request: NextRequest): string {
  // Try to get from environment variable first (most reliable)
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL;

  if (baseUrl) {
    // Ensure HTTPS
    const url = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`;
    // Force HTTPS (replace http:// with https://)
    const httpsUrl = url.replace(/^http:\/\//, "https://");
    return `${httpsUrl}/api/generate/callback`;
  }

  // Fallback to constructing from request headers
  // Always use HTTPS for callbacks
  const host =
    request.headers.get("host") || request.headers.get("x-forwarded-host");

  if (host) {
    // Always use HTTPS for callback URLs
    return `https://${host}/api/generate/callback`;
  }

  // Last resort - this should not happen in production
  throw new Error(
    "Unable to determine callback URL. Please set NEXTAUTH_URL or NEXT_PUBLIC_BASE_URL environment variable."
  );
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "لطفاً ابتدا وارد حساب کاربری خود شوید",
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { prompt, imageUrls, sound = false, duration = "5" } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        {
          error: "Prompt is required",
          message: "لطفاً متن توصیفی را وارد کنید",
        },
        { status: 400 }
      );
    }

    if (prompt.length > 2500) {
      return NextResponse.json(
        {
          error: "Prompt too long",
          message: "متن توصیفی نباید بیشتر از 2500 کاراکتر باشد",
        },
        { status: 400 }
      );
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        {
          error: "Image URLs required",
          message: "لطفاً تصویر اولیه را آپلود کنید",
        },
        { status: 400 }
      );
    }

    if (duration !== "5" && duration !== "10") {
      return NextResponse.json(
        {
          error: "Invalid duration",
          message: "مدت زمان ویدیو باید 5 یا 10 ثانیه باشد",
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Get user and check credits
    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found", message: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    // Calculate required credits based on duration and sound
    const requiredCredits = calculateVideoCredits(
      duration as "5" | "10",
      Boolean(sound)
    );

    // Check if user has enough credits
    if (user.credits < requiredCredits) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          message: `اعتبار شما کافی نیست. برای تولید ویدیو به حداقل ${requiredCredits} اعتبار نیاز دارید. شما ${user.credits} اعتبار دارید.`,
        },
        { status: 403 }
      );
    }

    // Reserve credits by creating a task record
    // Credits will be deducted when callback is received
    const callbackUrl = getCallbackUrl(request);

    // Call Kling API
    let apiResponse;
    try {
      apiResponse = await createKlingTask({
        model: "kling-2.6/image-to-video",
        callBackUrl: callbackUrl,
        input: {
          prompt: prompt.trim(),
          image_urls: imageUrls,
          sound: Boolean(sound),
          duration: duration as "5" | "10",
        },
      });
    } catch (apiError: any) {
      // Handle API errors
      console.error("Kling API error:", apiError);

      // Always return generic error message to users
      return NextResponse.json(
        {
          error: "Failed to create video task",
          message: "خطایی رخ داده است. لطفاً با پشتیبانی تماس بگیرید.",
        },
        { status: 500 }
      );
    }

    // Double-check response
    if (!apiResponse || apiResponse.code !== 200 || !apiResponse.data?.taskId) {
      console.error("Invalid API response:", apiResponse);
      return NextResponse.json(
        {
          error: "Failed to create video task",
          message: "خطایی رخ داده است. لطفاً با پشتیبانی تماس بگیرید.",
        },
        { status: 500 }
      );
    }

    // Calculate required credits for this specific video
    const creditsRequired = calculateVideoCredits(
      duration as "5" | "10",
      Boolean(sound)
    );

    // Create task record
    const task = await Task.create({
      taskId: apiResponse.data.taskId,
      userId: session.user.id,
      prompt: prompt.trim(),
      numImages: 1, // For video tasks, we use numImages=1 for compatibility
      taskType: "video",
      status: "pending",
      creditsReserved: creditsRequired,
      creditsDeducted: false,
    });

    // Return task ID for polling
    return NextResponse.json({
      success: true,
      taskId: task.taskId,
      message: "درخواست تولید ویدیو ثبت شد. در حال پردازش...",
    });
  } catch (error: any) {
    console.error("Error creating video task:", error);

    // Only expose credit-related errors to users (they need to know about their balance)
    // All other errors should be generic
    if (
      error.message?.includes("credits") ||
      error.message?.includes("اعتبار")
    ) {
      return NextResponse.json(
        {
          error: "Internal server error",
          message: error.message,
        },
        { status: 500 }
      );
    }

    // Generic error message for all other errors
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "خطایی رخ داده است. لطفاً با پشتیبانی تماس بگیرید.",
      },
      { status: 500 }
    );
  }
}
