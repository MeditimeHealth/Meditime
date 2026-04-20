import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AbandonedCart from "@/models/AbandonedCart";
import "@/models/Hospital";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const { userId, fullName, phoneNumber, email, tests, venueId, totalPrice } = body;

    if (!userId || !fullName || !phoneNumber) {
      return NextResponse.json(
        { error: "Missing required user information" },
        { status: 400 }
      );
    }

    // Upsert the abandoned cart for this user
    const updatedCart = await AbandonedCart.findOneAndUpdate(
      { userId: new mongoose.Types.ObjectId(userId) },
      {
        fullName,
        phoneNumber,
        email,
        tests,
        venueId: venueId ? new mongoose.Types.ObjectId(venueId) : undefined,
        totalPrice,
        // updatedAt is automatically updated by timestamps: true
      },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json(
      { message: "Abandoned cart recorded", cart: updatedCart },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error recording abandoned diagnostic cart:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await dbConnect();
    
    // Admin only logic could be added here if middleware is not handling it
    const carts = await AbandonedCart.find({})
      .populate('venueId', 'name address')
      .sort({ updatedAt: -1 });

    return NextResponse.json({ carts }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching abandoned carts:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
