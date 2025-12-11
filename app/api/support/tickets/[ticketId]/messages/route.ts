import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import connectDB from "@/lib/mongodb";
import Contact from "@/app/models/contact";
import { z } from "zod";

const messageSchema = z.object({
  content: z
    .string()
    .min(0)
    .max(5000, "پیام نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد"),
  images: z.array(z.string().url()).optional(),
  generatedImages: z.array(z.string().url()).optional(),
  messageType: z
    .enum(["text", "image_generation", "image_to_image"])
    .optional()
    .default("text"),
});

// GET - Get all messages for a ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId } = await params;

    // Connect to database
    await connectDB();

    // Find ticket
    const ticket = await Contact.findOne({
      _id: ticketId,
      userId: session.user.id,
      type: "support",
    });

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
        messages: messages.map((msg: any) => ({
          content: msg.content,
          sender: msg.sender,
          senderId: msg.senderId,
          senderMobile: msg.senderMobile,
          images: msg.images || [],
          generatedImages: msg.generatedImages || [],
          messageType: msg.messageType || "text",
          createdAt: msg.createdAt,
        })),
        ticket: {
          id: ticket._id.toString(),
          subject: ticket.subject,
          status: ticket.status,
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

// POST - Send a new message in a ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ticketId } = await params;
    const body = await request.json();

    // Validate input - allow empty content if images are provided
    const validation = messageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { content, images, generatedImages, messageType } = validation.data;

    // Ensure at least content or images are provided
    if (
      !content?.trim() &&
      (!images || images.length === 0) &&
      (!generatedImages || generatedImages.length === 0)
    ) {
      return NextResponse.json(
        { error: "پیام یا تصویر باید وارد شود" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find ticket
    const ticket = await Contact.findOne({
      _id: ticketId,
      userId: session.user.id,
      type: "support",
    });

    if (!ticket) {
      return NextResponse.json({ error: "تیکت یافت نشد" }, { status: 404 });
    }

    if (ticket.status === "closed") {
      return NextResponse.json(
        { error: "این تیکت بسته شده است" },
        { status: 400 }
      );
    }

    // Initialize messages array if empty (migrate initial message)
    if (!ticket.messages || ticket.messages.length === 0) {
      ticket.messages = [
        {
          content: ticket.message,
          sender: "user" as const,
          senderId: ticket.userId,
          createdAt: ticket.createdAt,
        },
      ];
    }

    // Add new message
    const newMessage: any = {
      content: content || "",
      sender:
        generatedImages && generatedImages.length > 0
          ? ("assistant" as const)
          : ("user" as const),
      senderId: session.user.id,
      images: images || [],
      generatedImages: generatedImages || [],
      messageType: messageType || "text",
      createdAt: new Date(),
    };

    ticket.messages.push(newMessage);

    // Update status if it was pending
    if (ticket.status === "pending") {
      ticket.status = "responded"; // User responded, waiting for admin
    }

    await ticket.save();

    return NextResponse.json(
      {
        success: true,
        message: "پیام با موفقیت ارسال شد",
        messageData: {
          content: newMessage.content,
          sender: newMessage.sender,
          senderId: newMessage.senderId,
          images: newMessage.images,
          generatedImages: newMessage.generatedImages,
          messageType: newMessage.messageType,
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
