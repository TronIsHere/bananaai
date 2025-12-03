import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";
import axios from "axios";
import { PlanType } from "@/lib/utils";

// Plan prices in Toman
const planPrices: Record<string, number> = {
  free: 0,
  explorer: 350000,
  creator: 999000,
  studio: 2990000,
};

function getCallbackUrl(request: NextRequest): string {
  const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL;

  if (baseUrl) {
    return `${baseUrl}/api/payment/zarinpal/verify`;
  }

  const protocol = request.headers.get("x-forwarded-proto") || "https";
  const host =
    request.headers.get("host") || request.headers.get("x-forwarded-host");

  if (host) {
    return `${protocol}://${host}/api/payment/zarinpal/verify`;
  }

  throw new Error(
    "Unable to determine callback URL. Please set NEXTAUTH_URL or NEXT_PUBLIC_BASE_URL environment variable."
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body;

    if (!plan || !["free", "explorer", "creator", "studio"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan name" }, { status: 400 });
    }

    // Don't allow free plan purchases
    if (plan === "free") {
      return NextResponse.json(
        { error: "Cannot purchase free plan" },
        { status: 400 }
      );
    }

    const amount = planPrices[plan];
    if (!amount || amount === 0) {
      return NextResponse.json(
        { error: "Invalid plan price" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has this plan
    if (user.currentPlan === plan) {
      return NextResponse.json(
        { error: "You already have this plan" },
        { status: 400 }
      );
    }

    const merchantId = process.env.ZARINPAL_MERCHANT_ID;
    const useSandbox = process.env.ZARINPAL_SANDBOX === "true";

    if (!merchantId) {
      console.error("ZARINPAL_MERCHANT_ID is not configured");
      return NextResponse.json(
        { error: "Payment gateway not configured" },
        { status: 500 }
      );
    }

    const callbackUrl = getCallbackUrl(request);
    const description = `خرید پلن ${plan}`;

    // Use sandbox or production endpoint based on environment
    const zarinpalApiUrl = useSandbox
      ? "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
      : "https://payment.zarinpal.com/pg/v4/payment/request.json";

    // Call Zarinpal API to create payment request
    let zarinpalResponse;
    try {
      zarinpalResponse = await axios.post(
        zarinpalApiUrl,
        {
          merchant_id: merchantId,
          amount: amount,
          callback_url: callbackUrl,
          description: description,
          metadata: {
            mobile: user.mobileNumber,
            email: `${user.mobileNumber}@bananaai.ir`, // Use mobile as email if no email field
          },
        },
        {
          headers: {
            accept: "application/json",
            "content-type": "application/json",
          },
        }
      );
    } catch (axiosError: any) {
      // Handle axios errors (including 401)
      const errorResponse = axiosError.response?.data;
      const statusCode = axiosError.response?.status;

      console.error("Zarinpal API request failed:", {
        status: statusCode,
        statusText: axiosError.response?.statusText,
        data: errorResponse,
        merchantId: merchantId?.substring(0, 8) + "...", // Log partial ID for debugging
        useSandbox,
      });

      // Return more specific error message
      if (statusCode === 401) {
        return NextResponse.json(
          {
            error: "Invalid merchant ID or authentication failed",
            details:
              errorResponse?.errors ||
              errorResponse?.message ||
              "Please check your ZARINPAL_MERCHANT_ID",
            hint: useSandbox
              ? "Using sandbox endpoint"
              : "Using production endpoint",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error: "Payment gateway error",
          details:
            errorResponse?.errors ||
            errorResponse?.message ||
            axiosError.message,
          status: statusCode,
        },
        { status: 500 }
      );
    }

    // Check Zarinpal response
    if (
      zarinpalResponse.data.errors &&
      zarinpalResponse.data.errors.length > 0
    ) {
      console.error("Zarinpal API errors:", zarinpalResponse.data.errors);
      return NextResponse.json(
        {
          error: "Payment gateway error",
          details: zarinpalResponse.data.errors,
        },
        { status: 500 }
      );
    }

    const code = zarinpalResponse.data.data?.code;
    const authority = zarinpalResponse.data.data?.authority;

    if (code !== 100 || !authority) {
      console.error("Invalid Zarinpal response:", zarinpalResponse.data);
      return NextResponse.json(
        { error: "Failed to create payment request" },
        { status: 500 }
      );
    }

    // Create pending billing entry
    const billingEntry = {
      id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
      amount: amount,
      plan: plan,
      status: "pending" as const,
      authority: authority,
    };

    user.billingHistory.push(billingEntry);
    await user.save();

    // Return payment gateway URL (use sandbox or production)
    const paymentBaseUrl = useSandbox
      ? "https://sandbox.zarinpal.com/pg/StartPay"
      : "https://payment.zarinpal.com/pg/StartPay";
    const paymentUrl = `${paymentBaseUrl}/${authority}`;

    return NextResponse.json({
      success: true,
      authority: authority,
      paymentUrl: paymentUrl,
      billingId: billingEntry.id,
    });
  } catch (error: any) {
    console.error("Error creating payment request:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
