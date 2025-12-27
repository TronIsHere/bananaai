import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import Contact from "@/app/models/contact";
import { z } from "zod";

const supportTicketSchema = z.object({
  subject: z.string().min(2, "موضوع باید حداقل ۲ کاراکتر باشد").max(200, "موضوع نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد"),
  message: z.string().min(10, "پیام باید حداقل ۱۰ کاراکتر باشد").max(5000, "پیام نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد"),
});

// GET - Fetch user's support tickets
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Connect to database
    await connectDB();

    // Fetch user's support tickets
    const tickets = await Contact.find({
      userId: session.user.id,
      type: "support",
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        tickets: tickets.map((ticket) => ({
          id: ticket._id.toString(),
          subject: ticket.subject,
          message: ticket.message,
          status: ticket.status,
          response: ticket.response,
          respondedAt: ticket.respondedAt,
          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
        })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new support ticket
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.mobileNumber) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = supportTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { subject, message } = validation.data;

    // Connect to database
    await connectDB();

    // Create support ticket
    const ticket = new Contact({
      name: `${session.user.firstName || ""} ${session.user.lastName || ""}`.trim() || "کاربر",
      email: `${session.user.mobileNumber}@bananaai.ir`, // Placeholder email
      subject,
      message,
      userId: session.user.id,
      type: "support",
      status: "pending",
    });

    await ticket.save();

    return NextResponse.json(
      {
        success: true,
        message: "تیکت پشتیبانی با موفقیت ایجاد شد",
        ticket: {
          id: ticket._id.toString(),
          subject: ticket.subject,
          message: ticket.message,
          status: ticket.status,
          createdAt: ticket.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return NextResponse.json(
      { error: "خطا در ایجاد تیکت پشتیبانی" },
      { status: 500 }
    );
  }
}











