import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Doctor from "@/models/Doctor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { doctor },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching doctor:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      qualification,
      currentPosition,
      experience,
      email,
      phoneNumber,
      hospital,
      division,
      district,
      thana,
      chamber,
      department,
      consultationFee,
      oldPatientFee,
      newPatientFee,
      diseases,
      availability,
      bio,
      image,
    } = body;

    // Validate required fields - consultationFee or newPatientFee is required
    if (!name || !qualification || !experience || !availability) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Use newPatientFee as consultationFee if consultationFee is not provided
    const finalConsultationFee = consultationFee || newPatientFee;
    if (!finalConsultationFee) {
      return NextResponse.json(
        { error: "Consultation fee or new patient fee is required" },
        { status: 400 }
      );
    }

    // Ensure availability is an array and validate structure
    const availabilityArray = Array.isArray(availability) ? availability : [availability];
    
    // Validate each availability slot
    for (const slot of availabilityArray) {
      if (!slot.days || !Array.isArray(slot.days) || slot.days.length === 0) {
        return NextResponse.json(
          { error: "Each availability slot must have at least one day selected" },
          { status: 400 }
        );
      }
      if (!slot.startTime || !slot.endTime) {
        return NextResponse.json(
          { error: "Each availability slot must have start time and end time" },
          { status: 400 }
        );
      }
    }

    // Prepare doctor data, only including defined fields
    const doctorData: any = {
      name,
      qualification,
      experience,
      consultationFee: finalConsultationFee,
      availability: availabilityArray,
    };

    // Add optional fields only if they have values
    if (currentPosition) doctorData.currentPosition = currentPosition;
    if (email) doctorData.email = email;
    if (phoneNumber) doctorData.phoneNumber = phoneNumber;
    if (hospital) doctorData.hospital = hospital;
    if (division) doctorData.division = division;
    if (district) doctorData.district = district;
    if (thana) doctorData.thana = thana;
    if (chamber) doctorData.chamber = chamber;
    if (department) doctorData.department = department;
    if (oldPatientFee) doctorData.oldPatientFee = oldPatientFee;
    if (newPatientFee) doctorData.newPatientFee = newPatientFee;
    if (diseases && Array.isArray(diseases) && diseases.length > 0) doctorData.diseases = diseases;
    if (bio) doctorData.bio = bio;
    if (image) doctorData.image = image;

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      doctorData,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Doctor updated successfully", doctor },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating doctor:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const doctor = await Doctor.findByIdAndDelete(id);
    
    if (!doctor) {
      return NextResponse.json(
        { error: "Doctor not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Doctor deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting doctor:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

