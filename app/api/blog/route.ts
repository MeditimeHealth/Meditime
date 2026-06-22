import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Blog from "@/models/Blog";

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI!);
}

export async function GET() {
  try {
    await connectDB();
    const blogs = await Blog.find({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, blogs });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch blogs" }, { status: 500 });
  }
}
