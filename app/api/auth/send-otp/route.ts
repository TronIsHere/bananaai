import { NextRequest, NextResponse } from "next/server";
import { mobileNumberSchema } from "@/lib/validations";

const HARDCODED_OTP = "123456";

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

    // In a real app, you would send OTP via SMS here
    // For now, we just return success
    // The OTP is hardcoded as 123456

    return NextResponse.json(
      {
        success: true,
        message: "OTP sent successfully",
        // In development, you might want to return the OTP for testing
        // otp: HARDCODED_OTP
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

