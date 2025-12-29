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

// DELETE - Delete a specific video from history
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ videoId: string }> | { videoId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const params = await Promise.resolve(context.params);
    const { videoId } = params;

    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the video in history
    const videoIndex = user.videoHistory.findIndex(
      (video) => video.id === videoId
    );

    if (videoIndex === -1) {
      return NextResponse.json(
        { error: "Video not found in history" },
        { status: 404 }
      );
    }

    const video = user.videoHistory[videoIndex];

    // Remove video from history
    user.videoHistory.splice(videoIndex, 1);
    await user.save();

    // Delete video from S3 if URL exists
    if (video.url) {
      const s3Key = extractS3KeyFromUrl(video.url);
      if (s3Key) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.LIARA_BUCKET_NAME,
              Key: s3Key,
            })
          );
        } catch (error) {
          // Log error but don't fail the request if S3 deletion fails
          console.error(`Error deleting video ${s3Key} from S3:`, error);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Video deleted from history",
    });
  } catch (error) {
    console.error("Error deleting video from history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
