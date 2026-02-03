import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Doctor from '@/models/Doctor';
import Affiliate from '@/models/Affiliate';
import User from '@/models/User';

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
      .populate('doctorId', 'name qualification department hospital image availability')
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

// Generate unique serial number (used when admin confirms appointment)
export async function generateSerialNumber(): Promise<string> {
  const today = new Date();
  const year = today.getFullYear().toString().slice(-2);
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const prefix = `MT${year}${month}${day}`;
  
  // Find the last appointment for today to get the next sequence number
  const lastAppointment = await Appointment.findOne({
    serialNumber: { $regex: `^${prefix}` }
  }).sort({ serialNumber: -1 });
  
  let sequence = 1;
  if (lastAppointment && lastAppointment.serialNumber) {
    const lastSequence = parseInt(lastAppointment.serialNumber.slice(-4));
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }
  
  return `${prefix}${String(sequence).padStart(4, '0')}`;
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
      hospitalName,
      appointmentDate,
      appointmentTime,
      userId,
      affiliateCode,
    } = body;

    // Validate required fields
    if (!doctorId || !patientName || !mobileNumber || !patientType || !hospitalName || !appointmentDate) {
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
      // Check in User model first (new system)
      let affiliate: any = await User.findOne({ 
        affiliateCode: affiliateCode.toUpperCase(),
        userType: 'affiliate',
        isActive: true 
      });

      // Fallback to Affiliate model (old system) if not found in User
      if (!affiliate) {
         affiliate = await Affiliate.findOne({ 
          affiliateCode: affiliateCode.toUpperCase(),
          isActive: true 
        });
      }
      
      if (affiliate) {
        affiliateId = affiliate._id;
        // Increment referrals count
        affiliate.referrals = (affiliate.referrals || 0) + 1;
        await affiliate.save();
      }
    }

    // Create appointment (serial number will be assigned by admin when confirming)
    const appointment = await Appointment.create({
      doctorId,
      patientName,
      mobileNumber,
      gender: gender || undefined,
      age: age || undefined,
      patientType,
      hospitalName,
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

