import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DiagnosticTest from "@/models/DiagnosticTest";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    let query: any = {};
    if (category) {
      query.category = category;
    }

    const tests = await DiagnosticTest.find(query).sort({ name: 1 });
    return NextResponse.json({ tests }, { status: 200 });
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
    const { name, nameBn, description, descriptionBn, price, image } = body;

    // Must have at least one name (English or Bangla) and price
    if ((!name && !nameBn) || !price) {
      return NextResponse.json(
        { error: "Name (English or Bangla) and price are required" },
        { status: 400 }
      );
    }

    const test = await DiagnosticTest.create({
      name: name || "",
      nameBn: nameBn || "",
      description: description || undefined,
      descriptionBn: descriptionBn || undefined,
      price,
      image: image || undefined,
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
    const { id, name, description, price, image } = body;

    if (!id || !name || !price) {
      return NextResponse.json(
        { error: "ID, name, and price are required" },
        { status: 400 }
      );
    }

    const test = await DiagnosticTest.findByIdAndUpdate(
      id,
      {
        name,
        description: description || undefined,
        price,
        image: image || undefined,
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

