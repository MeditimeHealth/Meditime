import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { phoneOrEmail, password, userType } = body;

    if (!phoneOrEmail || !password) {
      return NextResponse.json(
        { error: "Phone number/email and password are required" },
        { status: 400 }
      );
    }

    // Find user by phone number, email, or username
    const user = await User.findOne({
      $or: [
        { phoneNumber: phoneOrEmail },
        { email: phoneOrEmail },
        { username: phoneOrEmail.toLowerCase() },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check user type if provided
    if (userType && user.userType !== userType) {
      return NextResponse.json(
        { error: `Invalid user type. Please sign in as ${user.userType === 'bloodDonor' ? 'Blood Donor' : user.userType === 'ambulance' ? 'Ambulance' : 'User'}` },
        { status: 401 }
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
    const userData = {
      id: user._id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      username: user.username,
      fullName: user.fullName,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      age: user.age,
      role: user.role || 'user',
      userType: user.userType || 'user',
    };

    return NextResponse.json(
      { message: "Login successful", user: userData },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
