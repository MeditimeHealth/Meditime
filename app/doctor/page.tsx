import DoctorListPageClient from './DoctorListPageClient';
import { Metadata } from 'next';
import dbConnect from '@/lib/mongodb';
import Doctor from '@/models/Doctor';
import Department from '@/models/Department';
import Hospital from '@/models/Hospital';

export async function generateMetadata(): Promise<Metadata> {
  try {
    await dbConnect();
    const [doctorCount, deptCount, hospitalCount] = await Promise.all([
      Doctor.countDocuments(),
      Department.countDocuments(),
      Hospital.countDocuments(),
    ]);

    return {
      title: `Find ${doctorCount > 0 ? doctorCount : 500}+ doctors from ${deptCount > 0 ? deptCount : 40}+ Departments in one place | Meditime`,
      description: `Book Appointments with doctors from reputed ${hospitalCount > 0 ? hospitalCount : 50}+ hospitals in Savar, Ashulia, Gazipur, or Kaliyakoir. View profiles, ratings, and available slots.`,
    };
  } catch (error) {
    return {
      title: 'Find Doctors from Top Departments in one place | Meditime',
      description: 'Book Appointments with doctors from reputed hospitals in Savar, Ashulia, Gazipur, or Kaliyakoir. View profiles, ratings, and available slots.',
    };
  }
}

async function getSchemaData() {
  try {
    await dbConnect();
    const [totalCount, doctors] = await Promise.all([
      Doctor.countDocuments(),
      Doctor.find({}, { name: 1, nameBn: 1, slug: 1, specialty: 1 })
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
    ]);
    return { totalCount, doctors };
  } catch {
    return { totalCount: 0, doctors: [] };
  }
}

export default async function DoctorListPage() {
  const { totalCount, doctors } = await getSchemaData();

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Find Doctors in Savar, Dhaka",
    "url": "https://meditime.com.bd/doctor",
    "description": "Browse and book appointments with top verified doctors in Savar, Dhaka.",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": totalCount,
      "itemListElement": (doctors as any[]).map((doctor, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Physician",
          "name": doctor.name || doctor.nameBn || "",
          "url": `https://meditime.com.bd/doctor/${doctor.slug || doctor._id}`,
          "medicalSpecialty": doctor.specialty || undefined,
        }
      }))
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home",    "item": "https://meditime.com.bd" },
      { "@type": "ListItem", "position": 2, "name": "Doctors", "item": "https://meditime.com.bd/doctor" }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <DoctorListPageClient />
    </>
  );
}
