import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import ContactMessage from "@/models/ContactMessage";

// DB connection helper
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not defined");
  return mongoose.connect(process.env.MONGODB_URI);
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Phone validation: Start with +8801, 01, or 8801, followed by 3-9 and 8 digits
    const phoneRegex = /^(?:\+8801|01|8801)[3-9]\d{8}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: "Please enter a valid Bangladeshi phone number" },
        { status: 400 }
      );
    }

    // Save to Database
    const savedMessage = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message,
      status: 'new'
    });

    // Optional: Email notification logic
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const adminMailOptions = {
        from: "MediTime",
        to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
        subject: `New Contact Form Submission: ${subject || "Inquiry"}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #009A98;">New Contact Form Submission</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Message:</strong></p>
              <p style="white-space: pre-wrap; background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px;">${message}</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(adminMailOptions);
    } catch (emailError) {
      console.error("Email notification failed, but message was saved to DB:", emailError);
    }

    return NextResponse.json(
      { success: true, message: "Your message has been sent successfully!", data: savedMessage },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error in contact API:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}
