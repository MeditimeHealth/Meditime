import { NextResponse } from "next/server";
import Popup from "@/models/Popup";
import dbConnect from "@/lib/mongodb";

export async function GET() {
    try {
        await dbConnect();
        let popup = await Popup.findOne().sort({ updatedAt: -1 });

        if (!popup) {
             return NextResponse.json({ success: true, popup: null });
        }

        return NextResponse.json({ success: true, popup });
    } catch (error) {
        console.error("Error fetching popup:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch popup" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const data = await request.json();

        let popup = await Popup.findOne();

        if (popup) {
            popup.title = data.title;
            popup.titleBn = data.titleBn;
            popup.description = data.description;
            popup.descriptionBn = data.descriptionBn;
            popup.imageUrl = data.imageUrl;
            popup.buttonText = data.buttonText;
            popup.buttonTextBn = data.buttonTextBn;
            popup.buttonLink = data.buttonLink;
            popup.isActive = data.isActive;
            await popup.save();
        } else {
            popup = await Popup.create(data);
        }

        return NextResponse.json({ success: true, popup });
    } catch (error) {
        console.error("Error saving popup:", error);
        return NextResponse.json(
            { success: false, error: "Failed to save popup" },
            { status: 500 }
        );
    }
}
