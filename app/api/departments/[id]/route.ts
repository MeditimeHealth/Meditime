import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Department from "@/models/Department";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const body = await request.json();
    const { name, image } = body;

    const { id } = await params;
    
    if (!name) {
      return NextResponse.json(
        { error: "Department name is required" },
        { status: 400 }
      );
    }
    
    const updateData: any = { name };
    if (image !== undefined) updateData.image = image;

    const department = await Department.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Department updated successfully", department },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating department:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Department name already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return NextResponse.json(
        { error: "Department not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Department deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

