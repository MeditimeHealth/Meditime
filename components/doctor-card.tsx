"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Clock, MapPin, Stethoscope, ChevronRight, Building2, ChevronDown } from "lucide-react";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";


export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  qualification: string;
  designation?: string;
  phoneNumber: string;
  slug?: string;
  slugBn?: string;
  email?: string;
  department?: string;

  reportShowFee?: number;
  newPatientFee?: number;
  diseases?: string[];
  slotDuration?: number;
  availability: Array<{
    days: string[];
    daysBn?: string[];
    time?: string;
    timeBn?: string;
    hospital: string;
  }>;
  bio?: string;
  image?: string;
  rating?: number;
  // Bangla fields
  nameBn?: string;
  specialtyBn?: string;
  qualificationBn?: string;
  designationBn?: string;
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

const groupAvailabilityByHospital = async (
  availability: Array<{
    days: string[];
    daysBn?: string[];
    time?: string;
    timeBn?: string;
    hospital: string;
  }>,
  language: string = "en"
): Promise<{ hospital: any; texts: string[] }[]> => {
  const slots = Array.isArray(availability) ? availability : [availability];

  // 1. Collect unique hospital slugs
  const uniqueSlugs = [...new Set(slots.map((s) => s?.hospital).filter(Boolean))];
  console.log(uniqueSlugs)
  // 2. Fetch all hospitals in parallel and cache by slug
  const hospitalMap = new Map<string, any>();
  await Promise.all(
    uniqueSlugs.map(async (slug) => {
      try {
        const response = await fetch(`/api/locations/hospitals/${slug}`);
        if (!response.ok) throw new Error(`Failed to fetch hospital: ${slug}`);
        const hospital = await response.json();
        hospitalMap.set(slug, hospital);
      } catch (err) {
        console.error(`Error fetching hospital "${slug}":`, err);
      }
    })
  );

  // 3. Group slots by resolved hospital object (synchronously)
  const grouped = slots.reduce((acc: { hospital: any; slots: typeof slots }[], slot) => {
    if (!slot?.hospital) return acc;

    const hospital = hospitalMap.get(slot.hospital);
    if (!hospital) return acc; // skip if fetch failed

    let group = acc.find((g) => g.hospital === hospital?.slug);
    if (!group) {
      group = { hospital, slots: [] };
      acc.push(group);
    }
    group.slots.push(slot);
    return acc;
  }, []);

  // 4. Map groups to output shape
  return grouped
    .map((group) => {
      const texts = group.slots
        .map((slot) => {
          const sortedDays = (slot.days || []).sort(
            (a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
          );
          if (!sortedDays.length) return "";

          const time = language === "bn" && slot.timeBn ? slot.timeBn : slot.time || "";
          const isOnCall = time === "On Call" || time === "অন কল";

          if (isOnCall) return time;

          const consecutive = areDaysConsecutive(sortedDays);

          if (language === "bn") {
            const getBnDay = (d: string) => {
              if (
                slot.daysBn &&
                Array.isArray(slot.daysBn) &&
                slot.daysBn.length === slot.days.length
              ) {
                const idx = slot.days.indexOf(d);
                if (idx !== -1 && slot.daysBn[idx]) return slot.daysBn[idx];
              }
              return getBengaliDay(d);
            };

            if (sortedDays.length === 1) return `${getBnDay(sortedDays[0])} — ${time}`;
            if (consecutive)
              return `${getBnDay(sortedDays[0])} থেকে ${getBnDay(sortedDays[sortedDays.length - 1])} — ${time}`;
            return `${sortedDays.map((d) => getBnDay(d)).join(", ")} — ${time}`;
          } else {
            if (sortedDays.length === 1) return `${sortedDays[0]} — ${time}`;
            if (consecutive)
              return `${sortedDays[0]} to ${sortedDays[sortedDays.length - 1]} — ${time}`;
            return `${sortedDays.join(", ")} — ${time}`;
          }
        })
        .filter((t) => t !== "");

      return { hospital: group.hospital.hospital, texts };
    })
    .filter((g) => g.texts.length > 0);
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
  const [isExpanded, setIsExpanded] = useState(false);

  const displayName = getLocalizedValue(doctor.name, doctor.nameBn, language);
  const displaySpecialty = getLocalizedValue(doctor.specialty, doctor.specialtyBn, language);
  const displayQualification = getLocalizedValue(doctor.qualification, doctor.qualificationBn, language);
  const displayDesignation = getLocalizedValue(doctor.designation, doctor.designationBn, language);

  const [groupedAvailability, setGroupedAvailability] = useState<{ hospital: any; texts: string[] }[]>([]);

  useEffect(() => {
    groupAvailabilityByHospital(doctor.availability, language).then(setGroupedAvailability);
    console.log(groupedAvailability)
  }, [doctor.availability, language]);

  const CardContent = (
    <Card className={`p-5 bg-white border border-gray-100 hover:border-primary/30 shadow-sm transition-all duration-300 h-fit flex flex-col ${!disableLink ? 'hover:shadow-xl cursor-pointer group' : ''}`}>

      {/* TOP: image + info — flex-1 pushes bottom section down */}
      <div className="flex flex-col gap-6 flex-1 mb-4">
        {/* Doctor Image - centered */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-50 border-2 border-gray-100 flex-shrink-0 group-hover:border-primary/20 transition-colors mx-auto">
          {doctor.image ? (
            <Image
              src={doctor.image}
              alt={doctor.name}
              fill
              sizes="64px"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/5">
              <Stethoscope className="w-8 h-8 text-primary/40" />
            </div>
          )}
        </div>

        {/* Doctor Info */}
        <div className="w-full min-w-0 flex flex-col gap-3">
          <h3 className="text-lg font-bold text-[#193252] leading-snug mb-1 group-hover:text-[#00B1C2] transition-colors">
            {displayName}
          </h3>
          {displaySpecialty && (
            <section className="text-md text-[#017991] font-semibold mb-1">{displaySpecialty}</section>
          )}
          {displayQualification && (
            <section className="text-sm text-[#193252] font-medium mb-0.5">{displayQualification}</section>
          )}
          {displayDesignation && (
            <section className="text-sm text-[#193252] font-medium">{displayDesignation}</section>
          )}
        </div>
      </div>

      {/* BOTTOM: hospital, time, fee, button — always pinned at bottom */}
      <div className="space-y-6">

        {/* Time / Availability */}
        <div className="flex flex-col gap-2   transition-colors overflow-hidden">
          {groupedAvailability.length > 0 ? (
            <div className="flex flex-col gap-2">
              {groupedAvailability.slice(0, isExpanded ? groupedAvailability.length : 1).map((group, idx) => {
                return (
                <div key={idx} className="p-3 border-b bg-[#F6FAFD] border-gray-100/50 last:border-b-0">
                  <div className="flex gap-2 mb-2">
                    <Building2 className="w-4 h-4 mt-0.5 text-[#10B981] shrink-0" />
                    {
                      getLocalizedValue(group.hospital?.name, group.hospital?.nameBn, language)
                    }
                  </div>
                  <div className="flex flex-col gap-1.5 ml-1">
                    {group.texts.map((text, tIdx) => (
                      <div key={tIdx} className="flex items-start gap-2 text-xs text-gray-600">
                        <Clock className="w-3.5 h-3.5 mt-0.5 text-gray-400 shrink-0" />
                        <section className="font-medium leading-relaxed">
                          {text}
                        </section>
                      </div>
                    ))}
                  </div>
                </div>
              )
              })}
              {groupedAvailability.length > 1 && (
                <section
                  className="bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#193252] text-xs font-bold py-2.5 px-3 flex items-center justify-center gap-1.5 cursor-pointer transition-colors m-2 rounded-lg"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  {isExpanded
                    ? (language === 'bn' ? 'কম দেখান' : 'Show less')
                    : (language === 'bn'
                      ? `আরও ${groupedAvailability.length - 1}টি চেম্বার দেখুন`
                      : `See ${groupedAvailability.length - 1} more chamber${groupedAvailability.length > 2 ? 's' : ''}`)}
                </section>
              )}
            </div>
          ) : (
            <div className="p-3">
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <Clock className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span className="font-semibold leading-relaxed">
                  {language === 'bn' ? 'সময়সূচী দেখুন' : 'View Schedule'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        {!disableLink && (
          <div className="w-full py-6 btn-primary btn-slide text-white hover:text-[#017991] flex items-center justify-center gap-2">
            {language === 'bn' ? 'অ্যাপয়েন্টমেন্ট নিন' : 'Book Appointment'}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        )}
        {actions && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
            {actions}
          </div>
        )}
      </div>
    </Card>
  );

  return (
    <motion.div
      whileHover={!disableLink ? { y: -3 } : {}}
    >
      {!disableLink ? (
        <Link href={`/doctor/${(language === 'bn' ? (doctor.slugBn || doctor.slug) : (doctor.slug || doctor.slugBn)) || doctor._id}`}>
          {CardContent}
        </Link>
      ) : (
        CardContent
      )}
    </motion.div>
  );
}
