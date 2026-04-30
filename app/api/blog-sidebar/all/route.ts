import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogSidebarPhoto from "@/models/BlogSidebarPhoto";

// GET - Fetch all sidebar photos (Admin only - includes inactive)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const Admin = (await import("@/models/Admin")).default;
    
    // Get userId from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Verify admin access
    if (userId) {
      const admin = await Admin.findById(userId);
      if (!admin || (admin.role !== "admin" && admin.role !== "superadmin")) {
        return NextResponse.json(
          { error: "Forbidden - Admin access required" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Unauthorized - User ID required" },
        { status: 401 }
      );
    }
    
    // Fetch all photos (including inactive) for admin
    const photos = await BlogSidebarPhoto.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({ photos }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching all sidebar photos:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

