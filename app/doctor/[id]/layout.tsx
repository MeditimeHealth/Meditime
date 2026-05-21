
import { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import Hospital from "@/models/Hospital";

async function getDoctorData(id: string) {
  try {
    await dbConnect();
    // Try to find by slug (English) or slugBn (Bangla) first
    let doctor = await Doctor.findOne({ slug: id });
    if (!doctor) {
      doctor = await Doctor.findOne({ slugBn: id });
    }
    if (!doctor) {
      // Fallback to ID if not found by slug
      try {
        doctor = await Doctor.findById(id);
      } catch (e) {
        return null;
      }
    }

    console.log(doctor)
    
    if (doctor && doctor.hospital) {
      // Fetch hospital details separately since it's not a reference in the schema
      const hospitalDoc = await Hospital.findOne({ name: doctor.hospital });
      doctor.hospitalDetails = hospitalDoc;
    }
    
    return doctor;
  } catch (error) {
    console.error("Error fetching doctor for metadata:", error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const doctor = await getDoctorData(params.id);
  
  if (!doctor) {
    return {
      title: "Doctor Profile | Meditime",
      description: "View doctor profile and book appointments on Meditime."
    };
  }

  const name = doctor.name || doctor.nameBn || "Doctor";
  const nameBn = doctor.nameBn || name;
  const specialty = doctor.specialty || "";
  const specialtyBn = doctor.specialtyBn || specialty;
  const hospital = doctor.hospital || "";
  const hospitalBn = doctor.hospitalBn || hospital;
  const fees = [doctor.newPatientFee, doctor.reportShowFee].filter(f => f !== undefined && f !== null && f > 0);
  const minFee = fees.length > 0 ? Math.min(...fees) : doctor.newPatientFee;

  const title = `${name} - ${specialty} | Book Appointment | Meditime`;
  
  // Construct Bengali description
  let descriptionBn = `অনলাইনে ${nameBn}-এর সিরিয়াল দিন। উনি একজন ${specialtyBn}`;
  if (hospitalBn) {
    descriptionBn += `, চেম্বার: ${hospitalBn}`;
  }
  if (minFee) {
    descriptionBn += `। ভিজিট ফি: ${minFee} টাকা`;
  }
  descriptionBn += `। Book appointment now on Meditime.`;

  // Limit to 155 characters for SEO
  const finalDescription = descriptionBn.length > 155 
    ? descriptionBn.substring(0, 152) + "..." 
    : descriptionBn;

  return {
    title,
    description: finalDescription,
    alternates: {
      canonical: `https://meditime.com.bd/doctor/${doctor.slug || doctor.slugBn || doctor._id}`,
    },
    openGraph: {
      title,
      description: finalDescription,
      images: [doctor.image || "/logo.png"],
      type: "profile",
    }
  };
}

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
