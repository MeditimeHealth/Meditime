import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveConsultant from '@/models/LiveConsultant';
import Doctor from '@/models/Doctor';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

function generateRoomId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'meditime-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET — List all live consultants (admin)
export async function GET() {
  try {
    await dbConnect();
    const consultants = await LiveConsultant.find()
      .populate('doctorId', 'name nameBn specialty specialtyBn image qualification qualificationBn designation designationBn')
      .sort({ createdAt: -1 });
    return NextResponse.json(consultants, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch live consultants' }, { status: 500 });
  }
}

// POST — Add a doctor as a live consultant
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { doctorId, newPatientFee, estimatedWaitTime, maxQueueSize, specialization, specializationBn, language, email, password } = body;

    if (!doctorId || newPatientFee === undefined) {
      return NextResponse.json({ error: 'doctorId and newPatientFee are required' }, { status: 400 });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Check if already a live consultant
    const existing = await LiveConsultant.findOne({ doctorId });
    if (existing) {
      return NextResponse.json({ error: 'This doctor is already a live consultant' }, { status: 409 });
    }

    // Optionally create user account if email and password are provided
    if (email && password) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const userObj: any = {
        fullName: doctor.name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'doctor',
        userType: 'doctor',
        doctorId: doctor._id,
        isActive: true,
      };
      if (doctor.phoneNumber) userObj.phoneNumber = doctor.phoneNumber;
      
      await User.create(userObj);
      
      // Update doctor record with email if it was missing
      if (!doctor.email) {
        doctor.email = email.toLowerCase();
        await doctor.save();
      }
    }

    const roomId = generateRoomId();

    const consultant = await LiveConsultant.create({
      doctorId,
      newPatientFee,
      estimatedWaitTime: estimatedWaitTime || 15,
      maxQueueSize: maxQueueSize || 10,
      roomId,
      specialization: specialization || doctor.specialty,
      specializationBn: specializationBn || doctor.specialtyBn,
      language: language || 'Bengali',
      isLive: false,
    });

    const populated = await LiveConsultant.findById(consultant._id)
      .populate('doctorId', 'name nameBn specialty specialtyBn image qualification qualificationBn designation designationBn');

    return NextResponse.json(populated, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create live consultant' }, { status: 500 });
  }
}
