/**
 * OTP Service
 * Handles OTP generation, storage, and verification
 */

import crypto from "crypto";
import connectDB from "@/lib/mongodb";
import OTP from "@/app/models/otp";
import { sendOTPWithKavenegar } from "@/lib/kavenegar";

const OTP_EXPIRY_SECONDS = 120; // 2 minutes
const MAX_ATTEMPTS = 5;

/**
 * Generate a random 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Hash OTP code using HMAC-SHA256
 */
export function hashOTP(code: string): string {
  const secret =
    process.env.OTP_SECRET || process.env.NEXTAUTH_SECRET || "default-secret";
  return crypto.createHmac("sha256", secret).update(code).digest("hex");
}

/**
 * Compare OTP codes using timing-safe comparison
 */
export function compareOTP(storedHash: string, providedCode: string): boolean {
  const providedHash = hashOTP(providedCode);
  return crypto.timingSafeEqual(
    Buffer.from(storedHash),
    Buffer.from(providedHash)
  );
}

/**
 * Normalize phone number (remove spaces, ensure consistent format)
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  return phoneNumber.trim().replace(/\s+/g, "");
}

/**
 * Send OTP code to phone number via Kave Negar
 * Stores hashed code in database with expiration
 */
export async function sendOTP(mobileNumber: string): Promise<{
  success: boolean;
  expiresAt: Date;
  error?: string;
}> {
  try {
    await connectDB();

    const normalizedMobile = normalizePhoneNumber(mobileNumber);

    // Generate OTP code
    const otpCode = generateOTP();
    const hashedCode = hashOTP(otpCode);

    // Calculate expiration time
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

    // Delete any existing OTPs for this mobile number
    await OTP.deleteMany({ mobileNumber: normalizedMobile });

    // Store hashed OTP in database
    await OTP.create({
      mobileNumber: normalizedMobile,
      hashedCode,
      expiresAt,
      attempts: 0,
    });

    // Send OTP via Kave Negar
    try {
      await sendOTPWithKavenegar({
        receptor: normalizedMobile,
        token: otpCode,
        template: process.env.KAVENEGAR_VERIFY_TEMPLATE || "verify",
      });

      return {
        success: true,
        expiresAt,
      };
    } catch (error: any) {
      // If SMS sending fails, remove the stored OTP
      await OTP.deleteMany({ mobileNumber: normalizedMobile });

      console.error("Failed to send OTP via Kavenegar:", error);
      return {
        success: false,
        expiresAt,
        error: error.message || "Failed to send OTP",
      };
    }
  } catch (error: any) {
    console.error("Error in sendOTP:", error);
    return {
      success: false,
      expiresAt: new Date(),
      error: error.message || "Internal server error",
    };
  }
}

/**
 * Verify OTP code for a phone number
 * Returns true if valid, false otherwise
 * Also tracks failed attempts
 * @param deleteOnSuccess - If true, deletes OTP after successful verification (default: true)
 */
export async function verifyOTP(
  mobileNumber: string,
  otpCode: string,
  deleteOnSuccess: boolean = true
): Promise<{
  valid: boolean;
  error?: string;
  attemptsRemaining?: number;
}> {
  try {
    await connectDB();

    const normalizedMobile = normalizePhoneNumber(mobileNumber);

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      mobileNumber: normalizedMobile,
    }).sort({ createdAt: -1 }); // Get the most recent OTP

    if (!otpRecord) {
      return {
        valid: false,
        error: "کد تأیید پیدا نشد. لطفاً دوباره درخواست کنید.",
      };
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return {
        valid: false,
        error: "کد تأیید منقضی شده است. لطفاً دوباره درخواست کنید.",
      };
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return {
        valid: false,
        error: "تعداد تلاش‌های مجاز تمام شده است. لطفاً کد جدید درخواست کنید.",
        attemptsRemaining: 0,
      };
    }

    // Verify OTP code using timing-safe comparison
    const isValid = compareOTP(otpRecord.hashedCode, otpCode);

    if (isValid) {
      // Delete OTP after successful verification only if deleteOnSuccess is true
      if (deleteOnSuccess) {
        await OTP.deleteOne({ _id: otpRecord._id });
      }
      return {
        valid: true,
      };
    } else {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();

      const attemptsRemaining = MAX_ATTEMPTS - otpRecord.attempts;
      return {
        valid: false,
        error: "کد تأیید نامعتبر است.",
        attemptsRemaining,
      };
    }
  } catch (error: any) {
    console.error("Error in verifyOTP:", error);
    return {
      valid: false,
      error: error.message || "خطای داخلی سرور",
    };
  }
}




