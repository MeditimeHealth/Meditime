import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Hospital from "@/models/Hospital";
import mongoose from "mongoose";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    await dbConnect();
    // Handle both Next.js 15 (Promise) and earlier versions
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;

    if (!id) {
      return NextResponse.json(
        { error: "Hospital ID is required" },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid hospital ID format" },
        { status: 400 }
      );
    }

    console.log("Attempting to delete hospital with ID:", id);

    const hospital = await Hospital.findByIdAndDelete(id);
    
    if (!hospital) {
      console.log("Hospital not found with ID:", id);
      // Check if any hospital exists with similar ID (for debugging)
      const allHospitals = await Hospital.find({}).limit(5).select("_id name");
      console.log("Sample hospital IDs in database:", allHospitals.map(h => ({ id: h._id.toString(), name: h.name })));
      return NextResponse.json(
        { error: "Hospital not found" },
        { status: 404 }
      );
    }

    console.log("Hospital deleted successfully:", hospital.name);
    return NextResponse.json(
      { message: "Hospital deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting hospital:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

