import { NextResponse } from "next/server";
import AppImageSetting from "@/models/AppImageSetting";
import dbConnect from "@/lib/mongodb";

export async function GET() {
  try {
    await dbConnect();
    
    // Retrieve the latest active AppImageSetting
    const setting = await AppImageSetting.findOne({ isActive: true }).sort({ updatedAt: -1 });
    
    return NextResponse.json({ success: true, appImage: setting });
  } catch (error: any) {
    console.error("Error fetching app image setting:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch app image setting" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();

    if (!data.imageUrl) {
      return NextResponse.json(
        { success: false, error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Try to find the existing single setting document, or create a new one
    let setting = await AppImageSetting.findOne();

    if (setting) {
      setting.imageUrl = data.imageUrl;
      setting.isActive = data.isActive !== undefined ? data.isActive : true;
      await setting.save();
    } else {
      setting = await AppImageSetting.create({
        imageUrl: data.imageUrl,
        isActive: data.isActive !== undefined ? data.isActive : true,
      });
    }

    return NextResponse.json({ success: true, appImage: setting });
  } catch (error: any) {
    console.error("Error saving app image setting:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save app image setting" },
      { status: 500 }
    );
  }
}
