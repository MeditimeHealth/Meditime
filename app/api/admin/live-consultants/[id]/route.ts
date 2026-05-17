import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveConsultant from '@/models/LiveConsultant';

// GET — Single live consultant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const consultant = await LiveConsultant.findById(id)
      .populate('doctorId', 'name nameBn specialty specialtyBn image qualification qualificationBn designation designationBn');

    if (!consultant) {
      return NextResponse.json({ error: 'Live consultant not found' }, { status: 404 });
    }

    return NextResponse.json(consultant, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT — Update live consultant settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const { newPatientFee, estimatedWaitTime, maxQueueSize, specialization, specializationBn, language } = body;

    const consultant = await LiveConsultant.findByIdAndUpdate(
      id,
      { newPatientFee, estimatedWaitTime, maxQueueSize, specialization, specializationBn, language },
      { new: true, runValidators: true }
    ).populate('doctorId', 'name nameBn specialty specialtyBn image qualification qualificationBn designation designationBn');

    if (!consultant) {
      return NextResponse.json({ error: 'Live consultant not found' }, { status: 404 });
    }

    return NextResponse.json(consultant, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH — Toggle isLive status or accept/complete patients
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    // Toggle live status
    if (body.action === 'toggleLive') {
      const consultant = await LiveConsultant.findById(id);
      if (!consultant) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      consultant.isLive = !consultant.isLive;
      // Clear queue when going offline
      if (!consultant.isLive) {
        consultant.currentQueue = consultant.currentQueue.map((entry: any) => {
          if (entry.status === 'waiting') {
            entry.status = 'cancelled';
          }
          return entry;
        });
      }
      await consultant.save();
      const populated = await LiveConsultant.findById(id)
        .populate('doctorId', 'name nameBn specialty specialtyBn image qualification qualificationBn designation designationBn');
      return NextResponse.json(populated, { status: 200 });
    }

    // Accept next patient in queue
    if (body.action === 'acceptNext') {
      const consultant = await LiveConsultant.findById(id);
      if (!consultant) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      const waitingPatient = consultant.currentQueue.find((e: any) => e.status === 'waiting');
      if (!waitingPatient) {
        return NextResponse.json({ error: 'No waiting patients' }, { status: 400 });
      }
      // Set any current in-call to completed
      consultant.currentQueue.forEach((e: any) => {
        if (e.status === 'in-call') {
          e.status = 'completed';
          e.endedAt = new Date();
        }
      });
      waitingPatient.status = 'in-call';
      waitingPatient.startedAt = new Date();
      await consultant.save();
      const populated = await LiveConsultant.findById(id)
        .populate('doctorId', 'name nameBn specialty specialtyBn image qualification qualificationBn designation designationBn');
      return NextResponse.json(populated, { status: 200 });
    }

    // Complete current call
    if (body.action === 'completeCall') {
      const consultant = await LiveConsultant.findById(id);
      if (!consultant) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      consultant.currentQueue.forEach((e: any) => {
        if (e.status === 'in-call') {
          e.status = 'completed';
          e.endedAt = new Date();
        }
      });
      await consultant.save();
      const populated = await LiveConsultant.findById(id)
        .populate('doctorId', 'name nameBn specialty specialtyBn image qualification qualificationBn designation designationBn');
      return NextResponse.json(populated, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE — Remove live consultant
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const consultant = await LiveConsultant.findByIdAndDelete(id);

    if (!consultant) {
      return NextResponse.json({ error: 'Live consultant not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
