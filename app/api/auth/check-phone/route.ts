import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");

    if (!phoneNumber || phoneNumber.length !== 11 || !phoneNumber.startsWith("01")) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    const formattedWithCountry = `+880${phoneNumber.substring(1)}`;
    const userExists = await User.findOne({
      $or: [
        { phoneNumber: phoneNumber },
        { phoneNumber: formattedWithCountry }
      ]
    });

    return NextResponse.json({ exists: !!userExists });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
