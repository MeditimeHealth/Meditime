import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DiagnosticTest from "@/models/DiagnosticTest";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const test = await DiagnosticTest.findById(id);
    
    if (!test) {
      return NextResponse.json(
        { error: "Diagnostic test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ test }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching diagnostic test:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const test = await DiagnosticTest.findByIdAndDelete(id);
    
    if (!test) {
      return NextResponse.json(
        { error: "Diagnostic test not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Diagnostic test deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting diagnostic test:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

