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
    const { name, category, description, price, originalPrice, duration, preparation, fastingRequired } = body;

    if (!name || !category || !price) {
      return NextResponse.json(
        { error: "Name, category, and price are required" },
        { status: 400 }
      );
    }

    const test = await DiagnosticTest.create({
      name,
      category,
      description: description || undefined,
      price,
      originalPrice: originalPrice || undefined,
      duration: duration || undefined,
      preparation: preparation || undefined,
      fastingRequired: fastingRequired || false,
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

