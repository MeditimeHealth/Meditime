import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.id).select("-password -__v");
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    console.error("Fetch profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(session.id);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { 
      fullName, 
      phoneNumber, 
      gender, 
      bloodGroup, 
      age, 
      password,
      currentPassword,
      photo
    } = body;

    // Handle Password Update Security
    if (password && password.length > 0) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change password." },
          { status: 400 }
        );
      }
      
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Incorrect current password." },
          { status: 400 }
        );
      }
      
      if (password.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }
      user.password = await bcrypt.hash(password, 10);
    }

    // Update fields
    if (fullName && fullName.trim() !== '') user.fullName = fullName.trim();
    
    if (phoneNumber && phoneNumber.trim() !== '' && phoneNumber !== user.phoneNumber) {
      const existingPhone = await User.findOne({ phoneNumber: phoneNumber.trim(), _id: { $ne: user._id } });
      if (existingPhone) {
        return NextResponse.json({ error: "Phone number already taken" }, { status: 400 });
      }
      user.phoneNumber = phoneNumber.trim();
    }

    if (gender && ['male', 'female', 'other'].includes(gender)) user.gender = gender;
    if (bloodGroup !== undefined) user.bloodGroup = bloodGroup === '' ? undefined : bloodGroup;
    if (age !== undefined && age > 0) user.age = age;
    if (photo !== undefined) user.photo = photo === '' ? undefined : photo;

    await user.save();

    const userData = {
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
    };

    return NextResponse.json(
      { message: "Profile updated successfully", user: userData },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating profile:", error);
    if (error.code === 11000) {
      return NextResponse.json({ error: `Value is already taken` }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
