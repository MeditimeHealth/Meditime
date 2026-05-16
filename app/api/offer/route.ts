import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Offer from "@/models/Offer";

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI!);
}

export async function GET() {
  try {
    await connectDB();
    const offers = await Offer.find({ isActive: true }).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, offers });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to fetch offers" }, { status: 500 });
  }
}
