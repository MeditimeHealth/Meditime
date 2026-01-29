"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Clock } from "lucide-react";

export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  qualification: string;
  designation?: string;
  phoneNumber: string;
  email?: string;
  hospital?: string;
  division?: string;
  district?: string;
  thana?: string;
  department?: string;
  consultationFee: number;
  oldPatientFee?: number;
  newPatientFee?: number;
  diseases?: string[];
  slotDuration?: number;
  availability:
    | Array<{
        days: string[];
        time: string;
      }>
    | {
        days: string[];
        time: string;
      };
  bio?: string;
  image?: string;
  rating?: number;
}

interface DoctorCardProps {
  doctor: Doctor;
  index?: number;
}

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const banglaDays = [
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
  "রবিবার",
];

// Helper functions
const getBengaliDay = (day: string): string => {
  const dayIndex = daysOfWeek.indexOf(day);
  return dayIndex >= 0 ? banglaDays[dayIndex] : day;
};

const formatAvailability = (
  availability:
    | Array<{ days: string[]; time: string }>
    | { days: string[]; time: string },
): string => {
  // Handle backward compatibility - convert old format to array
  const slots = Array.isArray(availability) ? availability : [availability];

  return slots
    .map((slot) => {
      const sortedDays = slot.days.sort((a, b) => {
        return daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b);
      });

      let timeRange = "";
      if (sortedDays.length === 1) {
        const day = getBengaliDay(sortedDays[0]);
        const time = slot.time || "";
        timeRange = `${day} ${time}`;
      } else {
        const firstDay = getBengaliDay(sortedDays[0]);
        const lastDay = getBengaliDay(sortedDays[sortedDays.length - 1]);
        const time = slot.time || "";
        timeRange = `${firstDay} থেকে ${lastDay} ${time}`;
      }
      return timeRange;
    })
    .join("। ");
};

export default function DoctorCard({ doctor, index = 0 }: DoctorCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -3 }}
    >
      <Link href={`/doctor/${doctor._id}`}>
        <Card className="p-6 bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-300 h-full cursor-pointer">
          <div className="space-y-4">
            {/* Doctor Image */}
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100">
              {doctor.image ? (
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="12"
                      cy="8"
                      r="4"
                      fill="currentColor"
                      fillOpacity="0.3"
                    />
                    <path
                      d="M4 20c0-4 4-6 8-6s8 2 8 6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="currentColor"
                      fillOpacity="0.1"
                    />
                    <path
                      d="M15 3v2M15 7v2M13 5h4"
                      stroke="#4A90A4"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Doctor Name */}
            <h3
              className="text-xl font-bold text-[#2C5282]"
              style={{
                fontFamily:
                  "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              {doctor.name}
            </h3>

            {/* Specialty */}
            {doctor.specialty && (
              <p
                className="text-sm text-[#4A90A4] font-medium"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                {doctor.specialty}
              </p>
            )}

            {/* Qualification */}
            <p
              className="text-sm text-gray-600 leading-relaxed"
              style={{
                fontFamily:
                  "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              {doctor.qualification}
            </p>

            {/* Designation */}
            {doctor.designation && (
              <p
                className="text-sm text-gray-600 leading-relaxed"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                {doctor.designation}
              </p>
            )}

            {/* Red Divider Line */}
            <div className="w-12 h-0.5 bg-[#8B4513] my-3"></div>

            {/* Hospital Name */}
            {doctor.hospital && (
              <p
                className="text-base font-semibold text-gray-700 leading-relaxed"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                {doctor.hospital}
              </p>
            )}

            {/* Time / Availability */}
            <div className="mt-3 bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <Clock className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <span
                  className="font-medium"
                  style={{
                    fontFamily:
                      "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  {formatAvailability(doctor.availability)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
