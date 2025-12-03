import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Contact from "@/app/models/contact";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").max(100, "نام نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد"),
  email: z.string().email("ایمیل معتبر نیست"),
  subject: z.string().min(2, "موضوع باید حداقل ۲ کاراکتر باشد").max(200, "موضوع نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد"),
  message: z.string().min(10, "پیام باید حداقل ۱۰ کاراکتر باشد").max(5000, "پیام نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = contactSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = validation.data;

    // Connect to database
    await connectDB();

    // Create contact message
    const contact = new Contact({
      name,
      email,
      subject,
      message,
      status: "pending",
      type: "contact",
    });

    await contact.save();

    return NextResponse.json(
      {
        success: true,
        message: "پیام شما با موفقیت ارسال شد",
        id: contact._id.toString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      { error: "خطا در ارسال پیام" },
      { status: 500 }
    );
  }
}

