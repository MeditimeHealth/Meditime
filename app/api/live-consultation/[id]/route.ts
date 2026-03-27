import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LiveConsultant from '@/models/LiveConsultant';

// GET — Check queue status for a specific consultant (patient polling)
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
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const waitingCount = consultant.currentQueue.filter((e: any) => e.status === 'waiting').length;
    const inCallCount = consultant.currentQueue.filter((e: any) => e.status === 'in-call').length;

    return NextResponse.json({
      ...consultant.toObject(),
      waitingCount,
      inCallCount,
      queueFull: waitingCount >= consultant.maxQueueSize,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
