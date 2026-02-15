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
      .sort({ createdAt: -1 });
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
      const diseasesToCreate = names.map((n: string, index: number) => {
        const bnName = body.banglas && Array.isArray(body.banglas) ? body.banglas[index] : undefined;
        return {
          name: n,
          bangla: bnName || bangla || n, // Use specific bangla, or fallback to single bangla, or fallback to name
          department: departmentId || undefined
        };
      });

      // Filter out invalid entries (must have name OR bangla)
      const validDiseases = diseasesToCreate.filter((d: any) => d.name || d.bangla);

      if (validDiseases.length === 0) {
          return NextResponse.json(
            { error: "At least one name (English or Bangla) is required" },
            { status: 400 }
          );
      }
      
      const createdDiseases = [];
      const errors = [];

      for (const diseaseData of validDiseases) {
        try {
          // Check for duplicate (by name if present, or bangla if present)
          const query: any = {};
          if (diseaseData.name) query.name = diseaseData.name;
          // We could check bangla duplicate too but maybe lenient? 
          // Let's check name if exists.
          
          if (diseaseData.name) {
             const existing = await Disease.findOne({ name: diseaseData.name });
             if (existing) {
               errors.push(`Disease '${diseaseData.name}' already exists`);
               continue;
             }
          }

          const disease = await Disease.create(diseaseData);
          createdDiseases.push(disease);
        } catch (err: any) {
          errors.push(`Failed to create '${diseaseData.name || diseaseData.bangla}': ${err.message}`);
        }
      }

      return NextResponse.json(
        { 
          message: `Processed ${validDiseases.length} diseases`, 
          created: createdDiseases,
          errors: errors.length > 0 ? errors : undefined
        },
        { status: 201 }
      );
    }

    // Handle single creation
    if (!name && !bangla) {
      return NextResponse.json(
        { error: "Name (English or Bangla) is required" },
        { status: 400 }
      );
    }

    const disease = await Disease.create({ 
      name: name || "", 
      bangla: bangla || name || "", 
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

