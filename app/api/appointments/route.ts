import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Doctor from '@/models/Doctor';
import Affiliate from '@/models/Affiliate';

// GET - Fetch all appointments or filter by doctorId
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctorId');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const query: any = {};
    if (doctorId) {
      query.doctorId = doctorId;
    }
    if (status) {
      query.status = status;
    }
    if (userId) {
      query.userId = userId;
    }

    const appointments = await Appointment.find(query)
      .populate('doctorId', 'name qualification department hospital image')
      .populate('userId', 'fullName email phoneNumber')
      .populate('affiliateId', 'name affiliateCode email')
      .sort({ appointmentDate: -1, createdAt: -1 });

    return NextResponse.json(
      { appointments },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new appointment
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      doctorId,
      patientName,
      mobileNumber,
      gender,
      age,
      patientType,
      chamberName,
      appointmentDate,
      appointmentTime,
      userId,
      affiliateCode,
    } = body;

    // Validate required fields
    if (!doctorId || !patientName || !mobileNumber || !patientType || !chamberName || !appointmentDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json(
        { error: 'Doctor not found' },
        { status: 404 }
      );
    }

    // Validate affiliate code if provided
    let affiliateId = undefined;
    if (affiliateCode) {
      const affiliate = await Affiliate.findOne({ 
        affiliateCode: affiliateCode.toUpperCase(),
        isActive: true 
      });
      
      if (affiliate) {
        affiliateId = affiliate._id;
        // Increment referrals count
        affiliate.referrals = (affiliate.referrals || 0) + 1;
        await affiliate.save();
      }
    }

    // Create appointment
    const appointment = await Appointment.create({
      doctorId,
      patientName,
      mobileNumber,
      gender: gender || undefined,
      age: age || undefined,
      patientType,
      chamberName,
      appointmentDate: new Date(appointmentDate),
      appointmentTime: appointmentTime || undefined,
      userId: userId || undefined,
      affiliateCode: affiliateCode?.toUpperCase() || undefined,
      affiliateId: affiliateId || undefined,
      hasCommission: false,
      status: 'pending',
    });

    // Populate doctor info
    await appointment.populate('doctorId', 'name qualification department hospital image');

    return NextResponse.json(
      { message: 'Appointment booked successfully', appointment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

