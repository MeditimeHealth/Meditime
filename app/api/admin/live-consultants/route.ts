import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveConsultant from '@/models/LiveConsultant';
import Doctor from '@/models/Doctor';
import { v4 } from 'crypto';

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
    const { doctorId, consultationFee, estimatedWaitTime, maxQueueSize, specialization, specializationBn, language } = body;

    if (!doctorId || consultationFee === undefined) {
      return NextResponse.json({ error: 'doctorId and consultationFee are required' }, { status: 400 });
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

    const roomId = generateRoomId();

    const consultant = await LiveConsultant.create({
      doctorId,
      consultationFee,
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
