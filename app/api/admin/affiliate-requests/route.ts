import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AffiliateRequest from "@/models/AffiliateRequest";
import User from "@/models/User"; // To populate affiliate details if needed

// GET - Get all affiliate requests (for admin)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const requests = await AffiliateRequest.find({})
      .populate('affiliateId', 'fullName email phoneNumber affiliateCode paymentMethod paymentDetails')
      .sort({ createdAt: -1 });

    return NextResponse.json({ requests });

  } catch (error: any) {
    console.error("Error fetching affiliate requests:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update request status
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { requestId, status } = body;

    if (!requestId || !status) {
      return NextResponse.json(
        { error: "Request ID and status are required" },
        { status: 400 }
      );
    }

    const updatedRequest = await AffiliateRequest.findByIdAndUpdate(
      requestId,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Request status updated",
      request: updatedRequest,
    });

  } catch (error: any) {
    console.error("Error updating request status:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
