import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DiagnosticTest from "@/models/DiagnosticTest";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "9"); // 9 items per page (3x3 grid)

    const skip = (page - 1) * limit;

    let query: any = {};
    if (category) {
      query.departments = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { nameBn: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { descriptionBn: { $regex: search, $options: "i" } },
      ];
    }

    const totalTests = await DiagnosticTest.countDocuments(query);
    const totalPages = Math.ceil(totalTests / limit);

    const tests = await DiagnosticTest.find(query)
      .sort({ serialNumber: -1, name: 1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({ 
      tests, 
      totalPages, 
      currentPage: page, 
      totalTests 
    }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching tests:", error);
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
    const { serialNumber, name, nameBn, description, descriptionBn, price, recommendations, departments } = body;

    // Must have at least one name (English or Bangla) and price
    if ((!name && !nameBn) || !price) {
      return NextResponse.json(
        { error: "Name (English or Bangla) and price are required" },
        { status: 400 }
      );
    }

    const test = await DiagnosticTest.create({
      serialNumber: serialNumber || 0,
      name: name || "",
      nameBn: nameBn || "",
      description: description || undefined,
      descriptionBn: descriptionBn || undefined,
      price,
      recommendations: recommendations || [],
      departments: departments || [],
    });

    return NextResponse.json(
      { message: "Test created successfully", test },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating test:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, serialNumber, name, nameBn, description, descriptionBn, price, recommendations, departments } = body;

    if (!id || (!name && !nameBn) || !price) {
      return NextResponse.json(
        { error: "ID, Name (English or Bangla), and price are required" },
        { status: 400 }
      );
    }

    const test = await DiagnosticTest.findByIdAndUpdate(
      id,
      {
        serialNumber: serialNumber || 0,
        name: name || "",
        nameBn: nameBn || "",
        description: description || undefined,
        descriptionBn: descriptionBn || undefined,
        price,
        recommendations: recommendations || [],
        departments: departments || [],
      },
      { new: true }
    );

    if (!test) {
      return NextResponse.json(
        { error: "Test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Test updated successfully", test },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating test:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

