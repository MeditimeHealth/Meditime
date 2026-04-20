import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DiagnosticBooking from "@/models/DiagnosticBooking";
import AbandonedCart from "@/models/AbandonedCart";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    const newBooking = new DiagnosticBooking({
      patientName: body.patientName,
      mobileNumber: body.mobileNumber,
      gender: body.gender,
      age: body.age,
      patientType: body.patientType,
      appointmentDate: new Date(body.appointmentDate),
      venueId: body.venueId,
      tests: body.tests,
      totalPrice: body.totalPrice,
      status: 'Confirmed'
    }); 

    await newBooking.save();

    // Cleanup abandoned cart for this user
    try {
      await AbandonedCart.deleteMany({ phoneNumber: body.mobileNumber });
    } catch (cleanupErr) {
      console.error("Error cleaning up abandoned cart:", cleanupErr);
      // Non-critical error, don't fail the booking
    }

    return NextResponse.json(
      { 
        message: "Diagnostic booking created successfully", 
        booking: newBooking
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating diagnostic booking:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
