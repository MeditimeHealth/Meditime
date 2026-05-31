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
    const decodedId = decodeURIComponent(id);

    let doctor;
    // If it's a valid ObjectId, try finding by ID
    if (decodedId.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(decodedId);
    }
    // If not found by ID or not a valid ObjectId, try finding by slug
    if (!doctor) {
      doctor = await Doctor.findOne({ slug: decodedId });
    }
    if (!doctor) {
      doctor = await Doctor.findOne({ slugBn: decodedId });
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
      slug,       // Optional manual English slug override
      slugBn,     // Optional manual Bangla slug override

      email,
      phoneNumber,
      department,

      reportShowFee,
      newPatientFee,
      diseases,
      diseasesEn,
      availability,
      bio,
      image,

      // Bangla fields
      departmentBn,
      reportShowFeeBn,
      newPatientFeeBn,
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
      if (!slot.hospital) {
        return NextResponse.json(
          { error: "Each availability slot must have a hospital" },
          { status: 400 }
        );
      }
    }

    // Prepare doctor data
    const doctorData: any = {
      name: name || "",
      qualification: qualification || "",

      availability: availabilityArray,
    };

    // Handle Slug Logic
    const existingDoctor = await Doctor.findById(id);
    
    // 1. English slug (slug)
    if (slug) {
      doctorData.slug = slug; // Use provided English slug if any
    } else {
      const newNameEn = name || body.nameBn;
      const oldNameEn = existingDoctor?.name || existingDoctor?.nameBn;

      if (existingDoctor && !existingDoctor.slug && (newNameEn || oldNameEn)) {
        doctorData.slug = await generateUniqueSlug(newNameEn || oldNameEn || 'doctor', Doctor, id);
      } else if (existingDoctor && newNameEn && newNameEn !== oldNameEn) {
        doctorData.slug = await generateUniqueSlug(newNameEn, Doctor, id);
      }
    }

    // 2. Bangla slug (slugBn)
    if (slugBn) {
      doctorData.slugBn = slugBn; // Use provided Bangla slug if any
    } else {
      const newNameBn = body.nameBn || name;
      const oldNameBn = existingDoctor?.nameBn || existingDoctor?.name;

      if (existingDoctor && !existingDoctor.slugBn && (newNameBn || oldNameBn)) {
        doctorData.slugBn = await generateUniqueSlug(newNameBn || oldNameBn || 'doctor', Doctor, id, 'slugBn');
      } else if (existingDoctor && newNameBn && newNameBn !== oldNameBn) {
        doctorData.slugBn = await generateUniqueSlug(newNameBn, Doctor, id, 'slugBn');
      }
    }

    // Add optional fields
    if (specialty) doctorData.specialty = specialty;
    if (designation) doctorData.designation = designation;
    if (email) doctorData.email = email;
    if (phoneNumber) doctorData.phoneNumber = phoneNumber;
    if (department) doctorData.department = department;
    
    // Handle fees - allow 0
    if (reportShowFee !== undefined) doctorData.reportShowFee = reportShowFee;
    if (newPatientFee !== undefined) doctorData.newPatientFee = newPatientFee;
    
    if (diseases && Array.isArray(diseases)) doctorData.diseases = diseases;
    if (diseasesEn && Array.isArray(diseasesEn)) doctorData.diseasesEn = diseasesEn;
    if (bio) doctorData.bio = bio;
    if (image) doctorData.image = image;

    // Bangla Fields
    if (body.nameBn) doctorData.nameBn = body.nameBn;
    if (body.specialtyBn) doctorData.specialtyBn = body.specialtyBn;
    if (body.qualificationBn) doctorData.qualificationBn = body.qualificationBn;
    if (body.designationBn) doctorData.designationBn = body.designationBn;
    if (body.bioBn) doctorData.bioBn = body.bioBn;
    if (departmentBn) doctorData.departmentBn = departmentBn;
    if (reportShowFeeBn) doctorData.reportShowFeeBn = reportShowFeeBn;
    if (newPatientFeeBn) doctorData.newPatientFeeBn = newPatientFeeBn;
    if (slugBn) doctorData.slugBn = slugBn;

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

