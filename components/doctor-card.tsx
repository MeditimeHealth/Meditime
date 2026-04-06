"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Clock, MapPin, Stethoscope, ChevronRight } from "lucide-react";
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
  language?: 'en' | 'bn';
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
  disableLink = false,
  language: propLanguage
}: DoctorCardProps) {
  const { language: contextLanguage } = useLanguage();
  const language = propLanguage || contextLanguage;
  
  // Get localized values
  const displayName = getLocalizedValue(doctor.name, doctor.nameBn, language);
  const displaySpecialty = getLocalizedValue(doctor.specialty, doctor.specialtyBn, language);
  const displayQualification = getLocalizedValue(doctor.qualification, doctor.qualificationBn, language);
  const displayDesignation = getLocalizedValue(doctor.designation, doctor.designationBn, language);
  const displayHospital = getLocalizedValue(doctor.hospital, doctor.hospitalBn, language);
  const availabilityText = formatAvailability(doctor.availability, language);

  const CardContent = (
    <Card className={`p-5 bg-white border border-gray-100 hover:border-primary/30 shadow-sm transition-all duration-300 h-full flex flex-col justify-between ${!disableLink ? 'hover:shadow-xl cursor-pointer group' : ''}`}>
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {/* Doctor Image */}
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-50 border-2 border-gray-50 flex-shrink-0 group-hover:border-primary/20 transition-colors">
            {doctor.image ? (
              <Image
                src={doctor.image}
                alt={doctor.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/5">
                <Stethoscope className="w-10 h-10 text-primary/40" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Doctor Name */}
            <h3
              className="text-lg font-bold text-gray-900 leading-tight mb-1 group-hover:text-primary transition-colors line-clamp-1"
            >
              {displayName}
            </h3>

            {/* Specialty */}
            {displaySpecialty && (
              <p className="text-sm text-primary font-semibold line-clamp-1 mb-1">
                {displaySpecialty}
              </p>
            )}

            {/* Qualification (Degree) */}
            {displayQualification && (
              <p className="text-xs text-gray-500 font-medium line-clamp-1 mb-0.5">
                {displayQualification}
              </p>
            )}

            {/* Designation */}
            {displayDesignation && (
              <p className="text-[11px] text-slate-400 font-medium line-clamp-1">
                {displayDesignation}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2.5">
          {/* Hospital Name */}
          {displayHospital && (
            <div className="flex items-start gap-2 group/loc">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 group-hover/loc:text-primary transition-colors" />
              <p className="text-sm font-medium text-gray-600 line-clamp-2">
                {displayHospital}
              </p>
            </div>
          )}

          {/* Time / Availability */}
          <div className="bg-gray-50/80 rounded-xl p-3 border border-gray-100/50 group-hover:bg-primary/5 transition-colors">
            <div className="flex items-start gap-2 text-xs text-gray-700">
              <Clock className="w-4 h-4 mt-0.5 text-primary" />
              <span className="font-semibold leading-relaxed">
                 {availabilityText || (language === 'bn' ? 'সময়সূচী দেখুন' : 'View Schedule')}
              </span>
            </div>
          </div>
          
          {/* Consultation Fee */}
          <div className="flex items-center justify-between py-2 border-t border-dashed border-gray-200 mt-2">
            <span className="text-sm text-gray-500 font-medium">
              {language === 'bn' ? 'ভিজিট ফি' : 'Consultation Fee'}
            </span>
            <span className="text-lg font-bold text-primary">
              {doctor.consultationFee}৳
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-4 pt-2">
        {!disableLink && (
          <div className="w-full py-2.5 bg-gray-900 group-hover:bg-primary text-white text-sm font-bold text-center rounded-xl transition-all shadow-md group-hover:shadow-primary/30 flex items-center justify-center gap-2">
            {language === 'bn' ? 'অ্যাপয়েন্টমেন্ট নিন' : 'Book Appointment'}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
        {actions && (
          <div className="pt-2 flex gap-2">
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
