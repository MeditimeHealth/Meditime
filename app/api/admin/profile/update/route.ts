import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";
import bcrypt from "bcryptjs";
import { verifyAdmin } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const session = await verifyAdmin(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { email, username, currentPassword, newPassword } = body;

    const admin = await Admin.findById(session.id);
    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Verify current password if any sensitive changes or password change
    if (newPassword || email !== admin.email || username !== admin.username) {
      if (!currentPassword) {
        return NextResponse.json({ error: "Current password is required to update credentials" }, { status: 400 });
      }
      const isPasswordValid = await bcrypt.compare(currentPassword, admin.password);
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid current password" }, { status: 401 });
      }
    }

    // Update fields
    if (email) admin.email = email.toLowerCase();
    if (username) admin.username = username.toLowerCase();
    if (newPassword) {
      admin.password = await bcrypt.hash(newPassword, 10);
    }

    await admin.save();

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: admin._id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      }
    });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
