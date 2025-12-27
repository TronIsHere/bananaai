import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Discount from "@/app/models/discount";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, amount } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Discount code is required" },
        { status: 400 }
      );
    }

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find discount code (case-insensitive search, but stored in uppercase)
    const discount = await Discount.findOne({
      code: code.trim().toUpperCase(),
    });

    if (!discount) {
      return NextResponse.json(
        { error: "کد تخفیف یافت نشد", valid: false },
        { status: 404 }
      );
    }

    // Check if discount is valid
    if (!discount.isValid()) {
      if (!discount.isActive) {
        return NextResponse.json(
          { error: "کد تخفیف غیرفعال است", valid: false },
          { status: 400 }
        );
      }
      if (discount.usedCount >= discount.capacity) {
        return NextResponse.json(
          { error: "ظرفیت کد تخفیف به پایان رسیده است", valid: false },
          { status: 400 }
        );
      }
      if (discount.expiresAt && new Date() > discount.expiresAt) {
        return NextResponse.json(
          { error: "کد تخفیف منقضی شده است", valid: false },
          { status: 400 }
        );
      }
    }

    // Calculate discount amount
    const discountAmount = discount.calculateDiscount(amount);
    const finalAmount = amount - discountAmount;

    return NextResponse.json({
      valid: true,
      discount: {
        code: discount.code,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        discountAmount: discountAmount,
        originalAmount: amount,
        finalAmount: finalAmount,
      },
    });
  } catch (error: any) {
    console.error("Error validating discount code:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}



