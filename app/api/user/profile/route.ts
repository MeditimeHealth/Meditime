import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      fullName, 
      email, 
      phoneNumber, 
      gender, 
      bloodGroup, 
      age, 
      password, 
      photo,
      userId 
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Update fullName if provided
    if (fullName && fullName.trim() !== '') {
      user.fullName = fullName.trim();
    }

    // Update email if provided
    if (email !== undefined) {
      if (email === '' || email === null) {
        user.email = undefined;
      } else {
        // Check if email is already taken by another user
        const existingUser = await User.findOne({ 
          email: email.toLowerCase().trim(),
          _id: { $ne: userId }
        });
        
        if (existingUser) {
          return NextResponse.json(
            { error: "Email already taken by another user" },
            { status: 400 }
          );
        }
        
        user.email = email.toLowerCase().trim();
      }
    }

    // Update phoneNumber if provided
    if (phoneNumber && phoneNumber.trim() !== '') {
      // Check if phone number is already taken by another user
      const existingUser = await User.findOne({ 
        phoneNumber: phoneNumber.trim(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: "Phone number already taken by another user" },
          { status: 400 }
        );
      }
      
      user.phoneNumber = phoneNumber.trim();
    }

    // Update gender if provided
    if (gender && ['male', 'female', 'other'].includes(gender)) {
      user.gender = gender;
    }

    // Update bloodGroup if provided
    if (bloodGroup !== undefined) {
      user.bloodGroup = bloodGroup === '' ? undefined : bloodGroup;
    }

    // Update age if provided
    if (age !== undefined && age > 0) {
      user.age = age;
    }

    // Update photo if provided
    if (photo !== undefined) {
      user.photo = photo === '' ? undefined : photo;
    }

    // Update password if provided
    if (password && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    // Return updated user (without password)
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
    
    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        { error: `${field} is already taken` },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

