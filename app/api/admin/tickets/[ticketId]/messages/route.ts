import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import Contact from "@/app/models/contact";
import { z } from "zod";

const ADMIN_MOBILE_NUMBER = "09306613683";

const messageSchema = z.object({
  content: z
    .string()
    .min(1, "پیام نمی‌تواند خالی باشد")
    .max(5000, "پیام نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد"),
});

// GET - Get all messages for a ticket (admin)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.mobileNumber) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const normalizedMobile = session.user.mobileNumber
      .trim()
      .replace(/\s+/g, "");
    if (normalizedMobile !== ADMIN_MOBILE_NUMBER) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { ticketId } = await params;

    // Connect to database
    await connectDB();

    // Find ticket
    const ticket = await Contact.findById(ticketId);

    if (!ticket) {
      return NextResponse.json({ error: "تیکت یافت نشد" }, { status: 404 });
    }

    // Return messages (if empty, return initial message as first message)
    const messages =
      ticket.messages && ticket.messages.length > 0
        ? ticket.messages
        : [
            {
              content: ticket.message,
              sender: "user" as const,
              senderId: ticket.userId,
              createdAt: ticket.createdAt,
            },
          ];

    return NextResponse.json(
      {
        success: true,
        messages: messages.map((msg) => ({
          content: msg.content,
          sender: msg.sender,
          senderId: msg.senderId,
          senderMobile: msg.senderMobile,
          createdAt: msg.createdAt,
        })),
        ticket: {
          id: ticket._id.toString(),
          name: ticket.name,
          email: ticket.email,
          subject: ticket.subject,
          status: ticket.status,
          type: ticket.type || "contact",
          userId: ticket.userId,
          createdAt: ticket.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching ticket messages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Send a new message in a ticket (admin)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.mobileNumber) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const normalizedMobile = session.user.mobileNumber
      .trim()
      .replace(/\s+/g, "");
    if (normalizedMobile !== ADMIN_MOBILE_NUMBER) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    const { ticketId } = await params;
    const body = await request.json();

    // Validate input
    const validation = messageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // Connect to database
    await connectDB();

    // Find ticket
    const ticket = await Contact.findById(ticketId);

    if (!ticket) {
      return NextResponse.json({ error: "تیکت یافت نشد" }, { status: 404 });
    }

    if (ticket.status === "closed") {
      return NextResponse.json(
        { error: "این تیکت بسته شده است" },
        { status: 400 }
      );
    }

    // Initialize messages array if empty (migrate initial message and response)
    if (!ticket.messages || ticket.messages.length === 0) {
      ticket.messages = [
        {
          content: ticket.message,
          sender: "user" as const,
          senderId: ticket.userId,
          createdAt: ticket.createdAt,
        },
      ];

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
      content,
      sender: "admin" as const,
      senderMobile: normalizedMobile,
      createdAt: new Date(),
    };

    ticket.messages.push(newMessage);

    // Update legacy fields for backward compatibility
    ticket.response = content;
    ticket.respondedAt = new Date();
    ticket.respondedBy = normalizedMobile;

    // Update status
    ticket.status = "responded";

    await ticket.save();

    return NextResponse.json(
      {
        success: true,
        message: "پیام با موفقیت ارسال شد",
        messageData: {
          content: newMessage.content,
          sender: newMessage.sender,
          senderMobile: newMessage.senderMobile,
          createdAt: newMessage.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "خطا در ارسال پیام" }, { status: 500 });
  }
}
