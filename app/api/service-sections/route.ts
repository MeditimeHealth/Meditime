import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServiceSection from "@/models/ServiceSection";

// GET - Fetch all active service sections
export async function GET() {
  try {
    await dbConnect();
    
    const sections = await ServiceSection.find({ isActive: true })
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

// POST - Create new service section (Admin only)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const Admin = (await import("@/models/Admin")).default;
    
    const body = await request.json();
    const { title, description, slug, order, userId } = body;

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

    if (!title || !description || !slug) {
      return NextResponse.json(
        { error: "Title, description, and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingSection = await ServiceSection.findOne({ slug });
    if (existingSection) {
      return NextResponse.json(
        { error: "A service section with this slug already exists" },
        { status: 400 }
      );
    }

    // Get the highest order number
    const maxOrder = await ServiceSection.findOne()
      .sort({ order: -1 })
      .select("order")
      .lean();
    
    const newOrder = order !== undefined ? order : ((maxOrder && !Array.isArray(maxOrder) && maxOrder.order) ? maxOrder.order : 0) + 1;

    const section = await ServiceSection.create({
      title,
      description,
      slug,
      order: newOrder,
      isActive: true,
    });

    return NextResponse.json(
      { message: "Service section created successfully", section },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating service section:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create service section" },
      { status: 500 }
    );
  }
}

