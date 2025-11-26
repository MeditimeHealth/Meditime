import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Affiliate from "@/models/Affiliate";
import bcrypt from "bcryptjs";

// Generate unique affiliate code
function generateAffiliateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const timestampPart = Date.now().toString().slice(-6);
  return `AFF-${randomPart}-${timestampPart}`;
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, email, phoneNumber, password, confirmPassword } = body;

    // Validate required fields
    if (!name || !email || !phoneNumber || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check if affiliate already exists
    const existingAffiliate = await Affiliate.findOne({
      $or: [
        { email: email.toLowerCase() },
        { phoneNumber },
      ],
    });

    if (existingAffiliate) {
      return NextResponse.json(
        { error: "An affiliate with this email or phone number already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique affiliate code
    let affiliateCode = generateAffiliateCode();
    
    // Ensure the code is unique
    let codeExists = await Affiliate.findOne({ affiliateCode });
    while (codeExists) {
      affiliateCode = generateAffiliateCode();
      codeExists = await Affiliate.findOne({ affiliateCode });
    }

    // Create affiliate
    const affiliate = await Affiliate.create({
      name,
      email: email.toLowerCase(),
      phoneNumber,
      password: hashedPassword,
      affiliateCode,
    });

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
        message: "Affiliate account created successfully", 
        affiliate: affiliateData 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Affiliate signup error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
