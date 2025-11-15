import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import Hospital from "@/models/Hospital";
import Thana from "@/models/Thana";
import District from "@/models/District";
import Division from "@/models/Division";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Ensure all models are registered by accessing them
    // This forces Mongoose to register the schemas before population
    void District;
    void Division;
    void Thana;
    
    const { searchParams } = new URL(request.url);
    const thanaId = searchParams.get("thana");

    let query: any = {};
    if (thanaId) {
      query.thana = thanaId;
    }

    const hospitals = await Hospital.find(query)
      .populate({
        path: "thana",
        select: "name",
        populate: {
          path: "district",
          select: "name",
          model: District,
          populate: { 
            path: "division", 
            select: "name",
            model: Division,
          },
        },
      })
      .sort({ name: 1 })
      .lean();
    
    return NextResponse.json({ hospitals }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching hospitals:", error);
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
    const { name, thana, address, phone, email } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Hospital name is required" },
        { status: 400 }
      );
    }

    // Verify thana exists if provided
    if (thana) {
      const thanaExists = await Thana.findById(thana);
      if (!thanaExists) {
        return NextResponse.json(
          { error: "Thana not found" },
          { status: 404 }
        );
      }
    }

    const hospital = await Hospital.create({
      name,
      thana: thana || undefined,
      address: address || undefined,
      phone: phone || undefined,
      email: email || undefined,
    });

    return NextResponse.json(
      { message: "Hospital created successfully", hospital },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating hospital:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

