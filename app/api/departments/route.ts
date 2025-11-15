import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Department from "@/models/Department";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const departments = await Department.find({}).sort({ name: 1 });
    return NextResponse.json({ departments }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching departments:", error);
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
    const { name, bangla, emoji, icon } = body;

    if (!name || !bangla || !emoji) {
      return NextResponse.json(
        { error: "Name, Bengali name, and emoji are required" },
        { status: 400 }
      );
    }

    const department = await Department.create({ name, bangla, emoji, icon });
    return NextResponse.json(
      { message: "Department created successfully", department },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating department:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Department already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

