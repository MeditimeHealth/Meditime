import HospitalDetailClient from "./HospitalDetailClient";
import { Metadata, ResolvingMetadata } from "next";
import dbConnect from "@/lib/mongodb";
import Hospital from "@/models/Hospital";
import mongoose from "mongoose";
import { cookies } from "next/headers";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    await dbConnect();

    const { slug } = await params;

    const decodedSlug = decodeURIComponent(slug);

    let hospital: any = null;

    // Find by Mongo ID
    if (mongoose.Types.ObjectId.isValid(decodedSlug)) {
      hospital = await Hospital.findById(decodedSlug)
        .populate({
          path: "thana",
          populate: {
            path: "district",
            populate: {
              path: "division",
            },
          },
        })
        .lean();
    } else {
      // Find by slug or name
      hospital = await Hospital.findOne({
        $or: [
          { slug: decodedSlug },
          { name: decodedSlug },
          { nameBn: decodedSlug },
        ],
      })
        .populate({
          path: "thana",
          populate: {
            path: "district",
            populate: {
              path: "division",
            },
          },
        })
        .lean();
    }

    if (!hospital) {
      return {
        title: "Hospital Not Found | Meditime",
        description:
          "Hospital information could not be found.",
      };
    }

    const cookieStore = await cookies();

    const language =
      cookieStore.get("meditime-language")?.value || "en";

    // Language-aware fields
    const hospitalName =
      language === "bn"
        ? hospital.nameBn || hospital.name
        : hospital.name || hospital.nameBn;

    const divisionName =
      language === "bn"
        ? hospital?.thana?.district?.division?.nameBn ||
          hospital?.thana?.district?.division?.name
        : hospital?.thana?.district?.division?.name;

    const districtName =
      language === "bn"
        ? hospital?.thana?.district?.nameBn ||
          hospital?.thana?.district?.name
        : hospital?.thana?.district?.name;

    const thanaName =
      language === "bn"
        ? hospital?.thana?.nameBn ||
          hospital?.thana?.name
        : hospital?.thana?.name;

    const parts: string[] = [];

    if (divisionName) parts.push(divisionName);
    if (districtName) parts.push(districtName);
    if (thanaName) parts.push(thanaName);

    const locationString =
      parts.join(", ") ||
      (language === "bn" ? "আপনার এলাকায়" : "your area");

    const title =
      language === "bn"
        ? `${hospitalName} | ডাক্তার, সেবা ও অ্যাপয়েন্টমেন্ট | Meditime`
        : `${hospitalName} - Doctors, Services & Appointments | Meditime`;

    const description =
      language === "bn"
        ? `${hospitalName}-এ ডাক্তার দেখানোর সিরিয়াল বুক করুন। উপলব্ধ ডাক্তার, সেবা ও ডায়াগনস্টিক টেস্ট দেখুন।`
        : `Book appointments at ${hospitalName} in ${locationString}. Find available doctors, services, and diagnostic tests.`;

    return {
      title,

      description,

      alternates: {
        canonical: `https://meditime.com.bd/hospital/${
          hospital.slug || hospital._id
        }`,
      },

      openGraph: {
        title,
        description,
        images: [
          {
            url: hospital.image || "/logo.png",
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [hospital.image || "/logo.png"],
      },
    };
  } catch (error) {
    console.error("Hospital metadata error:", error);

    return {
      title: "Hospital Details | Meditime",
      description:
        "View specialist doctors and book appointments on Meditime.",
    };
  }
}

export default function HospitalDetailPage() {
  return <HospitalDetailClient />;
}