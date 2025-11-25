import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";

// GET - Fetch user's billing history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id).select("billingHistory");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return billing history sorted by date (newest first)
    // Handle empty or undefined billingHistory gracefully
    const billingHistory = user.billingHistory || [];

    // Only sort if there are items and they have valid dates
    const sortedHistory =
      billingHistory.length > 0
        ? [...billingHistory].sort((a, b) => {
            const dateA = a?.date ? new Date(a.date).getTime() : 0;
            const dateB = b?.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
          })
        : [];

    return NextResponse.json(sortedHistory);
  } catch (error) {
    console.error("Error fetching billing history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
