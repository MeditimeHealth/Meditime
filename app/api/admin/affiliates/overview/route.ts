import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Affiliate from "@/models/Affiliate";

// GET - Get all affiliates with their balances
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get affiliates from both User model (new) and Affiliate model (legacy)
    const userAffiliates = await User.find({ userType: 'affiliate' })
      .select('fullName email phoneNumber affiliateCode walletBalance totalEarned totalWithdrawn pendingCommissions referrals isActive')
      .lean();

    const legacyAffiliates = await Affiliate.find({})
      .select('name email phoneNumber affiliateCode walletBalance totalEarned totalWithdrawn pendingCommissions referrals isActive')
      .lean();

    // Combine and format affiliates
    const allAffiliates = [
      ...userAffiliates.map((aff: any) => ({
        _id: aff._id.toString(),
        fullName: aff.fullName,
        email: aff.email,
        phoneNumber: aff.phoneNumber,
        affiliateCode: aff.affiliateCode,
        walletBalance: aff.walletBalance || 0,
        totalEarned: aff.totalEarned || 0,
        totalWithdrawn: aff.totalWithdrawn || 0,
        pendingCommissions: aff.pendingCommissions || 0,
        referrals: aff.referrals || 0,
        isActive: aff.isActive !== false,
      })),
      ...legacyAffiliates.map((aff: any) => ({
        _id: aff._id.toString(),
        name: aff.name,
        email: aff.email,
        phoneNumber: aff.phoneNumber,
        affiliateCode: aff.affiliateCode,
        walletBalance: aff.walletBalance || 0,
        totalEarned: aff.totalEarned || 0,
        totalWithdrawn: aff.totalWithdrawn || 0,
        pendingCommissions: aff.pendingCommissions || 0,
        referrals: aff.referrals || 0,
        isActive: aff.isActive !== false,
      })),
    ];

    // Calculate stats
    const stats = {
      totalAffiliates: allAffiliates.length,
      activeAffiliates: allAffiliates.filter((a) => a.isActive).length,
      totalBalance: allAffiliates.reduce((sum, a) => sum + (a.walletBalance || 0), 0),
      totalEarned: allAffiliates.reduce((sum, a) => sum + (a.totalEarned || 0), 0),
      totalPending: allAffiliates.reduce((sum, a) => sum + (a.pendingCommissions || 0), 0),
    };

    // Sort by balance (descending)
    allAffiliates.sort((a, b) => (b.walletBalance || 0) - (a.walletBalance || 0));

    return NextResponse.json({
      affiliates: allAffiliates,
      stats,
    });

  } catch (error: any) {
    console.error("Error fetching affiliates overview:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
