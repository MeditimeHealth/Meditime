import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Thana from "@/models/Thana";
import District from "@/models/District";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const districtId = searchParams.get("district");

    let query: any = {};
    if (districtId) {
      query.district = districtId;
    }

    const thanas = await Thana.find(query)
      .populate("district", "name")
      .populate({ path: "district", populate: { path: "division", select: "name" } })
      .sort({ name: 1 });
    return NextResponse.json({ thanas }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching thanas:", error);
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
    const { name, district } = body;

    if (!name || !district) {
      return NextResponse.json(
        { error: "Thana name and district are required" },
        { status: 400 }
      );
    }

    // Verify district exists
    const districtExists = await District.findById(district);
    if (!districtExists) {
      return NextResponse.json(
        { error: "District not found" },
        { status: 404 }
      );
    }

    const thana = await Thana.create({ name, district });
    return NextResponse.json(
      { message: "Thana created successfully", thana },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating thana:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Thana already exists in this district" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

