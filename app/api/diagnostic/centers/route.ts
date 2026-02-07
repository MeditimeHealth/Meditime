import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DiagnosticCenter from "@/models/DiagnosticCenter";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const division = searchParams.get("division");
    const district = searchParams.get("district");
    const thana = searchParams.get("thana");

    let query: any = {};
    if (division) query.division = division;
    if (district) query.district = district;
    if (thana) query.thana = thana;

    const centers = await DiagnosticCenter.find(query).sort({ name: 1 });
    return NextResponse.json({ centers }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching centers:", error);
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
    const { name, nameBn, division, district, thana, address, phone, email, packageDiscount, minTestsForPackage } = body;

    if (!name && !nameBn) {
      return NextResponse.json(
        { error: "Center name (English or Bangla) is required" },
        { status: 400 }
      );
    }

    const center = await DiagnosticCenter.create({
      name: name || "",
      nameBn: nameBn || "",
      division: division || undefined,
      district: district || undefined,
      thana: thana || undefined,
      address: address || undefined,
      phone: phone || undefined,
      email: email || undefined,
      packageDiscount: packageDiscount || 0,
      minTestsForPackage: minTestsForPackage || 3,
    });

    return NextResponse.json(
      { message: "Diagnostic center created successfully", center },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating center:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

