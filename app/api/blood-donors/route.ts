import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import BloodDonor from "@/models/BloodDonor";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const bloodGroup = searchParams.get("bloodGroup");
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const thana = searchParams.get("thana");
    const availabilityStatus = searchParams.get("availabilityStatus");

    let query: any = {};
    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }
    if (division) {
      query.division = division;
    }
    if (district) {
      query.district = district;
    }
    if (thana) {
      query.thana = thana;
    }
    if (availabilityStatus) {
      query.availabilityStatus = availabilityStatus;
    }
    
    // Handle approval status filtering
    const isAdmin = searchParams.get("admin") === "true";
    const isApprovedParam = searchParams.get("isApproved");

    if (isApprovedParam !== null) {
      query.isApproved = isApprovedParam === "true";
    } else if (!isAdmin) {
      // Default for public is only approved
      query.isApproved = true;
    }

    const bloodDonors = await BloodDonor.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ bloodDonors }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching blood donors:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
      userId,
      isApproved,
    } = body;

    // Validate required fields
    if (!name || !phoneNumber || !bloodGroup || !availabilityStatus) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create blood donor
    const bloodDonor = await BloodDonor.create({
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
      userId: userId || undefined,
      isApproved: false, // Applications are pending by default
    });

    return NextResponse.json(
      { message: "Blood donor created successfully", bloodDonor },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating blood donor:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

