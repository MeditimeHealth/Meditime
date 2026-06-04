import { NextRequest, NextResponse } from "next/server";

// ImgBB API endpoint
const IMGBB_API_URL = "https://api.imgbb.com/1/upload";

export async function POST(request: NextRequest) {
  try {
    const requestFormData = await request.formData();
    const file = requestFormData.get("image") as File;
    const apiKey = process.env.IMGBB_API_KEY || process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ImgBB API key not configured" },
        { status: 500 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString("base64");

    // Upload to ImgBB using form-urlencoded
    const uploadParams = new URLSearchParams();
    uploadParams.append("key", apiKey);
    uploadParams.append("image", base64Image);

    const response = await fetch(IMGBB_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: uploadParams.toString(),
    });

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(
        { error: data.error?.message || "Failed to upload image" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        url: data.data.url,
        displayUrl: data.data.display_url,
        thumbUrl: data.data.thumb?.url || data.data.url,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error uploading to ImgBB:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

