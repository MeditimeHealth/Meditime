import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DoctorTimeSlot from "@/models/DoctorTimeSlot";

// PUT - Update a specific time slot
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const body = await request.json();
    const { isAvailable } = body;

    const { id } = await params;
    const timeSlot = await DoctorTimeSlot.findById(id);

    if (!timeSlot) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      );
    }

    // Only allow updating availability if not booked
    if (timeSlot.isBooked) {
      return NextResponse.json(
        { error: "Cannot modify a booked time slot" },
        { status: 400 }
      );
    }

    if (isAvailable !== undefined) {
      timeSlot.isAvailable = isAvailable;
    }

    await timeSlot.save();

    return NextResponse.json(
      { message: "Time slot updated successfully", timeSlot },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating time slot:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific time slot
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const timeSlot = await DoctorTimeSlot.findById(id);

    if (!timeSlot) {
      return NextResponse.json(
        { error: "Time slot not found" },
        { status: 404 }
      );
    }

    if (timeSlot.isBooked) {
      return NextResponse.json(
        { error: "Cannot delete a booked time slot" },
        { status: 400 }
      );
    }

    await DoctorTimeSlot.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Time slot deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting time slot:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

