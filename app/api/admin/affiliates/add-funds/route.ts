import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Affiliate from "@/models/Affiliate";

// POST - Add funds to affiliate wallet
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { affiliateId, amount, notes } = body;

    if (!affiliateId || !amount) {
      return NextResponse.json(
        { error: "Affiliate ID and amount are required" },
        { status: 400 }
      );
    }

    const addAmount = parseFloat(amount);
    if (isNaN(addAmount) || addAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be a positive number" },
        { status: 400 }
      );
    }

    // Find affiliate - check both User model (new) and Affiliate model (legacy)
    let affiliate = await User.findById(affiliateId);
    let isUserModel = true;
    
    if (!affiliate) {
      affiliate = await Affiliate.findById(affiliateId);
      isUserModel = false;
    }

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Update wallet balance and total earned
    const currentBalance = affiliate.walletBalance || 0;
    const currentTotalEarned = affiliate.totalEarned || 0;

    affiliate.walletBalance = currentBalance + addAmount;
    affiliate.totalEarned = currentTotalEarned + addAmount;
    await affiliate.save();

    const displayName =
      (affiliate as any).fullName ||
      (affiliate as any).name ||
      "";

    return NextResponse.json({
      message: "Funds added successfully",
      wallet: {
        previousBalance: currentBalance,
        newBalance: affiliate.walletBalance,
        amountAdded: addAmount,
        totalEarned: affiliate.totalEarned,
      },
      affiliate: {
        _id: affiliate._id,
        name: displayName,
        affiliateCode: (affiliate as any).affiliateCode,
      },
    });

  } catch (error: any) {
    console.error("Error adding funds:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
