import { NextRequest, NextResponse } from "next/server";
import { mobileNumberSchema } from "@/lib/validations";
import { sendOTP } from "@/lib/otp-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobileNumber } = body;

    // Validate mobile number
    const validation = mobileNumberSchema.safeParse(mobileNumber);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Send OTP via Kave Negar
    const result = await sendOTP(mobileNumber);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "خطا در ارسال کد تأیید",
          message: result.error || "خطا در ارسال کد تأیید",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "کد تأیید با موفقیت ارسال شد",
        expiresAt: result.expiresAt,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: error.message || "خطای داخلی سرور" },
      { status: 500 }
    );
  }
}
