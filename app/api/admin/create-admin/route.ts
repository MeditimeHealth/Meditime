import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Static admin credentials
const ADMIN_CREDENTIALS = {
  phoneNumber: "admin123",
  password: "admin123",
  fullName: "Admin User",
  email: "admin@meditime.com",
  gender: "other" as const,
  age: 30,
  role: "admin" as const,
};

export async function POST() {
  try {
    await dbConnect();

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [
        { phoneNumber: ADMIN_CREDENTIALS.phoneNumber },
        { email: ADMIN_CREDENTIALS.email },
        { role: "admin" },
      ],
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          message: "Admin user already exists",
          credentials: {
            phoneNumber: existingAdmin.phoneNumber,
            email: existingAdmin.email,
            password: "Use existing password",
          },
        },
        { status: 200 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);

    // Create admin user
    const admin = await User.create({
      ...ADMIN_CREDENTIALS,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        credentials: {
          phoneNumber: ADMIN_CREDENTIALS.phoneNumber,
          password: ADMIN_CREDENTIALS.password,
          email: ADMIN_CREDENTIALS.email,
          fullName: ADMIN_CREDENTIALS.fullName,
          role: ADMIN_CREDENTIALS.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating admin user:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

