import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import Discount from "@/app/models/discount";

const ADMIN_MOBILE_NUMBER = "09306613683";

// Helper function to check admin access
async function checkAdminAccess() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.mobileNumber) {
    return { authorized: false, error: "Unauthorized" };
  }

  const normalizedMobile = session.user.mobileNumber.trim().replace(/\s+/g, "");
  if (normalizedMobile !== ADMIN_MOBILE_NUMBER) {
    return { authorized: false, error: "Forbidden - Admin access required" };
  }

  return { authorized: true };
}

// GET - List all discount codes
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    await connectDB();

    const discounts = await Discount.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        discounts: discounts.map((discount) => ({
          id: discount._id.toString(),
          code: discount.code,
          discountType: discount.discountType,
          discountValue: discount.discountValue,
          capacity: discount.capacity,
          usedCount: discount.usedCount,
          expiresAt: discount.expiresAt,
          isActive: discount.isActive,
          createdAt: discount.createdAt,
          updatedAt: discount.updatedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching discount codes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new discount code
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await checkAdminAccess();
    if (!adminCheck.authorized) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    const body = await request.json();
    const { code, discountType, discountValue, capacity, expiresAt, isActive } =
      body;

    // Validation
    if (!code || typeof code !== "string" || code.trim().length < 3) {
      return NextResponse.json(
        { error: "کد تخفیف باید حداقل ۳ کاراکتر باشد" },
        { status: 400 }
      );
    }

    if (
      !discountType ||
      !["percentage", "fixed"].includes(discountType)
    ) {
      return NextResponse.json(
        { error: "نوع تخفیف نامعتبر است" },
        { status: 400 }
      );
    }

    if (
      !discountValue ||
      typeof discountValue !== "number" ||
      discountValue <= 0
    ) {
      return NextResponse.json(
        { error: "مقدار تخفیف باید یک عدد مثبت باشد" },
        { status: 400 }
      );
    }

    if (discountType === "percentage" && discountValue > 100) {
      return NextResponse.json(
        { error: "درصد تخفیف نمی‌تواند بیشتر از ۱۰۰ باشد" },
        { status: 400 }
      );
    }

    if (!capacity || typeof capacity !== "number" || capacity < 1) {
      return NextResponse.json(
        { error: "ظرفیت باید حداقل ۱ باشد" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if code already exists
    const existingDiscount = await Discount.findOne({
      code: code.trim().toUpperCase(),
    });

    if (existingDiscount) {
      return NextResponse.json(
        { error: "کد تخفیف با این نام قبلاً ثبت شده است" },
        { status: 400 }
      );
    }

    // Create new discount code
    const discount = new Discount({
      code: code.trim().toUpperCase(),
      discountType,
      discountValue,
      capacity,
      usedCount: 0,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: isActive !== undefined ? isActive : true,
    });

    await discount.save();

    return NextResponse.json(
      {
        success: true,
        discount: {
          id: discount._id.toString(),
          code: discount.code,
          discountType: discount.discountType,
          discountValue: discount.discountValue,
          capacity: discount.capacity,
          usedCount: discount.usedCount,
          expiresAt: discount.expiresAt,
          isActive: discount.isActive,
          createdAt: discount.createdAt,
          updatedAt: discount.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating discount code:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "کد تخفیف با این نام قبلاً ثبت شده است" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}


