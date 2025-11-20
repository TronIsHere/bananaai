import { NextRequest, NextResponse } from "next/server";
import { otpSchema, mobileNumberSchema } from "@/lib/validations";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";

const HARDCODED_OTP = "123456";

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

    // Verify OTP (hardcoded for now)
    if (otp !== HARDCODED_OTP) {
      return NextResponse.json(
        { error: "کد تأیید نامعتبر است" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user exists
    const user = await User.findOne({ mobileNumber });

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
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

