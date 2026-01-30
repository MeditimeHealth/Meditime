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
        // Since we only want one active popup for now, or the latest one config
        // We will fetch the most recently updated one, or create a default if none exists
        let popup = await Popup.findOne().sort({ updatedAt: -1 });

        if (!popup) {
            // Return null or a default structure
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

        // For this feature, we might want to just maintain a SINGLE popup document
        // So we can check if one exists and update it, or create if not.
        // Or we just create new ones and "isActive" toggle logic handles which one shows.
        // Let's go with: Update the existing one if it exists, or create new. 
        // Actually simplest for a "settings" style popup is to just have one document that gets updated.

        let popup = await Popup.findOne();

        if (popup) {
            popup.title = data.title;
            popup.description = data.description;
            popup.imageUrl = data.imageUrl;
            popup.buttonText = data.buttonText;
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
