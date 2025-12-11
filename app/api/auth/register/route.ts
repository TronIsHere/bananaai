import { NextRequest, NextResponse } from "next/server";
import {
  mobileNumberSchema,
  otpSchema,
  firstNameSchema,
  lastNameSchema,
} from "@/lib/validations";
import connectDB from "@/lib/mongodb";
import User from "@/app/models/user";
import { verifyOTP, normalizePhoneNumber } from "@/lib/otp-service";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { mobileNumber, otp, firstName, lastName } = body;

  try {
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

    // Verify OTP
    const verificationResult = await verifyOTP(mobileNumber, otp);

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

    // Drop problematic index if it exists (legacy index from when billingHistory.id had unique: true)
    // This prevents duplicate key errors when users have empty billingHistory arrays
    try {
      await User.collection.dropIndex("billingHistory.id_1");
      console.log("Dropped problematic billingHistory.id_1 index");
    } catch (error: any) {
      // Index doesn't exist or already dropped, ignore error
      if (error.code !== 27 && error.codeName !== "IndexNotFound") {
        console.warn(
          "Could not drop billingHistory.id_1 index:",
          error.message
        );
      }
    }

    // Normalize mobile number (trim whitespace and ensure consistent format)
    const normalizedMobileNumber = normalizePhoneNumber(mobileNumber);

    // Check if user already exists
    const existingUser = await User.findOne({
      mobileNumber: normalizedMobileNumber,
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "کاربر با این شماره موبایل قبلاً ثبت‌نام کرده است" },
        { status: 400 }
      );
    }

    // Create new user with free plan (12 credits for 3 image generations)
    const now = new Date();
    const monthlyResetDate = new Date(now);
    monthlyResetDate.setMonth(monthlyResetDate.getMonth() + 1);

    const newUser = await User.create({
      mobileNumber: normalizedMobileNumber,
      firstName,
      lastName,
      credits: 12, // Free plan: 3 image generations × 4 credits per generation
      currentPlan: "free", // Free plan
      planStartDate: now,
      planEndDate: monthlyResetDate, // Monthly reset date
      monthlyResetDate: monthlyResetDate,
      imagesGeneratedThisMonth: 0,
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

    // Handle duplicate key error
    if (error.code === 11000) {
      // Check if it's the billingHistory.id index issue
      if (error.keyPattern && error.keyPattern["billingHistory.id"]) {
        // Try to drop the problematic index and retry once
        try {
          await User.collection.dropIndex("billingHistory.id_1");
          console.log(
            "Dropped problematic billingHistory.id_1 index and retrying"
          );

          // Retry user creation with stored values
          const normalizedMobileNumber = normalizePhoneNumber(mobileNumber);
          const now = new Date();
          const monthlyResetDate = new Date(now);
          monthlyResetDate.setMonth(monthlyResetDate.getMonth() + 1);

          const newUser = await User.create({
            mobileNumber: normalizedMobileNumber,
            firstName,
            lastName,
            credits: 12,
            currentPlan: "free",
            planStartDate: now,
            planEndDate: monthlyResetDate,
            monthlyResetDate: monthlyResetDate,
            imagesGeneratedThisMonth: 0,
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
        } catch (retryError: any) {
          // If retry fails, return error
          console.error("Retry after dropping index also failed:", retryError);
        }
      }

      // Mobile number duplicate or other duplicate key error
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
