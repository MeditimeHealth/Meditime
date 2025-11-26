import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AffiliateWithdrawal from '@/models/AffiliateWithdrawal';
import Affiliate from '@/models/Affiliate';

// POST - Submit withdrawal request
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      affiliateCode,
      amount,
      patientName,
      patientPhone,
      hospitalName,
      proofPhotos,
      paymentMethod,
      paymentDetails,
    } = body;

    // Validate required fields
    if (!affiliateCode || !amount || !patientName || !patientPhone || !hospitalName || !proofPhotos || !paymentMethod || !paymentDetails) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Check balance
    if ((affiliate.walletBalance || 0) < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance. Your current balance is ৳' + (affiliate.walletBalance || 0) },
        { status: 400 }
      );
    }

    // Create withdrawal request
    const withdrawal = await AffiliateWithdrawal.create({
      affiliateId: affiliate._id,
      amount,
      patientName,
      patientPhone,
      hospitalName,
      proofPhotos,
      paymentMethod,
      paymentDetails,
      status: 'pending',
    });

    await withdrawal.populate('affiliateId', 'name affiliateCode email');

    return NextResponse.json(
      {
        message: 'Withdrawal request submitted successfully',
        withdrawal,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error submitting withdrawal:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
