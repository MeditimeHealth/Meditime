import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AffiliateRequest from "@/models/AffiliateRequest";

// POST - Create a new affiliate request
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { affiliateId, patientName, patientPhone, doctorName, hospitalName, proofPhoto, proofPhotos, appointmentId } = body;

    if (!affiliateId || !patientName || !patientPhone || !doctorName || !hospitalName) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const newRequest = await AffiliateRequest.create({
      affiliateId,
      patientName,
      patientPhone,
      doctorName,
      hospitalName,
      proofPhoto: proofPhoto || undefined, // Keep for backward compatibility
      proofPhotos: proofPhotos || (proofPhoto ? [proofPhoto] : []),
      appointmentId: appointmentId || undefined,
    });

    return NextResponse.json({
      message: "Request submitted successfully",
      request: newRequest,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating affiliate request:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get requests for a specific affiliate
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const affiliateId = searchParams.get('affiliateId');

    if (!affiliateId) {
      return NextResponse.json(
        { error: "Affiliate ID is required" },
        { status: 400 }
      );
    }

    const requests = await AffiliateRequest.find({ affiliateId }).sort({ createdAt: -1 });

    return NextResponse.json({ requests });

  } catch (error: any) {
    console.error("Error fetching affiliate requests:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
