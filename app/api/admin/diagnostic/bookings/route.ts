import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DiagnosticBooking from "@/models/DiagnosticBooking";
import "@/models/Hospital"; // Ensure ref models are loaded

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    
    await dbConnect();
    
    let query: any = {};
    if (search) {
       query.patientName = { $regex: search, $options: 'i' };
    }
    if (status) {
       query.status = status;
    }

    const bookings = await DiagnosticBooking.find(query)
      .populate('venueId', 'name address')
      .sort({ createdAt: -1 });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching admin diagnostic bookings:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
