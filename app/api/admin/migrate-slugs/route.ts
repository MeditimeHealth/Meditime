import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import Hospital from "@/models/Hospital";
import { generateUniqueSlug } from "@/lib/slug";
import { verifyAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin(request);
    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    await dbConnect();

    // Regenerate all doctor slugs
    const doctors = await Doctor.find({});
    let doctorUpdated = 0;

    for (const doctor of doctors) {
      const slugSource = doctor.name || doctor.nameBn || "doctor";
      const newSlug = await generateUniqueSlug(
        slugSource,
        Doctor,
        doctor._id.toString(),
        "doctor"
      );
      if (doctor.slug !== newSlug) {
        await Doctor.updateOne({ _id: doctor._id }, { $set: { slug: newSlug } });
        doctorUpdated++;
      }
    }

    // Regenerate all hospital slugs
    const hospitals = await Hospital.find({});
    let hospitalUpdated = 0;

    for (const hospital of hospitals) {
      const slugSource = hospital.name || hospital.nameBn || "hospital";
      const newSlug = await generateUniqueSlug(
        slugSource,
        Hospital,
        hospital._id.toString(),
        "hospital"
      );
      if (hospital.slug !== newSlug) {
        await Hospital.updateOne(
          { _id: hospital._id },
          { $set: { slug: newSlug } }
        );
        hospitalUpdated++;
      }
    }

    return NextResponse.json({
      message: "Slugs regenerated successfully",
      doctorsUpdated: doctorUpdated,
      doctorsTotal: doctors.length,
      hospitalsUpdated: hospitalUpdated,
      hospitalsTotal: hospitals.length,
    });
  } catch (error: any) {
    console.error("Error migrating slugs:", error);
    return NextResponse.json(
      { error: error.message || "Failed to migrate slugs" },
      { status: 500 }
    );
  }
}
