import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PhoneVerification from '@/models/PhoneVerification';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { phoneNumber, code } = await request.json();

    if (!phoneNumber || !code) {
      return NextResponse.json({ error: 'Phone number and code are required' }, { status: 400 });
    }

    const verification = await PhoneVerification.findOne({
      phoneNumber,
      otp: code,
      expiresAt: { $gt: new Date() }
    });

    if (!verification) {
      return NextResponse.json({ error: 'Invalid or expired OTP code' }, { status: 400 });
    }

    // Set verified to true and prolong expiresAt to allow completion of signup/booking (e.g., 10 minutes)
    verification.verified = true;
    verification.expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await verification.save();

    return NextResponse.json({ success: true, message: 'Phone number verified successfully' });
  } catch (error: any) {
    console.error('Error confirming OTP:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
