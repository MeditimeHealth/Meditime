import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DoctorTimeSlot from "@/models/DoctorTimeSlot";

// GET - Get doctor statistics
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");

    if (!doctorId) {
      return NextResponse.json(
        { error: "Doctor ID is required" },
        { status: 400 }
      );
    }

    // Get time slots statistics
    const totalSlots = await DoctorTimeSlot.countDocuments({ doctorId });
    const availableSlots = await DoctorTimeSlot.countDocuments({ 
      doctorId, 
      isAvailable: true, 
      isBooked: false 
    });
    const bookedSlots = await DoctorTimeSlot.countDocuments({ 
      doctorId, 
      isBooked: true 
    });

    return NextResponse.json({
      stats: {
        totalSlots,
        availableSlots,
        bookedSlots,
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching doctor stats:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

