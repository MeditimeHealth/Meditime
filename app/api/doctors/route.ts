import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import mongoose from "mongoose";

// Force model output refreshing
// if (mongoose.models.Doctor) {
//   delete mongoose.models.Doctor; 
// }

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
    const total = await Doctor.countDocuments(query);
    return NextResponse.json({ doctors, total }, { status: 200 });
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
      nameBn,
      specialtyBn,
      qualificationBn,
      designationBn,
      bioBn,
    } = body;

    // Validate required fields
    if ((!name && !nameBn) || (!qualification && !qualificationBn) || !availability) {
      console.error("Create Doctor Validation Failed:", { name, nameBn, qualification, qualificationBn, hasAvailability: !!availability });
      return NextResponse.json(
        { error: "Missing required fields: Name (English/Bangla), Qualification (English/Bangla), or Availability" },
        { status: 400 }
      );
    }

    // Use newPatientFee as consultationFee if consultationFee is not provided
    const finalConsultationFee = consultationFee !== undefined ? consultationFee : newPatientFee;

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
    }

    // Prepare doctor data
    const doctorData: any = {
      name: name || "",
      specialty: specialty || "",
      qualification: qualification || "",
      designation: designation || "",
      consultationFee: finalConsultationFee,
      availability: availabilityArray,
    };

    // Add optional fields
    if (email) doctorData.email = email;
    if (phoneNumber) doctorData.phoneNumber = phoneNumber;
    if (hospital) doctorData.hospital = hospital;
    if (division) doctorData.division = division;
    if (district) doctorData.district = district;
    if (thana) doctorData.thana = thana;
    if (department) doctorData.department = department;

    // Handle fees - allow 0
    if (oldPatientFee !== undefined) doctorData.oldPatientFee = oldPatientFee;
    if (newPatientFee !== undefined) doctorData.newPatientFee = newPatientFee;

    if (diseases && Array.isArray(diseases)) doctorData.diseases = diseases;
    if (bio) doctorData.bio = bio;
    if (image) doctorData.image = image;

    // Bangla Fields
    if (nameBn) doctorData.nameBn = nameBn;
    if (specialtyBn) doctorData.specialtyBn = specialtyBn;
    if (qualificationBn) doctorData.qualificationBn = qualificationBn;
    if (designationBn) doctorData.designationBn = designationBn;
    if (bioBn) doctorData.bioBn = bioBn;

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

