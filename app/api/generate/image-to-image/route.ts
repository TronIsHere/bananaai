import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";
import Task from "@/app/models/task";
import { generateImage } from "@/lib/services/nanobanana";

const CREDITS_PER_GENERATION = 4;

function getCallbackUrl(request: NextRequest): string {
  // Try to get from environment variable first
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL;
  
  if (baseUrl) {
    return `${baseUrl}/api/generate/callback`;
  }
  
  // Fallback to constructing from request headers
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const host = request.headers.get("host") || request.headers.get("x-forwarded-host");
  
  if (host) {
    return `${protocol}://${host}/api/generate/callback`;
  }
  
  // Last resort - this should not happen in production
  throw new Error("Unable to determine callback URL. Please set NEXTAUTH_URL or NEXT_PUBLIC_BASE_URL environment variable.");
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized", message: "لطفاً ابتدا وارد حساب کاربری خود شوید" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { prompt, imageUrls, numImages = 1, image_size = "16:9" } = body;

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required", message: "لطفاً متن توصیفی را وارد کنید" },
        { status: 400 }
      );
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "Image URLs required", message: "لطفاً تصویر اولیه را آپلود کنید" },
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

    // Check if user has enough credits
    if (user.credits < CREDITS_PER_GENERATION) {
      return NextResponse.json(
        { 
          error: "Insufficient credits",
          message: `اعتبار شما کافی نیست. برای تولید تصویر به حداقل ${CREDITS_PER_GENERATION} اعتبار نیاز دارید. شما ${user.credits} اعتبار دارید.`
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
      apiResponse = await generateImage({
        prompt: prompt.trim(),
        numImages: Math.min(Math.max(1, numImages), 4), // Limit between 1-4 images
        type: "IMAGETOIAMGE",
        image_size,
        callBackUrl: callbackUrl,
        imageUrls: imageUrls, // Array of input image URLs
      });
    } catch (apiError: any) {
      // Handle API errors (400, 401, 500 from API)
      console.error("NanoBanana API error:", apiError);
      return NextResponse.json(
        { 
          error: "Failed to generate image",
          message: apiError.message || "خطا در تولید تصویر. لطفاً دوباره تلاش کنید."
        },
        { status: 500 }
      );
    }

    // Double-check response (should already be validated in generateImage, but be safe)
    if (!apiResponse || apiResponse.code !== 200 || !apiResponse.data?.taskId) {
      return NextResponse.json(
        { 
          error: "Failed to generate image",
          message: apiResponse?.msg || "خطا در تولید تصویر. لطفاً دوباره تلاش کنید."
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
      creditsReserved: CREDITS_PER_GENERATION,
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
      errorMessage = "خطا در پیکربندی URL بازگشتی. لطفاً با پشتیبانی تماس بگیرید.";
    } else if (error.message?.includes("credits") || error.message?.includes("اعتبار")) {
      errorMessage = error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        error: "Internal server error",
        message: errorMessage
      },
      { status: 500 }
    );
  }
}

