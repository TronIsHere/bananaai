import { NextRequest, NextResponse } from "next/server";
import {
  mobileNumberSchema,
  otpSchema,
  firstNameSchema,
  lastNameSchema,
} from "@/lib/validations";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";

const HARDCODED_OTP = "123456";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mobileNumber, otp, firstName, lastName } = body;

    // Validate all inputs
    const mobileValidation = mobileNumberSchema.safeParse(mobileNumber);
    const otpValidation = otpSchema.safeParse(otp);
    const firstNameValidation = firstNameSchema.safeParse(firstName);
    const lastNameValidation = lastNameSchema.safeParse(lastName);

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

    if (!firstNameValidation.success) {
      return NextResponse.json(
        { error: firstNameValidation.error.issues[0].message },
        { status: 400 }
      );
    }

    if (!lastNameValidation.success) {
      return NextResponse.json(
        { error: lastNameValidation.error.issues[0].message },
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

    // Check if user already exists
    const existingUser = await User.findOne({ mobileNumber });

    if (existingUser) {
      return NextResponse.json(
        { error: "کاربر با این شماره موبایل قبلاً ثبت‌نام کرده است" },
        { status: 400 }
      );
    }

    // Create new user
    const newUser = await User.create({
      mobileNumber,
      firstName,
      lastName,
    });

    return NextResponse.json(
      {
        success: true,
        user: {
          id: newUser._id.toString(),
          mobileNumber: newUser.mobileNumber,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error registering user:", error);
    
    // Handle duplicate key error (mobileNumber unique constraint)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "کاربر با این شماره موبایل قبلاً ثبت‌نام کرده است" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

