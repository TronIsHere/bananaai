import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select(
      "-billingHistory -imageHistory"
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      mobileNumber: user.mobileNumber,
      firstName: user.firstName,
      lastName: user.lastName,
      credits: user.credits,
      currentPlan: user.currentPlan,
      planStartDate: user.planStartDate,
      planEndDate: user.planEndDate,
      imagesGeneratedThisMonth: user.imagesGeneratedThisMonth,
      monthlyResetDate: user.monthlyResetDate,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


