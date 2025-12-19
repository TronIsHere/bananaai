import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";
import axios from "axios";
import { PlanType, getPlanNameEnglish } from "@/lib/utils";

// Plan prices in Toman
const planPrices: Record<string, number> = {
  free: 0,
  explorer: 350000,
  creator: 999000,
  studio: 2990000,
};

// Plan credits mapping
const planCredits: Record<string, number> = {
  free: 24,
  explorer: 200,
  creator: 600,
  studio: 2000,
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authority = searchParams.get("Authority");
    const status = searchParams.get("Status");

    // Check if payment was cancelled
    if (status !== "OK" || !authority) {
      // Redirect to billing page with error
      const baseUrl =
        process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
      return NextResponse.redirect(
        `${baseUrl}/dashboard/billing?payment=failed`
      );
    }

    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    const useSandbox = process.env.ZARINPAL_SANDBOX === "true";

    if (!merchantId) {
      console.error("ZARINPAL_MERCHANT_ID is not configured");
      const baseUrl =
        process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
      return NextResponse.redirect(
        `${baseUrl}/dashboard/billing?payment=error`
      );
    }

    await connectDB();

    // Find user with pending payment matching this authority
    const user = await User.findOne({
      "billingHistory.authority": authority,
      "billingHistory.status": "pending",
    });

    if (!user) {
      console.error("No pending payment found for authority:", authority);
      const baseUrl =
        process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
      return NextResponse.redirect(
        `${baseUrl}/dashboard/billing?payment=notfound`
      );
    }

    // Normalize currentPlan if it contains Persian text (defensive measure)
    if (user.currentPlan && typeof user.currentPlan === "string") {
      const normalizedPlan = getPlanNameEnglish(user.currentPlan);
      if (normalizedPlan !== user.currentPlan) {
        user.currentPlan = normalizedPlan;
      }
    }

    // Find the billing entry
    const billingEntry = user.billingHistory.find(
      (entry) => entry.authority === authority && entry.status === "pending"
    );

    if (!billingEntry) {
      console.error("Billing entry not found for authority:", authority);
      const baseUrl =
        process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
      return NextResponse.redirect(
        `${baseUrl}/dashboard/billing?payment=notfound`
      );
    }

    const amount = billingEntry.amount;
    const purchaseType = billingEntry.type || "plan"; // Default to "plan" for backward compatibility

    // Handle credit purchases
    if (purchaseType === "credits") {
      const credits = billingEntry.credits;
      if (!credits || credits <= 0) {
        console.error("Invalid credits in billing entry:", credits);
        const baseUrl =
          process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
        return NextResponse.redirect(
          `${baseUrl}/dashboard/billing?payment=error`
        );
      }
    } else {
      // Handle plan purchases (existing logic)
      const planRaw = billingEntry.plan as PlanType;

      // Validate plan is not null and is a valid paid plan
      if (!planRaw || !["explorer", "creator", "studio"].includes(planRaw)) {
        console.error("Invalid plan in billing entry:", planRaw);
        const baseUrl =
          process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
        return NextResponse.redirect(
          `${baseUrl}/dashboard/billing?payment=error`
        );
      }
    }

    // Use sandbox or production endpoint based on environment
    const zarinpalVerifyUrl = useSandbox
      ? "https://sandbox.zarinpal.com/pg/v4/payment/verify.json"
      : "https://payment.zarinpal.com/pg/v4/payment/verify.json";

    // Verify payment with Zarinpal
    let verifyResponse;
    try {
      verifyResponse = await axios.post(
        zarinpalVerifyUrl,
        {
          merchant_id: merchantId,
          amount: amount,
          authority: authority,
        },
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
        }
      );
    } catch (axiosError: any) {
      const errorResponse = axiosError.response?.data;
      const statusCode = axiosError.response?.status;

      console.error("Zarinpal verification request failed:", {
        status: statusCode,
        statusText: axiosError.response?.statusText,
        data: errorResponse,
        authority,
      });

      // Update billing entry status to failed
      billingEntry.status = "failed";
      await user.save();

      const baseUrl =
        process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
      return NextResponse.redirect(
        `${baseUrl}/dashboard/billing?payment=verify_failed`
      );
    }

    // Check verification response
    if (verifyResponse.data.errors && verifyResponse.data.errors.length > 0) {
      console.error(
        "Zarinpal verification errors:",
        verifyResponse.data.errors
      );

      // Update billing entry status to failed
      billingEntry.status = "failed";
      await user.save();

      const baseUrl =
        process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
      return NextResponse.redirect(
        `${baseUrl}/dashboard/billing?payment=verify_failed`
      );
    }

    const code = verifyResponse.data.data?.code;
    const refId = verifyResponse.data.data?.ref_id;

    // Code 100 = successful payment (first verification)
    // Code 101 = payment already verified (prevent duplicate processing)
    if (code === 100 || code === 101) {
      // If already verified (code 101), just redirect to success
      if (code === 101) {
        const baseUrl =
          process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
        return NextResponse.redirect(
          `${baseUrl}/dashboard/billing?payment=success`
        );
      }

      // Code 100 - First successful verification
      if (purchaseType === "credits") {
        // Handle credit purchase - add credits to user's account
        const creditsToAdd = billingEntry.credits || 0;
        user.credits = (user.credits || 0) + creditsToAdd;

        // Update billing entry
        billingEntry.status = "paid";
        billingEntry.refId = refId;

        await user.save();
      } else {
        // Handle plan purchase - update user plan
        const plan = billingEntry.plan as "explorer" | "creator" | "studio";

        // Calculate plan end date (30 days from now)
        const planStartDate = new Date();
        const planEndDate = new Date();
        planEndDate.setDate(planEndDate.getDate() + 30);

        // Update user plan
        user.currentPlan = plan;
        user.planStartDate = planStartDate;
        user.planEndDate = planEndDate;

        // Set credits based on plan
        user.credits = planCredits[plan] || 0;

        // Reset monthly usage
        user.imagesGeneratedThisMonth = 0;

        // Set monthly reset date (30 days from now)
        const monthlyResetDate = new Date();
        monthlyResetDate.setDate(monthlyResetDate.getDate() + 30);
        user.monthlyResetDate = monthlyResetDate;

        // Update billing entry
        billingEntry.status = "paid";
        billingEntry.refId = refId;

        await user.save();
      }

      const baseUrl =
        process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
      return NextResponse.redirect(
        `${baseUrl}/dashboard/billing?payment=success`
      );
    } else {
      // Payment verification failed
      console.error("Payment verification failed. Code:", code);

      billingEntry.status = "failed";
      await user.save();

      const baseUrl =
        process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
      return NextResponse.redirect(
        `${baseUrl}/dashboard/billing?payment=failed`
      );
    }
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    const baseUrl =
      process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || "";
    return NextResponse.redirect(`${baseUrl}/dashboard/billing?payment=error`);
  }
}
