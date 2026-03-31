import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import LiveConsultant from "@/models/LiveConsultant";
import Appointment from "@/models/Appointment";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const doctorId = searchParams.get("doctorId");

    if (!doctorId) {
      return NextResponse.json(
        { error: "doctorId is required" },
        { status: 400 }
      );
    }

    // 1. Fetch Live Consultant Queue
    const liveConsultant = await LiveConsultant.findOne({ doctorId });
    const waitlist = liveConsultant ? liveConsultant.currentQueue.filter((q: any) => q.status === "waiting") : [];

    // 2. Fetch Appointments (Upcoming and Completed)
    const allAppointments = await Appointment.find({ doctorId }).sort({ appointmentDate: 1 });
    
    const now = new Date();
    // Assuming appointmentDate contains both date and time, or we just compare dates.
    // For simplicity, upcoming = status pending/confirmed.
    const upcomingAppointments = allAppointments.filter(
      (appt) => appt.status === "pending" || appt.status === "confirmed"
    );

    // 3. Payment history calculation
    const completedAppointments = allAppointments.filter((appt) => appt.status === "completed");
    
    // If the schema had a paidAmount, we'd use it. For now, estimate based on consultationFee (or new/old fee).
    // Let's get the doctor's fee from live consultant or assume a standard fee if missing. 
    // We can just sum them up if recorded, but since Appointment doesn't store fee, we will just count and multiply or retrieve it from doctor obj.
    // Actually, we can return the count and the frontend can display metrics.
    
    // We will just return the completed appointments for the payment ledger, and they can show the history.

    // 4. Patient Array (Unique patients based on mobileNumber)
    const uniquePatientsMap = new Map();
    allAppointments.forEach(appt => {
      if (!uniquePatientsMap.has(appt.mobileNumber)) {
        uniquePatientsMap.set(appt.mobileNumber, {
          patientName: appt.patientName,
          mobileNumber: appt.mobileNumber,
          gender: appt.gender,
          age: appt.age,
          lastVisit: appt.appointmentDate
        });
      } else {
        const existing = uniquePatientsMap.get(appt.mobileNumber);
        if (new Date(appt.appointmentDate) > new Date(existing.lastVisit)) {
          existing.lastVisit = appt.appointmentDate;
        }
      }
    });
    const patientsList = Array.from(uniquePatientsMap.values()).sort((a: any, b: any) => b.lastVisit - a.lastVisit);

    return NextResponse.json(
      {
        liveConsultant,
        waitlist,
        upcomingAppointments,
        completedAppointments,
        patientsList,
        summary: {
          totalPatients: patientsList.length,
          totalAppointments: allAppointments.length,
          totalCompleted: completedAppointments.length,
          waitingCount: waitlist.length
        }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
