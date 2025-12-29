import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Banner from "@/app/models/banner";

// GET - Get active banner for public display
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Get active banner
    const banner = await Banner.findOne({ isActive: true }).lean();

    if (!banner) {
      return NextResponse.json({
        success: true,
        banner: null,
      });
    }

    return NextResponse.json({
      success: true,
      banner: {
        id: banner._id.toString(),
        imageUrl: banner.imageUrl,
        link: banner.link,
        height: banner.height,
        customHeight: banner.customHeight,
      },
    });
  } catch (error: any) {
    console.error("Error fetching active banner:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

