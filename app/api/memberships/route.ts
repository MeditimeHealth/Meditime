import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Membership from "@/models/Membership";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      name,
      mobileNumber,
      cardPackage,
      membersCovered,
      deliveryAddress,
      company,
      companyIdNumber,
    } = body;

    // Validate required fields
    if (!name || !mobileNumber || !cardPackage || !deliveryAddress) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate corporate fields
    if (cardPackage === "corporate" && (!company || !companyIdNumber)) {
      return NextResponse.json(
        { error: "Company name and ID are required for corporate membership" },
        { status: 400 }
      );
    }

    // Calculate membership price based on package
    const getMembershipPrice = (packageType: string) => {
      switch (packageType) {
        case "silver":
          return 1000;
        case "gold":
          return 2500;
        case "platinum":
          return 5000;
        case "corporate":
          return 0; // Custom pricing
        default:
          return 0;
      }
    };

    const membershipPrice = getMembershipPrice(cardPackage);
    const cardFee = 500;
    const deliveryCharge = 150;
    const totalAmount = membershipPrice + cardFee + deliveryCharge;

    // Create membership application
    const membership = await Membership.create({
      name,
      mobileNumber,
      cardPackage,
      membersCovered,
      deliveryAddress,
      company: cardPackage === "corporate" ? company : undefined,
      companyIdNumber: cardPackage === "corporate" ? companyIdNumber : undefined,
      membershipPrice,
      cardFee,
      deliveryCharge,
      totalAmount,
      paymentStatus: cardPackage === "corporate" ? "pending" : "pending",
      status: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Membership application created successfully",
        membershipId: membership._id,
        totalAmount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating membership:", error);
    return NextResponse.json(
      { error: "Failed to create membership application" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const membership = await Membership.findById(id);
      if (!membership) {
        return NextResponse.json(
          { error: "Membership not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ membership });
    }

    // Get all memberships with pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const status = searchParams.get("status");
    const paymentStatus = searchParams.get("paymentStatus");

    const filter: any = {};
    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    const memberships = await Membership.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Membership.countDocuments(filter);

    return NextResponse.json({
      memberships,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching memberships:", error);
    return NextResponse.json(
      { error: "Failed to fetch memberships" },
      { status: 500 }
    );
  }
}
