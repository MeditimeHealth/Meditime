import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { generateUniqueSlug } from "@/lib/slug";
import { verifyAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    let doctor;
    // If it's a valid ObjectId, try finding by ID
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(id);
    }
    
    // If not found by ID or not a valid ObjectId, try finding by slug
    if (!doctor) {
      doctor = await Doctor.findOne({ slug: id });
    }
    
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
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      specialty,
      qualification,
      designation,
      slug, // Optional manual slug override


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

    // Validate required fields - allow either English or Bangla versions
    const hasName = name || body.nameBn;
    const hasQualification = qualification || body.qualificationBn;

    if (!hasName || !hasQualification || !availability) {
      return NextResponse.json(
        { error: "Missing required fields: Name (English or Bangla), Qualification (English or Bangla), and Availability are required." },
        { status: 400 }
      );
    }

    // Use newPatientFee as consultationFee if consultationFee is not provided
    const finalConsultationFee = consultationFee !== undefined ? consultationFee : newPatientFee;
    
    // Allow 0 as valid fee
    if (finalConsultationFee === undefined) {
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
    }

    // Prepare doctor data
    const doctorData: any = {
      name: name || "",
      qualification: qualification || "",
      consultationFee: finalConsultationFee,
      availability: availabilityArray,
    };

    // Handle Slug Logic
    if (slug) {
      doctorData.slug = slug; // Use provided slug if any
    } else if (name) {
      // Regenerate slug if name changed and no manual slug provided
      const existingDoctor = await Doctor.findById(id);
      if (existingDoctor && existingDoctor.name !== name) {
        doctorData.slug = await generateUniqueSlug(name, id);
      } else if (existingDoctor && !existingDoctor.slug) {
        // Generate if missing
        doctorData.slug = await generateUniqueSlug(existingDoctor.name || name, id);
      }
    }

    // Add optional fields
    if (specialty) doctorData.specialty = specialty;
    if (designation) doctorData.designation = designation;
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
    if (body.nameBn) doctorData.nameBn = body.nameBn;
    if (body.specialtyBn) doctorData.specialtyBn = body.specialtyBn;
    if (body.qualificationBn) doctorData.qualificationBn = body.qualificationBn;
    if (body.designationBn) doctorData.designationBn = body.designationBn;
    if (body.bioBn) doctorData.bioBn = body.bioBn;

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
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

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

