import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Membership from "@/models/Membership";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { val_id, tran_id, status, value_a } = body;

    // value_a contains the membership ID
    const membershipId = value_a;

    if (!membershipId) {
      return NextResponse.json(
        { error: "Membership ID not found" },
        { status: 400 }
      );
    }

    const membership = await Membership.findById(membershipId);

    if (!membership) {
      return NextResponse.json(
        { error: "Membership not found" },
        { status: 404 }
      );
    }

    // Update payment status based on SSLCommerz response
    if (status === "VALID" || status === "VALIDATED") {
      membership.paymentStatus = "paid";
      membership.status = "processing";
      membership.paymentDetails = body;
    } else if (status === "FAILED") {
      membership.paymentStatus = "failed";
    } else if (status === "CANCELLED") {
      membership.paymentStatus = "cancelled";
    }

    await membership.save();

    return NextResponse.json({
      success: true,
      message: "Payment status updated",
    });
  } catch (error) {
    console.error("Error processing IPN:", error);
    return NextResponse.json(
      { error: "Failed to process IPN" },
      { status: 500 }
    );
  }
}
