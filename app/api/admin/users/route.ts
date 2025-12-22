import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";

const ADMIN_MOBILE_NUMBER = "09306613683";

// Helper function to check admin access
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.mobileNumber) {
    return { authorized: false, error: "Unauthorized" };
  }

  const normalizedMobile = session.user.mobileNumber.trim().replace(/\s+/g, "");
  if (normalizedMobile !== ADMIN_MOBILE_NUMBER) {
    return { authorized: false, error: "Forbidden - Admin access required" };
  }

  return { authorized: true };
}

// Helper function to extract S3 key from URL
function extractS3KeyFromUrl(url: string): string | null {
  try {
    const bucketName = process.env.LIARA_BUCKET_NAME;
    if (!bucketName) return null;

    const bucketIndex = url.indexOf(`/${bucketName}/`);
    if (bucketIndex === -1) return null;

    const key = url.substring(bucketIndex + bucketName.length + 2);
    return key || null;
  } catch (error) {
    console.error("Error extracting S3 key from URL:", error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    await connectDB();

    const users = await User.find({})
      .select("mobileNumber firstName lastName createdAt credits")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        users: users.map((user) => ({
          id: user._id.toString(),
          mobileNumber: user.mobileNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          createdAt: user.createdAt,
          credits: user.credits,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user and get all their images
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all image URLs before deleting user
    const imagesToDelete = user.imageHistory || [];

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
            console.error(`Error deleting image ${s3Key} from S3:`, error);
            return null;
          });
      })
      .filter((promise) => promise !== null);

    // Wait for all deletions to complete
    await Promise.allSettled(deletePromises);

    // Delete user from database
    await User.findByIdAndDelete(userId);

    return NextResponse.json({
      success: true,
      message: "User and all associated images deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
