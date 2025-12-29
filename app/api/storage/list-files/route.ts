import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

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

export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }
    const bucketName = process.env.LIARA_BUCKET_NAME || "bananaai";
    
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: "bananaai/", // Only list files in the bananaai folder
    });

    const data = await s3.send(command);
    
    // Filter to only include image files
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
    const files = (data.Contents || []).filter((file) => {
      if (!file.Key) return false;
      const key = file.Key.toLowerCase();
      return imageExtensions.some(ext => key.endsWith(ext));
    });

    // Build full URLs for each file
    const endpoint = process.env.LIARA_ENDPOINT;
    const filesWithUrls = files.map((file) => ({
      key: file.Key,
      size: file.Size,
      lastModified: file.LastModified,
      url: `${endpoint}/${bucketName}/${file.Key}`,
    }));

    // Sort by lastModified date (newest first)
    filesWithUrls.sort((a, b) => {
      const dateA = a.lastModified ? new Date(a.lastModified).getTime() : 0;
      const dateB = b.lastModified ? new Date(b.lastModified).getTime() : 0;
      return dateB - dateA; // Descending order (newest first)
    });

    return NextResponse.json({ 
      files: filesWithUrls,
      count: filesWithUrls.length 
    });
  } catch (error: any) {
    console.error("Error listing files:", error);
    return NextResponse.json(
      { 
        error: "Failed to list files", 
        message: error.message 
      },
      { status: 500 }
    );
  }
}
