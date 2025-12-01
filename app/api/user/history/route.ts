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

// GET - Fetch user's image history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("imageHistory");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return image history sorted by timestamp (newest first)
    const imageHistory = (user.imageHistory || []).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json(imageHistory);
  } catch (error) {
    console.error("Error fetching image history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Clear all image history
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all image URLs before clearing history
    const imagesToDelete = user.imageHistory || [];

    // Clear history
    user.imageHistory = [];
    await user.save();

    // Delete all images from S3
    const deletePromises = imagesToDelete
      .map((img) => {
        if (!img.url) return null;
        const s3Key = extractS3KeyFromUrl(img.url);
        if (!s3Key) return null;

        return s3
          .send(
            new DeleteObjectCommand({
              Bucket: process.env.LIARA_BUCKET_NAME,
              Key: s3Key,
            })
          )
          .catch((error) => {
            // Log error but don't fail the request if S3 deletion fails
            console.error(`Error deleting image ${s3Key} from S3:`, error);
            return null;
          });
      })
      .filter((promise) => promise !== null);

    // Wait for all deletions to complete (but don't fail if some fail)
    await Promise.allSettled(deletePromises);

    return NextResponse.json({ success: true, message: "History cleared" });
  } catch (error) {
    console.error("Error clearing image history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

