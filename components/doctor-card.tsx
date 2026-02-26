"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";

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
        timeBn?: string;
      }>
    | {
        days: string[];
        time: string;
        timeBn?: string;
      };
  bio?: string;
  image?: string;
  rating?: number;
  // Bangla fields
  nameBn?: string;
  specialtyBn?: string;
  qualificationBn?: string;
  designationBn?: string;
  hospitalBn?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  index?: number;
  actions?: React.ReactNode;
  disableLink?: boolean;
}

const daysOfWeek = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const banglaDays = [
  "শনিবার",
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
];

// Helper functions
const getBengaliDay = (day: string): string => {
  const dayIndex = daysOfWeek.indexOf(day);
  return dayIndex >= 0 ? banglaDays[dayIndex] : day;
};

const areDaysConsecutive = (sortedDays: string[]): boolean => {
  if (sortedDays.length <= 1) return true;
  for (let i = 1; i < sortedDays.length; i++) {
    const prevIndex = daysOfWeek.indexOf(sortedDays[i - 1]);
    const currIndex = daysOfWeek.indexOf(sortedDays[i]);
    if (currIndex - prevIndex !== 1) return false;
  }
  return true;
};

const formatAvailability = (
  availability:
    | Array<{ days: string[]; time: string; timeBn?: string }>
    | { days: string[]; time: string; timeBn?: string },
  language: string = "en"
): string => {
  // Handle backward compatibility - convert old format to array
  const slots = Array.isArray(availability) ? availability : [availability];

  return slots.map((slot) => {
    const sortedDays = (slot.days || []).sort((a: string, b: string) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
    if (!sortedDays.length) return "";
    
    const time = (language === 'bn' && slot.timeBn) ? slot.timeBn : (slot.time || "");
    const consecutive = areDaysConsecutive(sortedDays);

    if (language === 'bn') {
      if (sortedDays.length === 1) return `${getBengaliDay(sortedDays[0])} ${time}`;
      if (consecutive) {
        return `${getBengaliDay(sortedDays[0])} থেকে ${getBengaliDay(sortedDays[sortedDays.length - 1])} ${time}`;
      }
      return `${sortedDays.map(d => getBengaliDay(d)).join(", ")} ${time}`;
    } else {
      if (sortedDays.length === 1) return `${sortedDays[0]} ${time}`;
      if (consecutive) {
        return `${sortedDays[0]} to ${sortedDays[sortedDays.length - 1]} ${time}`;
      }
      return `${sortedDays.join(", ")} ${time}`;
    }
  }).join(language === 'bn' ? "। " : ", ");
};

export default function DoctorCard({ 
  doctor, 
  index = 0, 
  actions, 
  disableLink = false 
}: DoctorCardProps) {
  const { language } = useLanguage();
  
  // Get localized values
  const displayName = getLocalizedValue(doctor.name, doctor.nameBn, language);
  const displaySpecialty = getLocalizedValue(doctor.specialty, doctor.specialtyBn, language);
  const displayQualification = getLocalizedValue(doctor.qualification, doctor.qualificationBn, language);
  const displayDesignation = getLocalizedValue(doctor.designation, doctor.designationBn, language);
  const displayHospital = getLocalizedValue(doctor.hospital, doctor.hospitalBn, language);

  const CardContent = (
    <Card className={`p-6 bg-white border border-gray-200 hover:border-gray-300 shadow-sm transition-all duration-300 h-full ${!disableLink ? 'hover:shadow-md cursor-pointer' : ''}`}>
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
          {displayName}
        </h3>

        {/* Specialty */}
        {displaySpecialty && (
          <p
            className="text-sm text-[#4A90A4] font-medium"
            style={{
              fontFamily:
                "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            {displaySpecialty}
          </p>
        )}

        {/* Qualification */}
        {displayQualification && (
          <p
            className="text-sm text-gray-600 leading-relaxed"
            style={{
              fontFamily:
                "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            {displayQualification}
          </p>
        )}

        {/* Designation */}
        {displayDesignation && (
          <p
            className="text-sm text-gray-600 leading-relaxed"
            style={{
              fontFamily:
                "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            {displayDesignation}
          </p>
        )}

        {/* Red Divider Line */}
        <div className="w-12 h-0.5 bg-[#8B4513] my-3"></div>

        {/* Hospital Name */}
        {displayHospital && (
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <p
              className="text-base font-semibold text-gray-700 leading-relaxed"
              style={{
                fontFamily:
                  "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              {displayHospital}
            </p>
          </div>
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
               {formatAvailability(doctor.availability, language)}
            </span>
          </div>
        </div>

        {/* Custom Actions Area */}
        {actions && (
          <div className="pt-4 mt-2 border-t border-gray-100 flex gap-2">
            {actions}
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={!disableLink ? { y: -3 } : {}}
    >
      {!disableLink ? (
        <Link href={`/doctor/${doctor._id}`}>
          {CardContent}
        </Link>
      ) : (
        CardContent
      )}
    </motion.div>
  );
}
