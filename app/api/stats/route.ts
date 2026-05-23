import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import Department from "@/models/Department";
import Hospital from "@/models/Hospital";

export async function GET() {
  try {
    await dbConnect();

    const doctorCount = await Doctor.countDocuments();
    const departmentCount = await Department.countDocuments();
    const hospitalCount = await Hospital.countDocuments();

    return NextResponse.json({
      doctorCount,
      departmentCount,
      hospitalCount,
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
