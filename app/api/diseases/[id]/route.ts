import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Disease from "@/models/Disease";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { name, bangla } = body;

    if (!name || !bangla) {
      return NextResponse.json(
        { error: "Name and Bengali name are required" },
        { status: 400 }
      );
    }

    const disease = await Disease.findByIdAndUpdate(
      id,
      { name, bangla },
      { new: true, runValidators: true }
    );

    if (!disease) {
      return NextResponse.json(
        { error: "Disease not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Disease updated successfully", disease },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating disease:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Disease with this name already exists" },
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

    const disease = await Disease.findByIdAndDelete(id);

    if (!disease) {
      return NextResponse.json(
        { error: "Disease not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Disease deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting disease:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

