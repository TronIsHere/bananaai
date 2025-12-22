import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";
import Task from "@/app/models/task";
import { generateImage } from "@/lib/services/nanobanana";

const CREDITS_PER_GENERATION = 4;
const CREDITS_PER_GENERATION_PRO = 24;

/**
 * Get callback URL for NanoBanana API
 * 
 * Best Practices:
 * - Always uses HTTPS for secure data transmission
 * - Prefers environment variables for production stability
 * - Falls back to request headers if needed
 * 
 * @param request NextRequest object
 * @returns HTTPS callback URL
 */
function getCallbackUrl(request: NextRequest): string {
  // Try to get from environment variable first (most reliable)
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL;

  if (baseUrl) {
    // Ensure HTTPS
    const url = baseUrl.startsWith("http")
      ? baseUrl
      : `https://${baseUrl}`;
    // Force HTTPS (replace http:// with https://)
    const httpsUrl = url.replace(/^http:\/\//, "https://");
    return `${httpsUrl}/api/generate/callback`;
  }

  // Fallback to constructing from request headers
  // Always use HTTPS for callbacks (required by NanoBanana best practices)
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
          error: "عدم دسترسی",
          message: "لطفاً ابتدا وارد حساب کاربری خود شوید",
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      prompt,
      imageUrls,
      numImages = 1,
      image_size = "16:9",
      isPro = false,
    } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        {
          error: "متن توصیفی الزامی است",
          message: "لطفاً متن توصیفی را وارد کنید",
        },
        { status: 400 }
      );
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        {
          error: "آدرس تصویر الزامی است",
          message: "لطفاً تصویر اولیه را آپلود کنید",
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
        { error: "کاربر یافت نشد", message: "کاربر یافت نشد" },
        { status: 404 }
      );
    }

    // Determine credits needed based on pro mode
    const creditsNeeded = isPro
      ? CREDITS_PER_GENERATION_PRO
      : CREDITS_PER_GENERATION;

    // Check if user has enough credits
    if (user.credits < creditsNeeded) {
      return NextResponse.json(
        {
          error: "اعتبار ناکافی",
          message: `اعتبار شما کافی نیست. برای تولید تصویر به حداقل ${creditsNeeded} اعتبار نیاز دارید. شما ${user.credits} اعتبار دارید.`,
        },
        { status: 403 }
      );
    }

    // Reserve credits by creating a task record
    // Credits will be deducted when callback is received
    const callbackUrl = getCallbackUrl(request);

    // Call NanoBanana API
    let apiResponse;
    try {
      apiResponse = await generateImage(
        {
          prompt: prompt.trim(),
          numImages: Math.min(Math.max(1, numImages), 4), // Limit between 1-4 images
          type: "IMAGETOIAMGE",
          image_size,
          callBackUrl: callbackUrl,
          imageUrls: imageUrls, // Array of input image URLs
        },
        isPro
      );
    } catch (apiError: any) {
      // Handle API errors (400, 401, 500 from API)
      console.error("NanoBanana API error:", apiError);

      // Check for pattern matching error and replace with user-friendly message
      let errorMessage =
        apiError.message || "خطا در تولید تصویر. لطفاً دوباره تلاش کنید.";
      if (
        errorMessage.toLowerCase().includes("string") &&
        (errorMessage.toLowerCase().includes("pattern") ||
          errorMessage.toLowerCase().includes("matched"))
      ) {
        errorMessage = "مشکلی پیش امده لطفا دوباره امتحان کنید";
      }

      return NextResponse.json(
        {
          error: "خطا در تولید تصویر",
          message: errorMessage,
        },
        { status: 500 }
      );
    }

    // Double-check response (should already be validated in generateImage, but be safe)
    if (!apiResponse || apiResponse.code !== 200 || !apiResponse.data?.taskId) {
      return NextResponse.json(
        {
          error: "خطا در تولید تصویر",
          message:
            apiResponse?.msg || "خطا در تولید تصویر. لطفاً دوباره تلاش کنید.",
        },
        { status: 500 }
      );
    }

    // Create task record
    const task = await Task.create({
      taskId: apiResponse.data.taskId,
      userId: session.user.id,
      prompt: prompt.trim(),
      numImages: Math.min(Math.max(1, numImages), 4),
      status: "pending",
      creditsReserved: creditsNeeded,
      creditsDeducted: false,
    });

    // Return task ID for polling
    return NextResponse.json({
      success: true,
      taskId: task.taskId,
      message: "درخواست تولید تصویر ثبت شد. در حال پردازش...",
    });
  } catch (error: any) {
    console.error("Error generating image:", error);

    // Handle specific error messages
    let errorMessage = "خطا در تولید تصویر. لطفاً دوباره تلاش کنید.";

    if (error.message?.includes("NANOBANANAAPI_KEY")) {
      errorMessage = "خطا در پیکربندی API. لطفاً با پشتیبانی تماس بگیرید.";
    } else if (error.message?.includes("callBackUrl")) {
      errorMessage =
        "خطا در پیکربندی URL بازگشتی. لطفاً با پشتیبانی تماس بگیرید.";
    } else if (
      error.message?.includes("credits") ||
      error.message?.includes("اعتبار")
    ) {
      errorMessage = error.message;
    } else if (
      error.message?.toLowerCase().includes("string") &&
      (error.message?.toLowerCase().includes("pattern") ||
        error.message?.toLowerCase().includes("matched"))
    ) {
      errorMessage = "مشکلی پیش امده لطفا دوباره امتحان کنید";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: "خطای سرور",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}
