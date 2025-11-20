import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";

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

    // Remove the image from history
    user.imageHistory = (user.imageHistory || []).filter(
      (img) => img.id !== imageId
    );
    await user.save();

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

