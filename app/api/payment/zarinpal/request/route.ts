import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";
import Discount from "@/app/models/discount";
import axios from "axios";
import { PlanType, getPlanNameEnglish } from "@/lib/utils";
import { creditPackages } from "@/lib/data";

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
    const { plan, type, creditPackageId, discountCode } = body;

    // Determine purchase type
    const purchaseType = type || "plan"; // Default to "plan" for backward compatibility

    let originalAmount: number;
    let amount: number;
    let description: string;
    let billingEntry: any;
    let discountInfo: {
      code: string;
      discountAmount: number;
    } | null = null;

    if (purchaseType === "credits") {
      // Handle credit purchase
      if (!creditPackageId) {
        return NextResponse.json(
          { error: "Credit package ID is required" },
          { status: 400 }
        );
      }

      const creditPackage = creditPackages.find(
        (pkg) => pkg.id === creditPackageId
      );
      if (!creditPackage) {
        return NextResponse.json(
          { error: "Invalid credit package ID" },
          { status: 400 }
        );
      }

      originalAmount = creditPackage.price;
      amount = originalAmount;
      description = `خرید ${creditPackage.credits} اعتبار`;

      billingEntry = {
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date(),
        amount: amount,
        type: "credits",
        credits: creditPackage.credits,
        status: "pending" as const,
      };
    } else {
      // Handle plan purchase (existing logic)
      if (!plan || !["free", "explorer", "creator", "studio"].includes(plan)) {
        return NextResponse.json(
          { error: "Invalid plan name" },
          { status: 400 }
        );
      }

      // Don't allow free plan purchases
      if (plan === "free") {
        return NextResponse.json(
          { error: "Cannot purchase free plan" },
          { status: 400 }
        );
      }

      originalAmount = planPrices[plan];
      if (!originalAmount || originalAmount === 0) {
        return NextResponse.json(
          { error: "Invalid plan price" },
          { status: 400 }
        );
      }

      amount = originalAmount;
      description = `خرید پلن ${plan}`;

      billingEntry = {
        id: `inv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date(),
        amount: amount,
        type: "plan",
        plan: plan,
        status: "pending" as const,
      };
    }

    // Apply discount code if provided
    if (
      discountCode &&
      typeof discountCode === "string" &&
      discountCode.trim()
    ) {
      // Connect to DB if not already connected
      await connectDB();

      // Find discount code (case-insensitive search, but stored in uppercase)
      const discount = await Discount.findOne({
        code: discountCode.trim().toUpperCase(),
      });

      if (!discount) {
        return NextResponse.json(
          {
            error: "کد تخفیف یافت نشد",
          },
          { status: 400 }
        );
      }

      // Check if discount is valid (re-check for race conditions)
      if (!discount.isValid()) {
        let errorMessage = "کد تخفیف نامعتبر است";
        if (!discount.isActive) {
          errorMessage = "کد تخفیف غیرفعال است";
        } else if (discount.usedCount >= discount.capacity) {
          errorMessage = "ظرفیت کد تخفیف به پایان رسیده است";
        } else if (discount.expiresAt && new Date() > discount.expiresAt) {
          errorMessage = "کد تخفیف منقضی شده است";
        }

        return NextResponse.json(
          {
            error: errorMessage,
          },
          { status: 400 }
        );
      }

      // Calculate discount amount
      const discountAmount = discount.calculateDiscount(originalAmount);

      if (discountAmount > 0) {
        amount = originalAmount - discountAmount;
        discountInfo = {
          code: discount.code,
          discountAmount: discountAmount,
        };

        // Update billing entry with discount info
        // Note: We'll increment the discount usage count in the verify route after successful payment
        billingEntry.originalAmount = originalAmount;
        billingEntry.discountAmount = discountAmount;
        billingEntry.discountCode = discount.code;
        billingEntry.amount = amount;
      }
    }

    // Connect to DB if not already connected (in case discount was applied above)
    // Note: connectDB is idempotent, so calling it multiple times is safe
    await connectDB();

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // For credit purchases, check that user has an active plan other than free
    if (purchaseType === "credits") {
      // Normalize currentPlan if it contains Persian text (defensive measure)
      const normalizedPlan = getPlanNameEnglish(user.currentPlan || "");

      // Check if user has a plan other than free
      if (!normalizedPlan || normalizedPlan === "free") {
        return NextResponse.json(
          {
            error:
              "برای خرید اعتبار اضافی باید یک پلن فعال (غیر از رایگان) داشته باشید",
            errorEn:
              "You must have an active plan (other than free) to purchase extra credits",
          },
          { status: 400 }
        );
      }

      // Check if plan is still active (planEndDate should be in the future or null)
      if (user.planEndDate && new Date(user.planEndDate) < new Date()) {
        return NextResponse.json(
          {
            error: "پلن شما منقضی شده است. لطفا ابتدا یک پلن جدید خریداری کنید",
            errorEn: "Your plan has expired. Please purchase a new plan first",
          },
          { status: 400 }
        );
      }
    }

    // Check if user already has this plan (only for plan purchases)
    if (purchaseType === "plan" && user.currentPlan === plan) {
      return NextResponse.json(
        { error: "You already have this plan" },
        { status: 400 }
      );
    }

    // If amount is 0 or less after discount, grant access directly without payment
    if (amount <= 0) {
      // Normalize currentPlan if it contains Persian text (defensive measure)
      if (user.currentPlan && typeof user.currentPlan === "string") {
        const normalizedPlan = getPlanNameEnglish(user.currentPlan);
        if (normalizedPlan !== user.currentPlan) {
          user.currentPlan = normalizedPlan;
        }
      }

      // Update billing entry status to paid (no payment needed)
      billingEntry.status = "paid";
      billingEntry.amount = 0; // Ensure amount is 0

      if (purchaseType === "credits") {
        // Handle credit purchase - add credits to user's account
        const creditsToAdd = billingEntry.credits || 0;
        user.credits = (user.credits || 0) + creditsToAdd;
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
      }

      // Increment discount code usage if discount was applied
      if (billingEntry.discountCode) {
        const discount = await Discount.findOne({
          code: billingEntry.discountCode,
        });
        if (discount) {
          discount.usedCount += 1;
          await discount.save();
        }
      }

      // Save user with updated billing entry
      user.billingHistory.push(billingEntry);
      await user.save();

      // Return success response without payment URL
      return NextResponse.json({
        success: true,
        free: true, // Indicate this was a free purchase
        billingId: billingEntry.id,
        message: purchaseType === "credits" 
          ? "اعتبارات با موفقیت اضافه شد" 
          : "پلن با موفقیت فعال شد",
      });
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

    // Use sandbox or production endpoint based on environment
    const zarinpalApiUrl = useSandbox
      ? "https://sandbox.zarinpal.com/pg/v4/payment/request.json"
      : "https://payment.zarinpal.com/pg/v4/payment/request.json";

    // Call Zarinpal API to create payment request
    // Convert Toman to Rial (multiply by 10) for Zarinpal
    const amountInRial = amount * 10;
    let zarinpalResponse;
    try {
      zarinpalResponse = await axios.post(
        zarinpalApiUrl,
        {
          merchant_id: merchantId,
          amount: amountInRial,
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
            "user-agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "accept-language": "en-US,en;q=0.9,fa;q=0.8",
            "accept-encoding": "gzip, deflate, br",
            origin:
              process.env.NEXTAUTH_URL ||
              process.env.NEXT_PUBLIC_BASE_URL ||
              "https://bananaai.ir",
            referer:
              process.env.NEXTAUTH_URL ||
              process.env.NEXT_PUBLIC_BASE_URL ||
              "https://bananaai.ir",
          },
          timeout: 30000, // 30 second timeout
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

      // Always return generic error message to users
      return NextResponse.json(
        {
          error: "خطا در درگاه پرداخت",
          message: "خطایی رخ داده است. لطفاً با پشتیبانی تماس بگیرید.",
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
          error: "خطا در درگاه پرداخت",
          message: "خطایی رخ داده است. لطفاً با پشتیبانی تماس بگیرید.",
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

    // Add authority to billing entry
    billingEntry.authority = authority;

    // Normalize currentPlan if it contains Persian text (defensive measure)
    if (user.currentPlan && typeof user.currentPlan === "string") {
      const normalizedPlan = getPlanNameEnglish(user.currentPlan);
      if (normalizedPlan !== user.currentPlan) {
        user.currentPlan = normalizedPlan;
      }
    }

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
      {
        error: "خطا در درگاه پرداخت",
        message: "خطایی رخ داده است. لطفاً با پشتیبانی تماس بگیرید.",
      },
      { status: 500 }
    );
  }
}
