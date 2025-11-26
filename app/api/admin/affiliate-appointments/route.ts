import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

// GET - Fetch appointments with affiliate codes (for commission review)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const hasCommission = searchParams.get('hasCommission');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const query: any = {
      affiliateId: { $exists: true, $ne: null },
    };

    if (hasCommission === 'true') {
      query.hasCommission = true;
    } else if (hasCommission === 'false') {
      query.hasCommission = false;
    }

    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      Appointment.find(query)
        .populate('doctorId', 'name qualification hospital')
        .populate('affiliateId', 'name affiliateCode email phoneNumber')
        .populate('userId', 'fullName email')
        .sort({ appointmentDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(query),
    ]);

    return NextResponse.json({
      appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching affiliate appointments:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
