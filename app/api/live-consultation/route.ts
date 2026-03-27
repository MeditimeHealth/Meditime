import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveConsultant from '@/models/LiveConsultant';

// GET — Fetch all currently live doctors (patient-facing)
export async function GET() {
  try {
    await dbConnect();
    const consultants = await LiveConsultant.find({ isLive: true })
      .populate('doctorId', 'name nameBn specialty specialtyBn image qualification qualificationBn designation designationBn consultationFee')
      .sort({ createdAt: -1 });

    // Add computed fields
    const result = consultants.map((c: any) => {
      const doc = c.toObject();
      const waitingCount = doc.currentQueue.filter((e: any) => e.status === 'waiting').length;
      const inCallCount = doc.currentQueue.filter((e: any) => e.status === 'in-call').length;
      return {
        ...doc,
        waitingCount,
        inCallCount,
        queueFull: waitingCount >= doc.maxQueueSize,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST — Patient joins the queue
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { consultantId, patientName, patientPhone, patientEmail } = body;

    if (!consultantId || !patientName || !patientPhone) {
      return NextResponse.json({ error: 'consultantId, patientName, and patientPhone are required' }, { status: 400 });
    }

    const consultant = await LiveConsultant.findById(consultantId);
    if (!consultant) {
      return NextResponse.json({ error: 'Live consultant not found' }, { status: 404 });
    }

    if (!consultant.isLive) {
      return NextResponse.json({ error: 'Doctor is currently offline' }, { status: 400 });
    }

    const waitingCount = consultant.currentQueue.filter((e: any) => e.status === 'waiting').length;
    if (waitingCount >= consultant.maxQueueSize) {
      return NextResponse.json({ error: 'Queue is full. Please try again later.' }, { status: 400 });
    }

    // Check if patient is already in queue
    const alreadyInQueue = consultant.currentQueue.find(
      (e: any) => e.patientPhone === patientPhone && (e.status === 'waiting' || e.status === 'in-call')
    );
    if (alreadyInQueue) {
      return NextResponse.json({ error: 'You are already in the queue', queueEntry: alreadyInQueue }, { status: 409 });
    }

    consultant.currentQueue.push({
      patientName,
      patientPhone,
      patientEmail: patientEmail || '',
      status: 'waiting',
      joinedAt: new Date(),
    });

    await consultant.save();

    const queuePosition = consultant.currentQueue.filter((e: any) => e.status === 'waiting').length;

    return NextResponse.json({
      message: 'Joined the queue successfully',
      roomId: consultant.roomId,
      queuePosition,
      estimatedWaitTime: queuePosition * consultant.estimatedWaitTime,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
