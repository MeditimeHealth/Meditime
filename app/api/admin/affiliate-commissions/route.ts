import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AffiliateCommission from '@/models/AffiliateCommission';
import Appointment from '@/models/Appointment';
import Affiliate from '@/models/Affiliate';

// GET - Fetch all affiliate commissions with filters
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

    const [commissions, total] = await Promise.all([
      AffiliateCommission.find(query)
        .populate('appointmentId', 'patientName mobileNumber appointmentDate hospitalName')
        .populate('affiliateId', 'name affiliateCode email phoneNumber')
        .populate('approvedBy', 'fullName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      AffiliateCommission.countDocuments(query),
    ]);

    return NextResponse.json({
      commissions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create or update commission for an appointment
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      appointmentId,
      totalBill,
      commissionType,
      commissionValue,
      notes,
    } = body;

    // Validate required fields
    if (!appointmentId || !totalBill || !commissionType || commissionValue === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify appointment exists and has affiliate
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    if (!appointment.affiliateId) {
      return NextResponse.json(
        { error: 'Appointment does not have an affiliate code' },
        { status: 400 }
      );
    }

    // Calculate commission amount
    let commissionAmount = 0;
    if (commissionType === 'percentage') {
      commissionAmount = (totalBill * commissionValue) / 100;
    } else if (commissionType === 'flat') {
      commissionAmount = commissionValue;
    }

    // Check if commission already exists
    const existingCommission = await AffiliateCommission.findOne({ appointmentId });

    if (existingCommission) {
      // Update existing commission
      existingCommission.totalBill = totalBill;
      existingCommission.commissionType = commissionType;
      existingCommission.commissionValue = commissionValue;
      existingCommission.commissionAmount = commissionAmount;
      existingCommission.notes = notes;
      await existingCommission.save();

      return NextResponse.json({
        message: 'Commission updated successfully',
        commission: existingCommission,
      });
    } else {
      // Create new commission
      const commission = await AffiliateCommission.create({
        appointmentId,
        affiliateId: appointment.affiliateId,
        totalBill,
        commissionType,
        commissionValue,
        commissionAmount,
        status: 'pending',
        notes,
      });

      // Update appointment
      appointment.hasCommission = true;
      await appointment.save();

      // Update affiliate pending commissions
      await Affiliate.findByIdAndUpdate(appointment.affiliateId, {
        $inc: { pendingCommissions: commissionAmount },
      });

      await commission.populate('affiliateId', 'name affiliateCode email');

      return NextResponse.json(
        {
          message: 'Commission created successfully',
          commission,
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error('Error creating commission:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
