import { NextResponse } from "next/server";
import mongoose from "mongoose";
import ContactMessage from "@/models/ContactMessage";

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  return mongoose.connect(process.env.MONGODB_URI!);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const { status } = await req.json();
    const updated = await ContactMessage.findByIdAndUpdate(id, { status }, { new: true });
    return NextResponse.json({ success: true, message: updated });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    await ContactMessage.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
