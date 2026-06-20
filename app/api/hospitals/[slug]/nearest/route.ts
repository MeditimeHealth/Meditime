import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Hospital from "@/models/Hospital";
import Thana from "@/models/Thana";
import District from "@/models/District";
import Division from "@/models/Division";

const buildNearestPopulate = () => ({
  path: "thana",
  model: Thana,
  select: "name nameBn district",
  populate: {
    path: "district",
    model: District,
    select: "name nameBn division",
    populate: {
      path: "division",
      model: Division,
      select: "name nameBn",
    },
  },
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();

    // Ensure models are registered for populate
    void Thana;
    void District;
    void Division;

    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // Get current hospital with fully populated thana → district
    const currentHospital = await Hospital.findOne({ slug: decodedSlug }).populate({
      path: "thana",
      model: Thana,
      populate: { path: "district", model: District },
    });

    if (!currentHospital) {
      return NextResponse.json({ hospitals: [] }, { status: 200 });
    }

    const thanaDoc = currentHospital.thana as any;
    if (!thanaDoc) {
      return NextResponse.json({ hospitals: [] }, { status: 200 });
    }

    const thanaName: string = thanaDoc.name;
    const districtName: string = thanaDoc.district?.name;

    let nearest: any[] = [];

    // ── Pass 1: same thana name ───────────────────────────────────
    if (thanaName) {
      // Find all thana docs with that name (handles ID mismatches)
      const matchingThanas = await Thana.find({ name: thanaName }).lean();
      console.log(matchingThanas)
      const thanaIds = matchingThanas.map((t: any) => t._id);

      if (thanaIds.length > 0) {
        nearest = await Hospital.find({
          thana: { $in: thanaIds },
          _id: { $ne: currentHospital._id },
        })
          .populate(buildNearestPopulate())
          .limit(3)
          .lean();
        console.log(nearest)
      }
    }

    // ── Pass 2: same district name ────────────────────────────────
    if (nearest.length < 3 && districtName) {
      // Find all districts with that name
      const matchingDistricts = await District.find({ name: districtName }).lean();
      const districtIds = matchingDistricts.map((d: any) => d._id);

      // Find all thanas in those districts
      const thanas = await Thana.find({ district: { $in: districtIds } }).lean();
      const thanaIds = thanas.map((t: any) => t._id);

      const existingIds = nearest.map((h: any) => h._id);

      if (thanaIds.length > 0) {
        const more = await Hospital.find({
          thana: { $in: thanaIds },
          _id: { $nin: [currentHospital._id, ...existingIds] },
        })
          .populate(buildNearestPopulate())
          .limit(3 - nearest.length)
          .lean();

        nearest = [...nearest, ...more];
      }
    }

    return NextResponse.json({ hospitals: nearest }, { status: 200 });
  } catch (error: any) {
    console.error("[nearest] Error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}
