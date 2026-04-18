import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DiagnosticBooking from "@/models/DiagnosticBooking";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await req.json();
    const booking = await DiagnosticBooking.findByIdAndUpdate(
      params.id, 
      { status: body.status },
      { new: true }
    );
    
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Booking updated successfully", booking },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const booking = await DiagnosticBooking.findByIdAndDelete(params.id);
    
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Booking deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
