import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AffiliateWithdrawal from '@/models/AffiliateWithdrawal';
import Affiliate from '@/models/Affiliate';

// GET - Fetch all withdrawal requests
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const affiliateId = searchParams.get('affiliateId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {};
    if (status) {
      query.status = status;
    }
    if (affiliateId) {
      query.affiliateId = affiliateId;
    }

    const skip = (page - 1) * limit;

    const [withdrawals, total] = await Promise.all([
      AffiliateWithdrawal.find(query)
        .populate('affiliateId', 'name affiliateCode email phoneNumber walletBalance')
        .populate('processedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AffiliateWithdrawal.countDocuments(query),
    ]);

    return NextResponse.json({
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
