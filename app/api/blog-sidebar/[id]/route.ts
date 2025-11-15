import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BlogSidebarPhoto from "@/models/BlogSidebarPhoto";

// DELETE - Delete sidebar photo (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const User = (await import("@/models/User")).default;
    
    const body = await request.json().catch(() => ({}));
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
    const photo = await BlogSidebarPhoto.findByIdAndDelete(id);

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Photo deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting sidebar photo:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete photo" },
      { status: 500 }
    );
  }
}

// PUT - Update sidebar photo (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const User = (await import("@/models/User")).default;
    
    const body = await request.json();
    const { imageUrl, linkUrl, title, order, isActive, userId } = body;

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

    const photo = await BlogSidebarPhoto.findByIdAndUpdate(
      id,
      {
        ...(imageUrl && { imageUrl }),
        ...(linkUrl && { linkUrl }),
        ...(title !== undefined && { title }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true, runValidators: true }
    );

    if (!photo) {
      return NextResponse.json(
        { error: "Photo not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Photo updated successfully", photo },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating sidebar photo:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update photo" },
      { status: 500 }
    );
  }
}

