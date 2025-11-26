import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Ambulance from "@/models/Ambulance";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const ambulance = await Ambulance.findById(id);

    if (!ambulance) {
      return NextResponse.json(
        { error: "Ambulance not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ ambulance }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching ambulance:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      name,
      phoneNumber,
      division,
      district,
      thana,
      availabilityStatus,
      vehicleType,
      isApproved,
      userId,
    } = body;

    const { id } = await params;
    
    // Check if ambulance exists and verify ownership (if userId provided)
    const existingAmbulance = await Ambulance.findById(id);
    if (!existingAmbulance) {
      return NextResponse.json(
        { error: "Ambulance not found" },
        { status: 404 }
      );
    }

    // If userId is provided, verify ownership (users can only edit their own profile)
    if (userId && existingAmbulance.userId && existingAmbulance.userId !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to edit this profile" },
        { status: 403 }
      );
    }

    const updateData: any = {
      name,
      phoneNumber,
      division: division || undefined,
      district: district || undefined,
      thana: thana || undefined,
      availabilityStatus,
      vehicleType,
    };
    
    // Only admin can change approval status
    if (isApproved !== undefined && !userId) {
      updateData.isApproved = isApproved;
    }

    const ambulance = await Ambulance.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    return NextResponse.json(
      { message: "Ambulance updated successfully", ambulance },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating ambulance:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const body = await request.json();
    const { id } = await params;
    
    const ambulance = await Ambulance.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!ambulance) {
      return NextResponse.json(
        { error: "Ambulance not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Ambulance updated successfully", ambulance },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating ambulance:", error);
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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Check if ambulance exists
    const ambulance = await Ambulance.findById(id);
    if (!ambulance) {
      return NextResponse.json(
        { error: "Ambulance not found" },
        { status: 404 }
      );
    }

    // If userId is provided, verify ownership (users can only delete their own profile)
    if (userId && ambulance.userId && ambulance.userId !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this profile" },
        { status: 403 }
      );
    }

    await Ambulance.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Ambulance deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting ambulance:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

