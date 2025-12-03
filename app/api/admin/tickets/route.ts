import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import Contact from "@/app/models/contact";

const ADMIN_MOBILE_NUMBER = "09306613683";

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.mobileNumber) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    const normalizedMobile = session.user.mobileNumber.trim().replace(/\s+/g, "");
    if (normalizedMobile !== ADMIN_MOBILE_NUMBER) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Connect to database
    await connectDB();

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "pending", "responded", "closed", or null for all
    const type = searchParams.get("type"); // "contact", "support", or null for all

    // Build query
    const query: any = {};
    if (status && ["pending", "responded", "closed"].includes(status)) {
      query.status = status;
    }
    if (type && ["contact", "support"].includes(type)) {
      query.type = type;
    } else {
      // Default to showing both types if not specified
      query.type = { $in: ["contact", "support"] };
    }

    // Fetch tickets
    const tickets = await Contact.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        tickets: tickets.map((ticket) => ({
          id: ticket._id.toString(),
          name: ticket.name,
          email: ticket.email,
          subject: ticket.subject,
          message: ticket.message,
          status: ticket.status,
          response: ticket.response,
          respondedAt: ticket.respondedAt,
          respondedBy: ticket.respondedBy,
          type: ticket.type || "contact",
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

