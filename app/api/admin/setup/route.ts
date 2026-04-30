import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await dbConnect();

    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return NextResponse.json(
        { message: "Admin already exists. This setup route is disabled." },
        { status: 403 }
      );
    }

    // Default admin credentials
    const defaultAdmin = {
      username: "admin",
      email: "admin@meditime.com",
      password: "adminpassword123",
      role: "superadmin",
    };

    const hashedPassword = await bcrypt.hash(defaultAdmin.password, 10);

    const admin = await Admin.findOneAndUpdate(
      { email: defaultAdmin.email },
      { 
        $set: {
          ...defaultAdmin,
          password: hashedPassword,
        }
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({
      message: "Initial admin created successfully",
      credentials: {
        username: defaultAdmin.username,
        password: defaultAdmin.password,
        email: defaultAdmin.email,
        role: defaultAdmin.role,
      },
      note: "PLEASE DELETE THIS ROUTE AFTER USE FOR SECURITY."
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
