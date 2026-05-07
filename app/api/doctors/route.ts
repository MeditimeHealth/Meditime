import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import mongoose from "mongoose";
import { generateUniqueSlug } from "@/lib/slug";
import { verifyAdmin } from "@/lib/auth";
import Thana from "@/models/Thana";
import District from "@/models/District";
import Division from "@/models/Division";
import Hospital from "@/models/Hospital";

// Force model output refreshing
// if (mongoose.models.Doctor) {
//   delete mongoose.models.Doctor; 
// }

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filters
    const search = searchParams.get("search");
    const specialty = searchParams.get("specialty");
    const hospital = searchParams.get("hospital");
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const thana = searchParams.get("thana");
    const department = searchParams.get("department");
    const qualification = searchParams.get("qualification");
    const minFee = searchParams.get("minFee");
    const maxFee = searchParams.get("maxFee");
    const days = searchParams.get("days")?.split(","); // Array of days
    const minRating = searchParams.get("minRating");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDirection = searchParams.get("sortDirection") === "asc" ? 1 : -1;

    let query: any = {};

    // Text search across multiple fields
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$or = [
        { name: searchRegex },
        { nameBn: searchRegex },
        { specialty: searchRegex },
        { specialtyBn: searchRegex },
        { hospital: searchRegex },
        { qualification: searchRegex },
        { qualificationBn: searchRegex },
        { bio: searchRegex },
        { bioBn: searchRegex },
        { designation: searchRegex },
        { designationBn: searchRegex }
      ];
    }

    // Exact matches
    if (specialty) query.specialty = specialty;
    if (hospital) query.hospital = hospital;
    if (department) query.department = department;
    if (qualification) query.qualification = qualification;

    // Location filtering
    if (division || district || thana) {
      let thanaQuery: any = {};
      
      if (thana) {
         thanaQuery.name = new RegExp(`^${thana}$`, "i");
      }
      
      if (district) {
         const districtObj = await District.findOne({ name: new RegExp(`^${district}$`, "i") });
         if (districtObj) {
            thanaQuery.district = districtObj._id;
         } else {
            thanaQuery.district = null; 
         }
      } else if (division) {
         const divisionObj = await Division.findOne({ name: new RegExp(`^${division}$`, "i") });
         if (divisionObj) {
            const districtObjs = await District.find({ division: divisionObj._id });
            const districtIds = districtObjs.map(d => d._id);
            thanaQuery.district = { $in: districtIds };
         } else {
            thanaQuery.district = null;
         }
      }

      let hospitalNames: string[] = [];
      if (thanaQuery.district !== null) {
         const thanas = await Thana.find(thanaQuery);
         const thanaIds = thanas.map(t => t._id);
         if (thanaIds.length > 0) {
            const hospitals = await Hospital.find({ thana: { $in: thanaIds } });
            hospitalNames = hospitals.map(h => h.name).filter(Boolean);
         }
      }

      let locationConditions = [];
      let directLocationMatch: any = {};
      if (division) directLocationMatch.division = new RegExp(`^${division}$`, "i");
      if (district) directLocationMatch.district = new RegExp(`^${district}$`, "i");
      if (thana) directLocationMatch.thana = new RegExp(`^${thana}$`, "i");
      
      locationConditions.push(directLocationMatch);
      
      if (hospitalNames.length > 0) {
         locationConditions.push({ hospital: { $in: hospitalNames } });
      }

      if (query.$and) {
         query.$and.push({ $or: locationConditions });
      } else {
         query.$and = [{ $or: locationConditions }];
      }
    }

    // Range filters
    if (minFee || maxFee) {
      query.consultationFee = {};
      if (minFee) query.consultationFee.$gte = parseFloat(minFee);
      if (maxFee) query.consultationFee.$lte = parseFloat(maxFee);
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Availability days filter
    if (days && days.length > 0) {
      query["availability.days"] = { $in: days };
    }

    const [doctors, total] = await Promise.all([
      Doctor.find(query)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit),
      Doctor.countDocuments(query)
    ]);


    return NextResponse.json({ 
      doctors, 
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }, { status: 200 });
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
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 });
    }

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

    // Generate slug
    doctorData.slug = await generateUniqueSlug(doctorData.name || doctorData.nameBn || "doctor");

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

