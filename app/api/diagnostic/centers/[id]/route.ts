import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DiagnosticCenter from "@/models/DiagnosticCenter";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const center = await DiagnosticCenter.findByIdAndDelete(id);
    
    if (!center) {
      return NextResponse.json(
        { error: "Diagnostic center not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Diagnostic center deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting diagnostic center:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

