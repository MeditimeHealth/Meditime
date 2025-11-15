import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Disease from "@/models/Disease";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const diseases = await Disease.find({}).sort({ bangla: 1 });
    return NextResponse.json({ diseases }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching diseases:", error);
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
    const { name, bangla } = body;

    if (!name || !bangla) {
      return NextResponse.json(
        { error: "Name and Bengali name are required" },
        { status: 400 }
      );
    }

    const disease = await Disease.create({ name, bangla });
    return NextResponse.json(
      { message: "Disease created successfully", disease },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating disease:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Disease with this name already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

