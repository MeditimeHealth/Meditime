import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import PhoneVerification from '@/models/PhoneVerification';
import User from '@/models/User';
import { sendSMS } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { phoneNumber, checkExists } = await request.json();

    // Standardize to 11 digit check
    if (!phoneNumber || phoneNumber.length !== 11 || !phoneNumber.startsWith('01')) {
      return NextResponse.json({ error: 'Invalid phone number format. Must be 11 digits starting with 01.' }, { status: 400 });
    }

    // Check if phone number is already registered
    if (checkExists) {
      // User model might store with or without +880
      const formattedWithCountry = `+880${phoneNumber.substring(1)}`;
      const userExists = await User.findOne({
        $or: [
          { phoneNumber: phoneNumber },
          { phoneNumber: formattedWithCountry }
        ]
      });

      if (userExists) {
        return NextResponse.json({ error: 'Phone number already registered' }, { status: 400 });
      }
    }

    // Check if there is an active OTP within cooldown (2 minutes)
    const existing = await PhoneVerification.findOne({ phoneNumber });
    if (existing && existing.expiresAt.getTime() > Date.now()) {
      const remainingSeconds = Math.ceil((existing.expiresAt.getTime() - Date.now()) / 1000);
      return NextResponse.json({ 
        error: `Please wait ${remainingSeconds} seconds before requesting a new OTP.` 
      }, { status: 429 });
    }

    // Generate 4-digit code
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

    // Save/update verification entry
    await PhoneVerification.findOneAndUpdate(
      { phoneNumber },
      { otp, expiresAt, verified: false },
      { upsert: true, new: true }
    );

    // Format the OTP message as requested
    const message = `Your Meditime OTP code is: ${otp}.\nPlease do not share this code with anyone.\nThis code is valid for 2 minutes.`;
    
    const smsRes = await sendSMS(phoneNumber, message);

    if (!smsRes.success) {
      return NextResponse.json({ error: smsRes.error || 'Failed to send SMS' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: any) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
