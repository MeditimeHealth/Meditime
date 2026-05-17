import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Doctor from "@/models/Doctor";
import bcrypt from "bcryptjs";

// PUT - Update doctor profile (username, password, and doctor details)
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { 
      username, 
      password, 
      userId,
      // Doctor details
      hospital,
      specialty,
      qualification,


      reportShowFee,
      newPatientFee,
      division,
      district,
      thana,

      department,
      bio,
      image,

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

    if (user.role !== 'doctor') {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Update username if provided
    if (username && username !== user.username) {
      // Check if username is already taken
      const existingUser = await User.findOne({ 
        username: username.toLowerCase(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return NextResponse.json(
          { error: "Username already taken" },
          { status: 400 }
        );
      }
      
      user.username = username.toLowerCase();
    }

    // Update password if provided
    if (password && password.length > 0) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    // Update Doctor details if phone number exists
    if (user.phoneNumber) {
      const doctor = await Doctor.findOne({ phoneNumber: user.phoneNumber });
      
      if (doctor) {
        if (hospital !== undefined) doctor.hospital = hospital;
        if (specialty !== undefined) doctor.specialty = specialty;
        if (qualification !== undefined) doctor.qualification = qualification;


        if (reportShowFee !== undefined) doctor.reportShowFee = reportShowFee;
        if (newPatientFee !== undefined) doctor.newPatientFee = newPatientFee;
        if (division !== undefined) doctor.division = division;
        if (district !== undefined) doctor.district = district;
        if (thana !== undefined) doctor.thana = thana;

        if (department !== undefined) doctor.department = department;
        if (bio !== undefined) doctor.bio = bio;
        if (image !== undefined) doctor.image = image;

        
        await doctor.save();
      }
    }

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
      role: user.role || 'doctor',
    };

    return NextResponse.json(
      { message: "Profile updated successfully", user: userData },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

