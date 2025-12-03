import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";
import { PlanType } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !["free", "explorer", "creator", "studio"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan name" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Calculate plan end date (30 days from now)
    const planStartDate = new Date();
    const planEndDate = new Date();
    planEndDate.setDate(planEndDate.getDate() + 30);

    // Update user plan
    user.currentPlan = plan as PlanType;
    user.planStartDate = planStartDate;
    user.planEndDate = planEndDate;

    // Calculate credits based on plan (4 credits per image)
    const planCredits: Record<string, number> = {
      free: 12, // 3 images * 4 credits
      explorer: 200, // 50 images * 4 credits
      creator: 600, // 150 images * 4 credits
      studio: 2000, // 500 images * 4 credits
    };

    // Set credits to the plan's limit
    user.credits = planCredits[plan] || 0;

    // Reset monthly usage
    user.imagesGeneratedThisMonth = 0;

    // Set monthly reset date (30 days from now)
    const monthlyResetDate = new Date();
    monthlyResetDate.setDate(monthlyResetDate.getDate() + 30);
    user.monthlyResetDate = monthlyResetDate;

    // Add to billing history
    const planPrices: Record<string, number> = {
      free: 0,
      explorer: 350000,
      creator: 999000,
      studio: 2990000,
    };

    const billingEntry = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
      amount: planPrices[plan] || 0,
      type: "plan" as const,
      plan: plan,
      status: "paid" as const,
    };

    user.billingHistory.push(billingEntry);

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Plan updated successfully",
      plan: user.currentPlan,
      credits: user.credits,
      planEndDate: user.planEndDate,
    });
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

