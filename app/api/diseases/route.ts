import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Disease from "@/models/Disease";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const departmentFilter = searchParams.get("department");
    
    // Build query
    const query: any = {};
    if (departmentFilter) {
      query.department = departmentFilter;
    }
    
    const diseases = await Disease.find(query)
      .populate('department', 'name bangla emoji')
      .sort({ bangla: 1 });
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
    const { name, names, bangla, departmentId } = body;

    // Validate department if provided
    if (departmentId) {
      const Department = (await import("@/models/Department")).default;
      const departmentExists = await Department.findById(departmentId);
      if (!departmentExists) {
        return NextResponse.json(
          { error: "Invalid department selected" },
          { status: 400 }
        );
      }
    }

    // Handle bulk creation
    if (names && Array.isArray(names) && names.length > 0) {
      const diseasesToCreate = names.map((n: string) => ({
        name: n,
        bangla: bangla || n, // Use same name if bangla not provided
        department: departmentId || undefined
      }));

      // Use insertMany but we need to handle potential duplicates gracefully
      // However, insertMany with ordered: false might be better, or just loop
      // For simplicity and error reporting, let's loop or use Promise.all
      
      const createdDiseases = [];
      const errors = [];

      for (const diseaseData of diseasesToCreate) {
        try {
          // Check for duplicate
          const existing = await Disease.findOne({ name: diseaseData.name });
          if (existing) {
            errors.push(`Disease '${diseaseData.name}' already exists`);
            continue;
          }
          const disease = await Disease.create(diseaseData);
          createdDiseases.push(disease);
        } catch (err: any) {
          errors.push(`Failed to create '${diseaseData.name}': ${err.message}`);
        }
      }

      return NextResponse.json(
        { 
          message: `Processed ${names.length} diseases`, 
          created: createdDiseases,
          errors: errors.length > 0 ? errors : undefined
        },
        { status: 201 }
      );
    }

    // Handle single creation (legacy support or single entry)
    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const disease = await Disease.create({ 
      name, 
      bangla: bangla || name, 
      department: departmentId || undefined 
    });
    
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

