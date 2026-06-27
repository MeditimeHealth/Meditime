import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Appointment from '@/models/Appointment';
import Doctor from '@/models/Doctor';
import User from '@/models/User';
import { sendSMS } from '@/lib/sms';
import { getSession, getAdminSession } from '@/lib/auth';

// PATCH - Update appointment status and serial number
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let session = await getAdminSession(request);
    if (!session) {
      session = await getSession(request);
    }
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;
    const body = await request.json();
    const { status, serialNumber } = body;

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

    // Check if appointment exists
    const existingAppointment = await Appointment.findById(id);
    if (!existingAppointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const isAdmin = session.role === 'admin' || session.role === 'superadmin';

    // If not admin, verify ownership and restrict action to cancellation only
    if (!isAdmin) {
      if (!existingAppointment.userId || existingAppointment.userId.toString() !== session.id) {
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

    if (status === 'confirmed' && (serialNumber || appointment.serialNumber)) {
      try {
        const patientName = appointment.patientName;
        const serialNo = serialNumber || appointment.serialNumber || '';
        
        // Grab doctor name
        const doctorName = (appointment.doctorId as any)?.name || 'Doctor';
        const hospitalName = appointment.hospitalName || '';
        
        // Format Date and Day
        const apptDate = appointment.appointmentDate ? new Date(appointment.appointmentDate) : new Date();
        const dateStr = apptDate.toISOString().split('T')[0];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayStr = days[apptDate.getDay()];
        
        const timeSlot = appointment.appointmentTime || '';
        
        const smsContent = `Dear ${patientName},\nYour serial has been successfully Confirmed.\nSerial No: ${serialNo}\nDoctor: ${doctorName}\nChamber: ${hospitalName}\nDate: ${dateStr} (${dayStr})\nAppointment Time: ${timeSlot}\nHelpline: +8801610384444\n\nMeditime`;
        
        await sendSMS(appointment.mobileNumber, smsContent);
      } catch (smsError) {
        console.error('Error sending patient confirmation SMS:', smsError);
      }
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
    let session = await getAdminSession(request);
    if (!session) {
      session = await getSession(request);
    }
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 });
    }

    await dbConnect();

    const { id } = await params;

    const appointment = await Appointment.findById(id)
      .populate('doctorId')
      .populate('userId', 'fullName email phoneNumber');

    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }

    const isAdmin = session.role === 'admin' || session.role === 'superadmin';
    if (!isAdmin && appointment.userId && appointment.userId._id.toString() !== session.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
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
    const session = await getAdminSession(request);
    if (!session || (session.role !== 'admin' && session.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

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
