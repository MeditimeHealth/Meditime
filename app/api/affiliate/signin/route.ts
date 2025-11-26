import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Affiliate from "@/models/Affiliate";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { emailOrPhone, password } = body;

    // Validate required fields
    if (!emailOrPhone || !password) {
      return NextResponse.json(
        { error: "Email/phone and password are required" },
        { status: 400 }
      );
    }

    // Find affiliate by email or phone number
    const affiliate = await Affiliate.findOne({
      $or: [
        { email: emailOrPhone.toLowerCase() },
        { phoneNumber: emailOrPhone },
      ],
    });

    if (!affiliate) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!affiliate.isActive) {
      return NextResponse.json(
        { error: "Your affiliate account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, affiliate.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return affiliate data (without password)
    const affiliateData = {
      id: affiliate._id,
      name: affiliate.name,
      email: affiliate.email,
      phoneNumber: affiliate.phoneNumber,
      affiliateCode: affiliate.affiliateCode,
      isActive: affiliate.isActive,
      earnings: affiliate.earnings,
      referrals: affiliate.referrals,
    };

    return NextResponse.json(
      { 
        message: "Sign in successful", 
        affiliate: affiliateData 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Affiliate signin error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
