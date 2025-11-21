import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";

// PATCH - Update user profile
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName } = body;

    // Validate input
    if (firstName !== undefined) {
      if (typeof firstName !== "string" || firstName.trim().length < 2 || firstName.trim().length > 50) {
        return NextResponse.json(
          { error: "First name must be between 2 and 50 characters" },
          { status: 400 }
        );
      }
    }

    if (lastName !== undefined) {
      if (typeof lastName !== "string" || lastName.trim().length < 2 || lastName.trim().length > 50) {
        return NextResponse.json(
          { error: "Last name must be between 2 and 50 characters" },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update fields if provided
    if (firstName !== undefined) {
      user.firstName = firstName.trim();
    }
    if (lastName !== undefined) {
      user.lastName = lastName.trim();
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id.toString(),
        mobileNumber: user.mobileNumber,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

