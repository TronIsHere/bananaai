import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

// Helper function to extract S3 key from URL
function extractS3KeyFromUrl(url: string): string | null {
  try {
    const bucketName = process.env.LIARA_BUCKET_NAME;
    if (!bucketName) return null;

    // Check if URL contains our bucket name
    const bucketIndex = url.indexOf(`/${bucketName}/`);
    if (bucketIndex === -1) return null;

    // Extract the key (everything after bucket name)
    const key = url.substring(bucketIndex + bucketName.length + 2);
    return key || null;
  } catch (error) {
    console.error("Error extracting S3 key from URL:", error);
    return null;
  }
}

// DELETE - Delete a specific image from user's history
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ imageId: string }> | { imageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await Promise.resolve(context.params);
    const { imageId } = params;

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the image to get its URL before deleting
    const imageToDelete = (user.imageHistory || []).find(
      (img) => img.id === imageId
    );

    // Remove the image from history
    user.imageHistory = (user.imageHistory || []).filter(
      (img) => img.id !== imageId
    );
    await user.save();

    // Delete from S3 if the image URL is from our bucket
    if (imageToDelete?.url) {
      const s3Key = extractS3KeyFromUrl(imageToDelete.url);
      if (s3Key) {
        try {
          const command = new DeleteObjectCommand({
            Bucket: process.env.LIARA_BUCKET_NAME,
            Key: s3Key,
          });
          await s3.send(command);
        } catch (s3Error) {
          // Log error but don't fail the request if S3 deletion fails
          console.error("Error deleting image from S3:", s3Error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted from history",
    });
  } catch (error) {
    console.error("Error deleting image from history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

