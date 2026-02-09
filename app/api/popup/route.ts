import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Popup from "@/models/Popup";

// Helper to connect to DB
const connectDB = async () => {
    if (mongoose.connections[0].readyState) {
        return;
    }
    try {
        await mongoose.connect(process.env.MONGODB_URI!);
    } catch (error) {
        console.error("DB Connection Error:", error);
        throw new Error("Failed to connect to database");
    }
};

export async function GET() {
    try {
        await connectDB();
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
        await connectDB();
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
