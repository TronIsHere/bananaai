import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import Banner from "@/app/models/banner";

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

// GET - Get current banner settings
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    await connectDB();

    // Get the banner (there should only be one)
    let banner = await Banner.findOne().lean();

    // If no banner exists, return default values
    if (!banner) {
      return NextResponse.json({
        success: true,
        banner: {
          isActive: false,
          imageUrl: "",
          link: "",
          height: "small",
          customHeight: undefined,
        },
      });
    }

    return NextResponse.json({
      success: true,
      banner: {
        id: banner._id.toString(),
        isActive: banner.isActive,
        imageUrl: banner.imageUrl,
        link: banner.link,
        height: banner.height,
        customHeight: banner.customHeight,
        createdAt: banner.createdAt,
        updatedAt: banner.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error fetching banner:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update banner settings
export async function PUT(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess();
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error },
        { status: accessCheck.error === "Unauthorized" ? 401 : 403 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      isActive,
      imageUrl,
      link,
      height,
      customHeight,
    } = body;

    // Validation
    if (imageUrl === undefined || link === undefined) {
      return NextResponse.json(
        { error: "آدرس تصویر و لینک الزامی است" },
        { status: 400 }
      );
    }

    if (imageUrl.trim().length === 0 || link.trim().length === 0) {
      return NextResponse.json(
        { error: "آدرس تصویر و لینک نمی‌تواند خالی باشد" },
        { status: 400 }
      );
    }

    if (height && !["small", "medium", "large"].includes(height)) {
      return NextResponse.json(
        { error: "ارتفاع باید یکی از مقادیر small، medium یا large باشد" },
        { status: 400 }
      );
    }

    // Find existing banner or create new one
    let banner = await Banner.findOne();

    if (banner) {
      // Update existing banner
      banner.isActive = isActive !== undefined ? isActive : banner.isActive;
      banner.imageUrl = imageUrl.trim();
      banner.link = link.trim();
      banner.height = height || banner.height;
      banner.customHeight = customHeight || undefined;
      await banner.save();
    } else {
      // Create new banner
      banner = new Banner({
        isActive: isActive !== undefined ? isActive : false,
        imageUrl: imageUrl.trim(),
        link: link.trim(),
        height: height || "small",
        customHeight: customHeight || undefined,
      });
      await banner.save();
    }

    return NextResponse.json({
      success: true,
      banner: {
        id: banner._id.toString(),
        isActive: banner.isActive,
        imageUrl: banner.imageUrl,
        link: banner.link,
        height: banner.height,
        customHeight: banner.customHeight,
        createdAt: banner.createdAt,
        updatedAt: banner.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error updating banner:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

