import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Doctor from '@/models/Doctor';
import User from '@/models/User';

// PATCH - Update appointment status and serial number
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const { status, userId, serialNumber } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Check if appointment exists and verify ownership (if userId provided)
    const existingAppointment = await Appointment.findById(id);
    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    // If userId is provided (user trying to cancel), verify ownership
    if (userId && existingAppointment.userId) {
      if (existingAppointment.userId.toString() !== userId) {
        return NextResponse.json(
          { error: 'You do not have permission to update this appointment' },
          { status: 403 }
        );
      }
      // Users can only cancel their own appointments
      if (status !== 'cancelled') {
        return NextResponse.json(
          { error: 'You can only cancel your own appointments' },
          { status: 403 }
        );
      }
    }

    // When confirming, serial number is required
    if (status === 'confirmed' && !existingAppointment.serialNumber && !serialNumber) {
      return NextResponse.json(
        { error: 'Serial number is required when confirming appointment' },
        { status: 400 }
      );
    }

    // Build update object - allow duplicate serial numbers
    const updateData: any = { status };
    if (serialNumber) {
      updateData.serialNumber = serialNumber.toUpperCase();
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('doctorId', 'name nameBn qualification qualificationBn specialty specialtyBn designation designationBn department hospital image slug')
     .populate('userId', 'fullName email phoneNumber');

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Appointment updated successfully', appointment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get single appointment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const appointment = await Appointment.findById(id)
      .populate('doctorId', 'name nameBn qualification qualificationBn specialty specialtyBn designation designationBn department hospital image slug')
      .populate('userId', 'fullName email phoneNumber');

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { appointment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete appointment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Appointment deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
