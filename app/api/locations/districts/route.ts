import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import District from "@/models/District";
import Division from "@/models/Division";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const divisionId = searchParams.get("division");

    let query: any = {};
    if (divisionId) {
      // Guard against both string-stored and ObjectId-stored references
      // (data may have been imported with plain strings instead of ObjectIds)
      if (mongoose.Types.ObjectId.isValid(divisionId)) {
        const oid = new mongoose.Types.ObjectId(divisionId);
        query.$or = [{ division: oid }, { division: divisionId }];
      } else {
        query.division = divisionId;
      }
    }

    const districts = await District.find(query)
      .populate("division", "name")
      .sort({ name: 1 });
    return NextResponse.json({ districts }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching districts:", error);
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
    const { name, nameBn, division } = body;

    if ((!name && !nameBn) || !division) {
      return NextResponse.json(
        { error: "District name (English or Bangla) and division are required" },
        { status: 400 }
      );
    }

    // Verify division exists
    const divisionExists = await Division.findById(division);
    if (!divisionExists) {
      return NextResponse.json(
        { error: "Division not found" },
        { status: 404 }
      );
    }

    const district = await District.create({ 
      name: name || "", 
      nameBn: nameBn || "",
      division 
    });
    return NextResponse.json(
      { message: "District created successfully", district },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating district:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "District already exists in this division" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

