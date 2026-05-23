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

export default function DoctorListPage() {
  return <DoctorListPageClient />;
}
