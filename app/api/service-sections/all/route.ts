import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServiceSection from "@/models/ServiceSection";
import User from "@/models/User";

// GET - Fetch all service sections (including inactive) - Admin only
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Verify admin access
    if (userId) {
      const user = await User.findById(userId);
      if (!user || user.role !== "admin") {
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
    
    const sections = await ServiceSection.find()
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({ sections }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching service sections:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch service sections" },
      { status: 500 }
    );
  }
}

