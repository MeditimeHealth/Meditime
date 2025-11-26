import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
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
    const { email, phoneNumber, fullName, gender, bloodGroup, age, password, userType } = body;

    // Validate required fields based on user type
    if (userType === 'affiliate') {
      // For affiliates, only require phoneNumber, fullName, email, and password
      if (!phoneNumber || !fullName || !email || !password) {
        return NextResponse.json(
          { error: "Missing required fields for affiliate registration" },
          { status: 400 }
        );
      }
    } else {
      // For regular users, require all standard fields
      if (!phoneNumber || !fullName || !gender || !age || !password) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { phoneNumber },
        ...(email ? [{ email: email.toLowerCase() }] : []),
      ],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this phone number or email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Prepare user data
    let userData: any = {
      email: email ? email.toLowerCase() : undefined,
      phoneNumber,
      fullName,
      password: hashedPassword,
    };

    // Handle affiliate registration
    if (userType === 'affiliate') {
      // Generate unique affiliate code
      let affiliateCode = generateAffiliateCode();
      
      // Ensure the code is unique
      let codeExists = await User.findOne({ affiliateCode });
      while (codeExists) {
        affiliateCode = generateAffiliateCode();
        codeExists = await User.findOne({ affiliateCode });
      }

      userData = {
        ...userData,
        userType: 'affiliate',
        role: 'affiliate',
        affiliateCode,
        isActive: true,
        walletBalance: 0,
        totalEarned: 0,
        totalWithdrawn: 0,
        pendingCommissions: 0,
        referrals: 0,
        earnings: 0,
      };
    } else {
      // Regular user registration
      userData = {
        ...userData,
        gender,
        bloodGroup: bloodGroup || undefined,
        age,
        userType: userType || 'user',
        role: userType === 'bloodDonor' ? 'bloodDonor' : userType === 'ambulance' ? 'ambulance' : 'user',
      };
    }

    // Create user
    const user = await User.create(userData);

    // Return user data (without password)
    const responseData: any = {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      fullName: user.fullName,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      age: user.age,
      photo: user.photo,
      userType: user.userType,
      role: user.role,
    };

    // Add affiliate-specific data if applicable
    if (userType === 'affiliate') {
      responseData.affiliateCode = user.affiliateCode;
      responseData.isActive = user.isActive;
      responseData.walletBalance = user.walletBalance;
      responseData.totalEarned = user.totalEarned;
      responseData.totalWithdrawn = user.totalWithdrawn;
      responseData.pendingCommissions = user.pendingCommissions;
      responseData.referrals = user.referrals;
      responseData.earnings = user.earnings;
      responseData.name = user.fullName; // For backward compatibility
    }

    return NextResponse.json(
      { 
        message: userType === 'affiliate' ? "Affiliate account created successfully" : "User created successfully", 
        user: responseData,
        ...(userType === 'affiliate' && { affiliate: responseData })
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
