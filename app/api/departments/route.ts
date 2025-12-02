import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Department from "@/models/Department";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const nameFilter = searchParams.get("name");
    
    // Build query
    const query: any = {};
    if (nameFilter) {
      query.name = nameFilter;
    }
    
    const departments = await Department.find(query).sort({ name: 1 });
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
    const { name, image } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Department name is required" },
        { status: 400 }
      );
    }

    const department = await Department.create({ 
      name, 
      image 
    });
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

