import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { validateImageFileServer } from "@/lib/image-validation";

// Configure route to allow larger file uploads (up to 10MB)
export const maxDuration = 60;
export const runtime = "nodejs";

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

    const formData = await request.formData();
    const file = formData.get("image") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No image provided", message: "لطفاً یک تصویر انتخاب کنید" },
        { status: 400 }
      );
    }

    // Validate image file (type and size)
    const validation = validateImageFileServer(file);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || "فایل نامعتبر است" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop() || "jpg";
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    // Upload to Liara S3
    const command = new PutObjectCommand({
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: `bananaai/images/${fileName}`,
      Body: buffer,
      ContentType: file.type,
    });

    await s3.send(command);

    // Return the file URL
    const fileUrl = `${process.env.LIARA_ENDPOINT}/${process.env.LIARA_BUCKET_NAME}/bananaai/images/${fileName}`;

    return NextResponse.json({
      success: true,
      message: "فایل با موفقیت آپلود شد",
      url: fileUrl,
      fileName: fileName,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    
    return NextResponse.json(
      {
        error: "Failed to upload image",
        message: error.message || "خطا در آپلود تصویر",
      },
      { status: 500 }
    );
  }
}

