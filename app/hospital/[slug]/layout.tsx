import { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Hospital from "@/models/Hospital";

async function getHospitalData(slug: string) {
  try {
    await dbConnect();
    const decodedSlug = decodeURIComponent(slug);
    let hospital = await Hospital.findOne({ slug: decodedSlug }).populate({
      path: 'thana',
      populate: {
        path: 'district'
      }
    });
    
    if (!hospital) {
      hospital = await Hospital.findOne({ name: decodedSlug }).populate({
        path: 'thana',
        populate: {
          path: 'district'
        }
      });
    }
    return hospital;
  } catch (error) {
    console.error("Error fetching hospital for metadata:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const hospital = await getHospitalData(params.slug);
  
  if (!hospital) {
    return {
      title: "Hospital Details | Meditime",
      description: "View specialist doctors and book appointments at top hospitals on Meditime."
    };
  }

  const name = hospital.name;
  const nameBn = hospital.nameBn || name;
  const district = hospital.thana?.district?.name || "";
  const districtBn = hospital.thana?.district?.nameBn || district;

  const title = `Best Doctors at ${name}${district ? `, ${district}` : ""} | Meditime`;
  const description = `${nameBn}-এর সকল বিশেষজ্ঞ ডাক্তারের তালিকা ও সিরিয়াল দেওয়ার সময়সূচী দেখুন। সহজে অনলাইনে অ্যাপয়েন্টমেন্ট বুক করুন Meditime-এ।`;

  return {
    title,
    description: description.substring(0, 155),
    alternates: {
      canonical: `https://meditime.com.bd/hospital/${hospital.slug || hospital.name}`,
    },
    openGraph: {
      title,
      description,
      images: ["/logo.png"],
    }
  };
}

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
