import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Doctor from "@/models/Doctor";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const hospital = searchParams.get("hospital");
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const thana = searchParams.get("thana");
    const department = searchParams.get("department");

    let query: any = {};
    if (hospital) {
      query.hospital = hospital;
    }
    if (division) {
      query.division = division;
    }
    if (district) {
      query.district = district;
    }
    if (thana) {
      query.thana = thana;
    }
    if (department) {
      query.department = department;
    }

    const doctors = await Doctor.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ doctors }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching doctors:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      name,
      specialty,
      qualification,
      designation,


      email,
      phoneNumber,
      hospital,
      division,
      district,
      thana,

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
    if (!name || !qualification || !availability) {
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
      if (!slot.time) {
        return NextResponse.json(
          { error: "Each availability slot must have a time" },
          { status: 400 }
        );
      }
    }

    // Prepare doctor data, only including defined fields
    const doctorData: any = {
      name,
      specialty,
      qualification,
      designation,

      consultationFee: finalConsultationFee,
      availability: availabilityArray,
    };

    // Add optional fields only if they have values

    if (email) doctorData.email = email;
    if (phoneNumber) doctorData.phoneNumber = phoneNumber;
    if (hospital) doctorData.hospital = hospital;
    if (division) doctorData.division = division;
    if (district) doctorData.district = district;
    if (thana) doctorData.thana = thana;

    if (department) doctorData.department = department;
    if (oldPatientFee) doctorData.oldPatientFee = oldPatientFee;
    if (newPatientFee) doctorData.newPatientFee = newPatientFee;
    if (diseases && Array.isArray(diseases) && diseases.length > 0) doctorData.diseases = diseases;
    if (bio) doctorData.bio = bio;
    if (image) doctorData.image = image;

    // Log the data being sent for debugging
    console.log('Creating doctor with data:', JSON.stringify(doctorData, null, 2));

    // Create doctor
    const doctor = await Doctor.create(doctorData);

    return NextResponse.json(
      { message: "Doctor created successfully", doctor },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating doctor:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

