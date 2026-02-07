import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Division from "@/models/Division";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const divisions = await Division.find({}).sort({ name: 1 });
    return NextResponse.json({ divisions }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching divisions:", error);
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
    const { name, nameBn } = body;

    if (!name && !nameBn) {
      return NextResponse.json(
        { error: "Division name (English or Bangla) is required" },
        { status: 400 }
      );
    }

    const division = await Division.create({ 
      name: name || "", 
      nameBn: nameBn || "" 
    });
    return NextResponse.json(
      { message: "Division created successfully", division },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating division:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Division already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

