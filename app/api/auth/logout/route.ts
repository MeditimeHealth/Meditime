import { NextResponse } from "next/server";

export async function POST() {
  try {
    // In a real app, you might invalidate sessions/tokens here
    // For now, we'll just return success and handle client-side cleanup
    return NextResponse.json(
      { message: "Logout successful" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

