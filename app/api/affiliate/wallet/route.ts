import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Affiliate from '@/models/Affiliate';
import AffiliateCommission from '@/models/AffiliateCommission';
import AffiliateWithdrawal from '@/models/AffiliateWithdrawal';

// GET - Fetch affiliate wallet and transaction history
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const affiliateCode = searchParams.get('affiliateCode');

    if (!affiliateCode) {
      return NextResponse.json(
        { error: 'Affiliate code is required' },
        { status: 400 }
      );
    }

    // Find affiliate
    const affiliate = await Affiliate.findOne({ affiliateCode: affiliateCode.toUpperCase() });
    if (!affiliate) {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      );
    }

    // Get commissions
    const commissions = await AffiliateCommission.find({ affiliateId: affiliate._id })
      .populate('appointmentId', 'patientName appointmentDate')
      .sort({ createdAt: -1 })
      .limit(50);

    // Get withdrawals
    const withdrawals = await AffiliateWithdrawal.find({ affiliateId: affiliate._id })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      wallet: {
        balance: affiliate.walletBalance || 0,
        totalEarned: affiliate.totalEarned || 0,
        totalWithdrawn: affiliate.totalWithdrawn || 0,
        pendingCommissions: affiliate.pendingCommissions || 0,
      },
      commissions,
      withdrawals,
    });
  } catch (error: any) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
