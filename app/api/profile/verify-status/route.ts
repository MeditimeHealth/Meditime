import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { userId, isPhoneVerified } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await User.findByIdAndUpdate(userId, { isPhoneVerified });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error updating profile verification status:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
