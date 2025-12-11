import { NextRequest, NextResponse } from "next/server";
import { otpSchema, mobileNumberSchema } from "@/lib/validations";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";
import { verifyOTP, normalizePhoneNumber } from "@/lib/otp-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobileNumber, otp } = body;

    // Validate inputs
    const mobileValidation = mobileNumberSchema.safeParse(mobileNumber);
    const otpValidation = otpSchema.safeParse(otp);

    if (!mobileValidation.success) {
      return NextResponse.json(
        { error: mobileValidation.error.issues[0].message },
        { status: 400 }
      );
    }

    if (!otpValidation.success) {
      return NextResponse.json(
        { error: otpValidation.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verify OTP (keep it valid - don't delete yet)
    // The OTP will be deleted by NextAuth during signIn, or during registration if user doesn't exist
    const verificationResult = await verifyOTP(mobileNumber, otp, false);

    if (!verificationResult.valid) {
      return NextResponse.json(
        {
          error: verificationResult.error || "کد تأیید نامعتبر است",
          attemptsRemaining: verificationResult.attemptsRemaining,
        },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Normalize mobile number (trim whitespace and ensure consistent format)
    const normalizedMobileNumber = normalizePhoneNumber(mobileNumber);

    // Check if user exists
    const user = await User.findOne({ mobileNumber: normalizedMobileNumber });

    if (user) {
      // User exists, return user data
      return NextResponse.json(
        {
          success: true,
          userExists: true,
          user: {
            id: user._id.toString(),
            mobileNumber: user.mobileNumber,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        },
        { status: 200 }
      );
    } else {
      // User doesn't exist, return that they need to register
      return NextResponse.json(
        {
          success: true,
          userExists: false,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: error.message || "خطای داخلی سرور" },
      { status: 500 }
    );
  }
}
