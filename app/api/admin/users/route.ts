import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";

const ADMIN_MOBILE_NUMBER = "09306613683";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.mobileNumber) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const normalizedMobile = session.user.mobileNumber
      .trim()
      .replace(/\s+/g, "");
    if (normalizedMobile !== ADMIN_MOBILE_NUMBER) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Connect to database
    await connectDB();

    // Fetch all users, sorted by creation date (newest first)
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
