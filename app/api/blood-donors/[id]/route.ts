import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BloodDonor from "@/models/BloodDonor";
import Division from "@/models/Division";
import District from "@/models/District";
import Thana from "@/models/Thana";

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

    // Resolve divisionBn, districtBn, and thanaBn translations on the fly dynamically
    const donorObj = bloodDonor.toObject();
    if (donorObj.division) {
      const div = await Division.findOne({ name: donorObj.division });
      if (div && div.nameBn) {
        donorObj.divisionBn = div.nameBn;
      }
    }
    if (donorObj.district) {
      const dist = await District.findOne({ name: donorObj.district });
      if (dist && dist.nameBn) {
        donorObj.districtBn = dist.nameBn;
      }
    }
    if (donorObj.thana) {
      const th = await Thana.findOne({ name: donorObj.thana });
      if (th && th.nameBn) {
        donorObj.thanaBn = th.nameBn;
      }
    }

    return NextResponse.json({ bloodDonor: donorObj }, { status: 200 });
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
      nameBn,
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
      userId,
    } = body;

    const { id } = await params;
    
    // Check if blood donor exists and verify ownership (if userId provided)
    const existingDonor = await BloodDonor.findById(id);
    if (!existingDonor) {
      return NextResponse.json(
        { error: "Blood donor not found" },
        { status: 404 }
      );
    }

    // If userId is provided, verify ownership (users can only edit their own profile)
    if (userId && existingDonor.userId && existingDonor.userId !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to edit this profile" },
        { status: 403 }
      );
    }

    const updateData: any = {
      name,
      nameBn: nameBn || undefined,
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
    
    // Only admin can change approval status
    if (isApproved !== undefined && !userId) {
      updateData.isApproved = isApproved;
    }

    const bloodDonor = await BloodDonor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

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
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Check if blood donor exists
    const bloodDonor = await BloodDonor.findById(id);
    if (!bloodDonor) {
      return NextResponse.json(
        { error: "Blood donor not found" },
        { status: 404 }
      );
    }

    // If userId is provided, verify ownership (users can only delete their own profile)
    if (userId && bloodDonor.userId && bloodDonor.userId !== userId) {
      return NextResponse.json(
        { error: "You don't have permission to delete this profile" },
        { status: 403 }
      );
    }

    await BloodDonor.findByIdAndDelete(id);

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

