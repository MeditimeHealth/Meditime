import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogSidebarPhoto from "@/models/BlogSidebarPhoto";

// GET - Fetch all active sidebar photos
export async function GET() {
  try {
    await dbConnect();
    
    const photos = await BlogSidebarPhoto.find({ isActive: true })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    
    return NextResponse.json({ photos }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching sidebar photos:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch photos" },
      { status: 500 }
    );
  }
}

// POST - Create new sidebar photo (Admin only)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const Admin = (await import("@/models/Admin")).default;
    
    const body = await request.json();
    const { imageUrl, linkUrl, title, order, userId } = body;

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

    if (!imageUrl || !linkUrl) {
      return NextResponse.json(
        { error: "Image URL and Link URL are required" },
        { status: 400 }
      );
    }

    // Get the highest order number
    const maxOrder = await BlogSidebarPhoto.findOne()
      .sort({ order: -1 })
      .select("order")
      .lean();
    
    const newOrder = order !== undefined ? order : ((maxOrder && !Array.isArray(maxOrder) && maxOrder.order) ? maxOrder.order : 0) + 1;

    const photo = await BlogSidebarPhoto.create({
      imageUrl,
      linkUrl,
      title: title || "",
      order: newOrder,
      isActive: true,
    });

    return NextResponse.json(
      { message: "Photo created successfully", photo },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating sidebar photo:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create photo" },
      { status: 500 }
    );
  }
}

