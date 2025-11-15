import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DoctorTimeSlot from "@/models/DoctorTimeSlot";
import Doctor from "@/models/Doctor";

// Helper function to generate time slots
function generateTimeSlots(startTime: string, endTime: string, slotDuration: number): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMin = startMin;
  const endTotalMinutes = endHour * 60 + endMin;
  
  while (true) {
    const currentTotalMinutes = currentHour * 60 + currentMin;
    if (currentTotalMinutes >= endTotalMinutes) break;
    
    const slotEndTotalMinutes = currentTotalMinutes + slotDuration;
    if (slotEndTotalMinutes > endTotalMinutes) break;
    
    const slotEndHour = Math.floor(slotEndTotalMinutes / 60);
    const slotEndMin = slotEndTotalMinutes % 60;
    
    const slotStart = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
    const slotEnd = `${String(slotEndHour).padStart(2, '0')}:${String(slotEndMin).padStart(2, '0')}`;
    
    slots.push(`${slotStart}-${slotEnd}`);
    
    // Move to next slot
    currentMin += slotDuration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }
  
  return slots;
}

// GET - Get doctor's time slots
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    let query: any = { doctorId };
    
    if (date) {
      const dateObj = new Date(date);
      const startOfDay = new Date(dateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(dateObj.setHours(23, 59, 59, 999));
      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const timeSlots = await DoctorTimeSlot.find(query)
      .sort({ date: 1, startTime: 1 });

    return NextResponse.json({ timeSlots }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching time slots:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create time slots (auto-generate from date range and time range)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { doctorId, startDate, endDate, startTime, endTime, slotDuration } = body;

    if (!doctorId || !startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Doctor ID, date range, and time range are required" },
        { status: 400 }
      );
    }

    // Get doctor to get slot duration if not provided
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    const finalSlotDuration = slotDuration || doctor.slotDuration || 30;

    // Generate slots for each day in the date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const slots: any[] = [];

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const timeSlots = generateTimeSlots(startTime, endTime, finalSlotDuration);
      
      for (const timeSlot of timeSlots) {
        const [slotStart, slotEnd] = timeSlot.split('-');
        
        // Check if slot already exists
        const existingSlot = await DoctorTimeSlot.findOne({
          doctorId,
          date: new Date(date.setHours(0, 0, 0, 0)),
          startTime: slotStart,
          endTime: slotEnd,
        });

        if (!existingSlot) {
          slots.push({
            doctorId,
            date: new Date(date),
            startTime: slotStart,
            endTime: slotEnd,
            slotDuration: finalSlotDuration,
            isAvailable: true,
            isBooked: false,
          });
        }
      }
    }

    if (slots.length === 0) {
      return NextResponse.json(
        { message: "No new slots to create. All slots already exist." },
        { status: 200 }
      );
    }

    const createdSlots = await DoctorTimeSlot.insertMany(slots);

    return NextResponse.json(
      { message: `Created ${createdSlots.length} time slots`, timeSlots: createdSlots },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating time slots:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete time slots
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const slotId = searchParams.get("slotId");
    const doctorId = searchParams.get("doctorId");
    const date = searchParams.get("date");

    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    let query: any = { doctorId };

    if (slotId) {
      query._id = slotId;
    } else if (date) {
      const dateObj = new Date(date);
      query.date = {
        $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
        $lte: new Date(dateObj.setHours(23, 59, 59, 999)),
      };
    } else {
      return NextResponse.json(
        { error: "Either slotId or date is required" },
        { status: 400 }
      );
    }

    // Only delete slots that are not booked
    query.isBooked = false;

    const result = await DoctorTimeSlot.deleteMany(query);

    return NextResponse.json(
      { message: `Deleted ${result.deletedCount} time slots` },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting time slots:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

