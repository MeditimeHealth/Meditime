import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import ServiceSection from "@/models/ServiceSection";

// GET - Fetch a single service section by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const { id } = await params;
    const section = await ServiceSection.findById(id).lean();
    
    if (!section) {
      return NextResponse.json(
        { error: "Service section not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ section }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching service section:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch service section" },
      { status: 500 }
    );
  }
}

// PUT - Update service section (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const User = (await import("@/models/User")).default;
    
    const body = await request.json();
    const { title, description, slug, order, isActive, userId } = body;

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

    const { id } = await params;
    const section = await ServiceSection.findById(id);
    if (!section) {
      return NextResponse.json(
        { error: "Service section not found" },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if it already exists
    if (slug && slug !== section.slug) {
      const existingSection = await ServiceSection.findOne({ slug });
      if (existingSection) {
        return NextResponse.json(
          { error: "A service section with this slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update fields
    if (title !== undefined) section.title = title;
    if (description !== undefined) section.description = description;
    if (slug !== undefined) section.slug = slug;
    if (order !== undefined) section.order = order;
    if (isActive !== undefined) section.isActive = isActive;

    await section.save();

    return NextResponse.json(
      { message: "Service section updated successfully", section },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating service section:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update service section" },
      { status: 500 }
    );
  }
}

// DELETE - Delete service section (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const User = (await import("@/models/User")).default;
    
    const body = await request.json();
    const { userId } = body;

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

    const { id } = await params;
    const section = await ServiceSection.findByIdAndDelete(id);
    
    if (!section) {
      return NextResponse.json(
        { error: "Service section not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Service section deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting service section:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete service section" },
      { status: 500 }
    );
  }
}

