import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BloodDonor from "@/models/BloodDonor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const bloodDonor = await BloodDonor.findById(id);

    if (!bloodDonor) {
      return NextResponse.json(
        { error: "Blood donor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ bloodDonor }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching blood donor:", error);
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
      email,
      bloodGroup,
      division,
      district,
      thana,
      photo,
      availabilityStatus,
      lastDonationDate,
      isApproved,
    } = body;

    const { id } = await params;
    const updateData: any = {
      name,
      phoneNumber,
      email: email || undefined,
      bloodGroup,
      division: division || undefined,
      district: district || undefined,
      thana: thana || undefined,
      photo: photo || undefined,
      availabilityStatus,
      lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : undefined,
    };
    
    if (isApproved !== undefined) {
      updateData.isApproved = isApproved;
    }

    const bloodDonor = await BloodDonor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!bloodDonor) {
      return NextResponse.json(
        { error: "Blood donor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Blood donor updated successfully", bloodDonor },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating blood donor:", error);
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
    
    const bloodDonor = await BloodDonor.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );

    if (!bloodDonor) {
      return NextResponse.json(
        { error: "Blood donor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Blood donor updated successfully", bloodDonor },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating blood donor:", error);
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
    const bloodDonor = await BloodDonor.findByIdAndDelete(id);

    if (!bloodDonor) {
      return NextResponse.json(
        { error: "Blood donor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Blood donor deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting blood donor:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

