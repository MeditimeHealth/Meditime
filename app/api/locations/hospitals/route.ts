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
    const searchTerm = searchParams.get("search") || "";
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    const limit = Number.isNaN(limitParam) ? 20 : Math.max(1, limitParam);
    const page = Number.isNaN(pageParam) ? 1 : Math.max(1, pageParam);

    let query: any = {};
    if (thanaId) {
      query.thana = thanaId;
    }
    if (searchTerm) {
      query.name = { $regex: searchTerm, $options: "i" };
    }

    const skip = (page - 1) * limit;

    const hospitals = await Hospital.find(query)
      .populate({
        path: "thana",
        select: "name nameBn",
        populate: {
          path: "district",
          select: "name nameBn",
          model: District,
          populate: { 
            path: "division", 
            select: "name nameBn",
            model: Division,
          },
        },
      })
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await Hospital.countDocuments(query);
    const hasMore = skip + hospitals.length < totalCount;
    
    return NextResponse.json({ hospitals, hasMore }, { status: 200 });
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
    const { name, nameBn, thana, address, phone, email } = body;

    if (!name && !nameBn) {
      return NextResponse.json(
        { error: "Hospital name (English or Bangla) is required" },
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
      name: name || "",
      thana: thana || undefined,
      address: address || undefined,
      phone: phone || undefined,
      email: email || undefined,
      
      // Bangla Fields
      nameBn: body.nameBn || undefined,
      addressBn: body.addressBn || undefined,
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

