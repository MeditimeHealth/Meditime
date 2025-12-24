import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MembershipCard from "@/models/MembershipCard";

// GET all membership cards
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const cardType = searchParams.get("cardType");
    const isActive = searchParams.get("isActive");
    const search = searchParams.get("search");

    // Build query
    const query: any = {};
    
    if (cardType && cardType !== "all") {
      query.cardType = cardType;
    }
    
    if (isActive !== null && isActive !== "all") {
      query.isActive = isActive === "true";
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { serialNumber: { $regex: search, $options: "i" } },
        { phoneNumber: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const cards = await MembershipCard.find(query)
      .sort({ createdAt: -1 })
      .populate("membershipId", "name cardPackage")
      .populate("userId", "fullName phoneNumber");

    return NextResponse.json({ cards }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching membership cards:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST create new membership card
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { name, photo, cardType, expiryDate, phoneNumber, email, address, notes, membershipId, userId, serialNumber } = body;

    // Validate required fields
    if (!name || !cardType || !expiryDate) {
      return NextResponse.json(
        { error: "Name, card type, and expiry date are required" },
        { status: 400 }
      );
    }

    // Create the card
    const cardData: any = {
      name,
      photo,
      cardType,
      expiryDate: new Date(expiryDate),
      phoneNumber,
      email,
      address,
      notes,
      isActive: true,
    };

    // If custom serial number provided, use it
    if (serialNumber) {
      // Check if serial number already exists
      const existingCard = await MembershipCard.findOne({ serialNumber });
      if (existingCard) {
        return NextResponse.json(
          { error: "Serial number already exists" },
          { status: 400 }
        );
      }
      cardData.serialNumber = serialNumber;
    }

    if (membershipId) {
      cardData.membershipId = membershipId;
    }

    if (userId) {
      cardData.userId = userId;
    }

    const card = await MembershipCard.create(cardData);

    return NextResponse.json(
      { message: "Membership card created successfully", card },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating membership card:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
