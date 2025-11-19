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
    } = body;

    const { id } = await params;
    const updateData: any = {
      name,
      phoneNumber,
      division: division || undefined,
      district: district || undefined,
      thana: thana || undefined,
      availabilityStatus,
      vehicleType,
    };
    
    if (isApproved !== undefined) {
      updateData.isApproved = isApproved;
    }

    const ambulance = await Ambulance.findByIdAndUpdate(
      id,
      updateData,
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
    const ambulance = await Ambulance.findByIdAndDelete(id);

    if (!ambulance) {
      return NextResponse.json(
        { error: "Ambulance not found" },
        { status: 404 }
      );
    }

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

