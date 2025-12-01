import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import AffiliateRequest from "@/models/AffiliateRequest";
import AffiliateCommission from "@/models/AffiliateCommission";
import User from "@/models/User";
import Affiliate from "@/models/Affiliate";

// POST - Approve request and add commission to wallet
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { requestId, commissionAmount } = body;

    if (!requestId || !commissionAmount) {
      return NextResponse.json(
        { error: "Request ID and commission amount are required" },
        { status: 400 }
      );
    }

    const amount = parseFloat(commissionAmount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Commission amount must be a positive number" },
        { status: 400 }
      );
    }

    // Find the request
    const affiliateRequest = await AffiliateRequest.findById(requestId);
    if (!affiliateRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    if (affiliateRequest.status !== 'pending') {
      return NextResponse.json(
        { error: "Request is not pending" },
        { status: 400 }
      );
    }

    // Find affiliate - check both User model (new) and Affiliate model (legacy)
    let affiliate = await User.findById(affiliateRequest.affiliateId);
    if (!affiliate) {
      affiliate = await Affiliate.findById(affiliateRequest.affiliateId);
    }

    if (!affiliate) {
      return NextResponse.json(
        { error: "Affiliate not found" },
        { status: 404 }
      );
    }

    // Update request status and commission amount
    affiliateRequest.status = 'approved';
    affiliateRequest.commissionAmount = amount;
    await affiliateRequest.save();

    // Create commission record if appointmentId exists
    if (affiliateRequest.appointmentId) {
      // Check if commission already exists for this appointment
      const existingCommission = await AffiliateCommission.findOne({
        appointmentId: affiliateRequest.appointmentId,
      });

      if (!existingCommission) {
        await AffiliateCommission.create({
          appointmentId: affiliateRequest.appointmentId,
          affiliateId: affiliate._id,
          totalBill: 0, // Not available from request
          commissionType: 'flat',
          commissionValue: amount,
          commissionAmount: amount,
          status: 'approved',
          approvedAt: new Date(),
        });
      }
    }

    // Update affiliate wallet
    const currentBalance = affiliate.walletBalance || 0;
    const totalEarned = (affiliate.totalEarned || 0) + amount;
    const pendingCommissions = Math.max(0, (affiliate.pendingCommissions || 0) - amount);

    affiliate.walletBalance = currentBalance + amount;
    affiliate.totalEarned = totalEarned;
    affiliate.pendingCommissions = pendingCommissions;
    await affiliate.save();

    return NextResponse.json({
      message: "Request approved and commission added successfully",
      request: affiliateRequest,
      wallet: {
        balance: affiliate.walletBalance,
        totalEarned: affiliate.totalEarned,
      },
    });

  } catch (error: any) {
    console.error("Error approving request:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
