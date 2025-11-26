import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AffiliateCommission from '@/models/AffiliateCommission';
import Affiliate from '@/models/Affiliate';

// PUT - Approve commission and credit affiliate wallet
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const body = await request.json();
    const { adminId } = body;

    // Find commission
    const commission = await AffiliateCommission.findById(id);
    if (!commission) {
      return NextResponse.json(
        { error: 'Commission not found' },
        { status: 404 }
      );
    }

    // Check if already approved
    if (commission.status === 'approved' || commission.status === 'paid') {
      return NextResponse.json(
        { error: 'Commission already processed' },
        { status: 400 }
      );
    }

    // Update commission status
    commission.status = 'approved';
    commission.approvedBy = adminId;
    commission.approvedAt = new Date();
    await commission.save();

    // Update affiliate wallet
    const affiliate = await Affiliate.findById(commission.affiliateId);
    if (affiliate) {
      affiliate.walletBalance = (affiliate.walletBalance || 0) + commission.commissionAmount;
      affiliate.totalEarned = (affiliate.totalEarned || 0) + commission.commissionAmount;
      affiliate.pendingCommissions = Math.max((affiliate.pendingCommissions || 0) - commission.commissionAmount, 0);
      affiliate.earnings = (affiliate.earnings || 0) + commission.commissionAmount;
      await affiliate.save();
    }

    await commission.populate('affiliateId', 'name affiliateCode email');

    return NextResponse.json({
      message: 'Commission approved and credited to affiliate wallet',
      commission,
    });
  } catch (error: any) {
    console.error('Error approving commission:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
