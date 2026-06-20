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
    const decodedId = decodeURIComponent(id);
    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get('language') || 'en';

    let doctor: any;
    if (decodedId.match(/^[0-9a-fA-F]{24}$/)) {
      doctor = await Doctor.findById(decodedId).lean();
    }
    if (!doctor) {
      doctor = await Doctor.findOne({ slug: decodedId }).lean();
    }

    if (!doctor) {
      return NextResponse.json({ doctors: [] }, { status: 200 });
    }

    // Extract current doctor properties
    const currentDept = doctor.department;
    const currentHospitals = doctor.availability?.map((slot: any) => slot.hospital).filter(Boolean) || [];

    // Find candidates: same department OR same hospital
    // We only need a reasonable number of candidates to sort
    const query: any = { _id: { $ne: doctor._id } };
    
    const orConditions = [];
    if (currentDept) orConditions.push({ department: currentDept });
    if (currentHospitals.length > 0) orConditions.push({ "availability.hospital": { $in: currentHospitals } });

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    let candidates = await Doctor.find(query).limit(100).lean() as any[];

    // If in Bangla mode, prioritize/filter doctors with Bangla names
    if (language === 'bn') {
      const withBn = candidates.filter(d => d.nameBn);
      if (withBn.length >= 4) {
        candidates = withBn;
      } else {
        candidates = candidates.sort((a, b) => {
          if (a.nameBn && !b.nameBn) return -1;
          if (!a.nameBn && b.nameBn) return 1;
          return 0;
        });
      }
    }

    // Sort by relevance score
    const sorted = candidates.sort((a, b) => {
      // Relevance A
      let relevanceA = 0;
      if (a.department === currentDept) relevanceA += 10;
      const aHospitals = a.availability?.map((slot: any) => slot.hospital).filter(Boolean) || [];
      if (aHospitals.some((h: any) => currentHospitals.includes(h))) relevanceA += 5;

      // Relevance B
      let relevanceB = 0;
      if (b.department === currentDept) relevanceB += 10;
      const bHospitals = b.availability?.map((slot: any) => slot.hospital).filter(Boolean) || [];
      if (bHospitals.some((h: any) => currentHospitals.includes(h))) relevanceB += 5;

      // Secondary sort by relevance
      if (relevanceA !== relevanceB) return relevanceB - relevanceA;

      // Tertiary sort: prioritize doctors with images if scores are same
      if (a.image && !b.image) return -1;
      if (!a.image && b.image) return 1;

      return 0;
    });

    return NextResponse.json({ doctors: sorted.slice(0, 4) }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching related doctors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
