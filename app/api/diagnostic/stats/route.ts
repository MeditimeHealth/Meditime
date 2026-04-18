import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import DiagnosticTest from "@/models/DiagnosticTest";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    // Aggregate to count tests per department
    const stats = await DiagnosticTest.aggregate([
      { $unwind: "$departments" },
      {
        $group: {
          _id: "$departments",
          count: { $sum: 1 }
        }
      }
    ]);

    // Convert array of { _id: "Blood", count: 5 } to an object { Blood: 5 }
    // Or just return the array. The frontend can find the item by id.
    const countsMap = stats.reduce((acc: Record<string, number>, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return NextResponse.json({ stats: countsMap }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
