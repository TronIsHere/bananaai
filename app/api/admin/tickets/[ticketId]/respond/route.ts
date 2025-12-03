import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import Contact from "@/app/models/contact";
import { z } from "zod";

const ADMIN_MOBILE_NUMBER = "09306613683";

const respondSchema = z.object({
  response: z.string().min(1, "پاسخ نمی‌تواند خالی باشد").max(5000, "پاسخ نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد"),
  status: z.enum(["responded", "closed"]).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
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

    const body = await request.json();
    const { ticketId } = await params;

    // Validate input
    const validation = respondSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { response, status: newStatus } = validation.data;

    // Connect to database
    await connectDB();

    // Find ticket
    const ticket = await Contact.findById(ticketId);
    if (!ticket) {
      return NextResponse.json(
        { error: "تیکت یافت نشد" },
        { status: 404 }
      );
    }

    // Initialize messages array if empty (migrate initial message and response)
    if (!ticket.messages || ticket.messages.length === 0) {
      ticket.messages = [{
        content: ticket.message,
        sender: ticket.userId ? "user" as const : "user" as const,
        senderId: ticket.userId,
        createdAt: ticket.createdAt,
      }];
      
      // Add existing response if it exists
      if (ticket.response) {
        ticket.messages.push({
          content: ticket.response,
          sender: "admin" as const,
          senderMobile: ticket.respondedBy || normalizedMobile,
          createdAt: ticket.respondedAt || new Date(),
        });
      }
    }

    // Add new admin message
    const newMessage = {
      content: response,
      sender: "admin" as const,
      senderMobile: normalizedMobile,
      createdAt: new Date(),
    };

    ticket.messages.push(newMessage);
    
    // Update legacy fields for backward compatibility
    ticket.response = response;
    ticket.respondedAt = new Date();
    ticket.respondedBy = normalizedMobile;
    
    if (newStatus) {
      ticket.status = newStatus;
    } else {
      ticket.status = "responded";
    }

    await ticket.save();

    return NextResponse.json(
      {
        success: true,
        message: "پاسخ با موفقیت ثبت شد",
        ticket: {
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
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error responding to ticket:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

