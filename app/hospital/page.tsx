import HospitalListClient from './HospitalListClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hospitals & Clinics | Meditime',
  description: 'Explore top hospitals and clinics listed on Meditime. Find the right facility by location, specialty, and available services.',
};

export default function HospitalListPage() {
  return <HospitalListClient />;
}
