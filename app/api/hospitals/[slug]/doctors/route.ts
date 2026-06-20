import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Doctor from "@/models/Doctor";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await dbConnect();
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);

    // Search doctor data schema's availability slots for the hospital slug
    const doctors = await Doctor.find({
      "availability.hospital": decodedSlug
    }).lean();

    return NextResponse.json({ doctors }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching hospital doctors:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
