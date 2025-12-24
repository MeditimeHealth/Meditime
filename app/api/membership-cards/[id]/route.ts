import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MembershipCard from "@/models/MembershipCard";

// GET single membership card
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const card = await MembershipCard.findById(id)
      .populate("membershipId", "name cardPackage")
      .populate("userId", "fullName phoneNumber");

    if (!card) {
      return NextResponse.json(
        { error: "Membership card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ card }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching membership card:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT update membership card
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const card = await MembershipCard.findById(id);
    if (!card) {
      return NextResponse.json(
        { error: "Membership card not found" },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedFields = [
      "name",
      "photo",
      "cardType",
      "expiryDate",
      "isActive",
      "phoneNumber",
      "email",
      "address",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        if (field === "expiryDate") {
          card[field] = new Date(body[field]);
        } else {
          card[field] = body[field];
        }
      }
    });

    await card.save();

    return NextResponse.json(
      { message: "Membership card updated successfully", card },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating membership card:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE membership card
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const card = await MembershipCard.findByIdAndDelete(id);
    if (!card) {
      return NextResponse.json(
        { error: "Membership card not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Membership card deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting membership card:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
