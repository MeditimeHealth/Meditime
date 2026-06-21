import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { phoneOrEmail, password } = body;

    if (!phoneOrEmail || !password) {
      return NextResponse.json(
        { error: "Phone number/email and password are required" },
        { status: 400 }
      );
    }

    let formattedPhone = phoneOrEmail;
    const cleanPhone = phoneOrEmail.replace(/\D/g, '');
    if (cleanPhone.length >= 10 && cleanPhone.length <= 13) {
      if (cleanPhone.length === 11 && cleanPhone.startsWith('01')) {
        formattedPhone = `+880${cleanPhone.slice(1)}`;
      } else if (cleanPhone.length === 13 && cleanPhone.startsWith('8801')) {
        formattedPhone = `+${cleanPhone}`;
      } else if (cleanPhone.length === 10 && cleanPhone.startsWith('1')) {
        formattedPhone = `+880${cleanPhone}`;
      }
    }

    // Find user by phone number, email, or username
    const user = await User.findOne({
      $or: [
        { phoneNumber: phoneOrEmail },
        { phoneNumber: formattedPhone },
        { email: phoneOrEmail.toLowerCase() },
        { username: phoneOrEmail.toLowerCase() },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

   

    // Check if affiliate account is active
    if (user.userType === 'affiliate' && user.isActive === false) {
      return NextResponse.json(
        { error: "Your affiliate account has been deactivated. Please contact support." },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Return user data (without password)
    const userData: any = {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      username: user.username,
      fullName: user.fullName,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      age: user.age,
      photo: user.photo,
      role: user.role || 'user',
      userType: user.userType || 'user',
      doctorId: user.doctorId,
    };

    // Add affiliate-specific data if user is an affiliate
    if (user.userType === 'affiliate') {
      userData.affiliateCode = user.affiliateCode;
      userData.isActive = user.isActive;
      userData.walletBalance = user.walletBalance || 0;
      userData.totalEarned = user.totalEarned || 0;
      userData.totalWithdrawn = user.totalWithdrawn || 0;
      userData.pendingCommissions = user.pendingCommissions || 0;
      userData.referrals = user.referrals || 0;
      userData.earnings = user.earnings || 0;
      userData.paymentMethod = user.paymentMethod;
      userData.paymentDetails = user.paymentDetails;
      userData.name = user.fullName; // For backward compatibility
    }

    // Generate JWT Token
    const token = await signToken({
      id: String(user._id),
      email: user.email || '',
      role: user.role || 'user',
      userType: user.userType || 'user'
    });

    const response = NextResponse.json(
      { 
        message: "Login successful", 
        user: userData,
        ...(user.userType === 'affiliate' && { affiliate: userData })
      },
      { status: 200 }
    );

    // Set secure HTTP-Only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 365 days for lifetime session
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
