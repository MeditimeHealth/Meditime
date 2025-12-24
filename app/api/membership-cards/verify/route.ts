import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MembershipCard from "@/models/MembershipCard";

// POST verify membership card by serial number
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { serialNumber } = body;

    if (!serialNumber) {
      return NextResponse.json(
        { error: "Serial number is required" },
        { status: 400 }
      );
    }

    // Find card by serial number (case-insensitive)
    const card = await MembershipCard.findOne({
      serialNumber: { $regex: new RegExp(`^${serialNumber}$`, "i") },
    });

    if (!card) {
      return NextResponse.json(
        { error: "Card not found", valid: false },
        { status: 404 }
      );
    }

    // Check if card is expired
    const now = new Date();
    const isExpired = new Date(card.expiryDate) < now;

    // Return card details for public display
    return NextResponse.json(
      {
        valid: true,
        card: {
          serialNumber: card.serialNumber,
          name: card.name,
          photo: card.photo,
          cardType: card.cardType,
          expiryDate: card.expiryDate,
          isActive: card.isActive,
          isExpired: isExpired,
          status: !card.isActive ? "Deactivated" : isExpired ? "Expired" : "Active",
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error verifying membership card:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
