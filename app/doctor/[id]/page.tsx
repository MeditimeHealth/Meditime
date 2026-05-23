import DoctorProfileClient from "./DoctorProfileClient";
import { Metadata, ResolvingMetadata } from "next";
import dbConnect from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { cookies } from "next/headers";

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    await dbConnect();

    const { id } = await params;
    const decodedId = decodeURIComponent(id);

    let query = {};

    // Check if Mongo ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(decodedId)) {
      query = { _id: decodedId };
    } else {
      query = {
        $or: [
          { slug: decodedId },
          { slugBn: decodedId },
        ],
      };
    }

    const doctor: any = await Doctor.findOne(query).lean();

    if (!doctor) {
      return {
        title: "Doctor Profile | Meditime",
        description:
          "View doctor profile and book appointments on Meditime.",
      };
    }

    const cookieStore = await cookies();

    const language =
      cookieStore.get("meditime-language")?.value || "en";

    // Language-aware fields
    const docName =
      language === "bn"
        ? doctor.nameBn || doctor.name
        : doctor.name || doctor.nameBn;

    const docSpecialty =
      language === "bn"
        ? doctor.specialtyBn || doctor.specialty
        : doctor.specialty || doctor.specialtyBn;

    const docDistrict =
      language === "bn"
        ? doctor.districtBn || doctor.district
        : doctor.district || doctor.districtBn || "Dhaka";

    const hospitalName =
      language === "bn"
        ? doctor.hospitalBn || doctor.hospital
        : doctor.hospital || doctor.hospitalBn || "reputed hospital";

    const title =
      language === "bn"
        ? `${docName} - ${docSpecialty} | Meditime`
        : `${docName} - ${docSpecialty} in ${docDistrict} | Meditime`;

    const description =
      language === "bn"
        ? `${hospitalName}-এ ${docSpecialty} বিশেষজ্ঞ ${docName}-এর অ্যাপয়েন্টমেন্ট বুক করুন।`
        : `Book an appointment with ${docName}, ${docSpecialty} specialist at ${hospitalName}.`;

    return {
      title,

      description,

      alternates: {
        canonical: `https://meditime.com.bd/doctor/${
          doctor.slug ||
          doctor.slugBn ||
          doctor._id
        }`,
      },

      openGraph: {
        title,
        description,
        type: "profile",
        images: [
          {
            url: doctor.image || "/logo.png",
          },
        ],
      },

      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [doctor.image || "/logo.png"],
      },
    };
  } catch (error) {
    console.error("Metadata generation error:", error);

    return {
      title: "Doctor Profile | Meditime",
      description:
        "View doctor profile and book appointments on Meditime.",
    };
  }
}

export default function DoctorProfilePage() {
  return <DoctorProfileClient />;
}