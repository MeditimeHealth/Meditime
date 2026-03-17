"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowUpRight } from "lucide-react";

/* ─── Inline SVG icons — matched to Figma vectors ───────────────────────── */

const IconDoctorAppointment = () => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
    <rect x="4" y="7" width="28" height="24" rx="3" stroke="white" strokeWidth="2.2" fill="none"/>
    <line x1="12" y1="4" x2="12" y2="10" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
    <line x1="24" y1="4" x2="24" y2="10" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
    <line x1="4" y1="15" x2="32" y2="15" stroke="white" strokeWidth="2.2"/>
    <path d="M13 22 Q13 27 18 27 Q23 27 23 22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <circle cx="18" cy="20" r="1.5" fill="white"/>
    <circle cx="23" cy="27.5" r="1.8" fill="white"/>
  </svg>
);

const IconHospital = () => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
    <rect x="5" y="8" width="26" height="24" rx="2" stroke="white" strokeWidth="2.2" fill="none"/>
    <path d="M3 10 L18 3 L33 10" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <rect x="14" y="22" width="8" height="10" rx="1" stroke="white" strokeWidth="1.8" fill="none"/>
    <line x1="18" y1="13" x2="18" y2="19" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
    <line x1="15" y1="16" x2="21" y2="16" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
);

const IconVideoCall = () => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
    <rect x="3" y="10" width="22" height="16" rx="3" stroke="white" strokeWidth="2.2" fill="none"/>
    <path d="M25 14 L33 10 L33 26 L25 22 Z" stroke="white" strokeWidth="2.2" strokeLinejoin="round" fill="none"/>
  </svg>
);

const IconDiagnostic = () => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
    <rect x="6" y="6" width="24" height="28" rx="2.5" stroke="white" strokeWidth="2.2" fill="none"/>
    <path d="M13 6 Q13 3 18 3 Q23 3 23 6" stroke="white" strokeWidth="2" fill="none"/>
    <line x1="11" y1="15" x2="25" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="11" y1="20" x2="25" y2="20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="11" y1="25" x2="19" y2="25" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="26" cy="27" r="4" stroke="white" strokeWidth="2" fill="none"/>
    <line x1="29" y1="30" x2="32" y2="33" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
);

const IconBloodDonor = () => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
    <path d="M4 22 Q4 18 8 18 L12 18 L12 16 Q12 13 15 13 L21 13 Q24 13 24 16 L24 18 L28 18 Q32 18 32 22 L32 26 Q32 30 28 30 L8 30 Q4 30 4 26 Z"
      stroke="white" strokeWidth="2.2" fill="none" strokeLinejoin="round"/>
    <path d="M18 6 Q18 6 14 12 Q12 15 14.5 17.5 Q17 20 18 19 Q19 20 21.5 17.5 Q24 15 22 12 Z"
      stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round"/>
  </svg>
);

const IconAmbulance = () => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
    <rect x="2" y="13" width="26" height="16" rx="2" stroke="white" strokeWidth="2.2" fill="none"/>
    <path d="M28 21 L28 29 L34 29 L34 21 Q34 16 30 15 L28 14" stroke="white" strokeWidth="2.2" fill="none" strokeLinejoin="round"/>
    <circle cx="9" cy="29" r="3.5" stroke="white" strokeWidth="2" fill="none"/>
    <circle cx="25" cy="29" r="3.5" stroke="white" strokeWidth="2" fill="none"/>
    <line x1="12" y1="19" x2="12" y2="25" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
    <line x1="9" y1="22" x2="15" y2="22" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
  </svg>
);

/* ─── Service data ───────────────────────────────────────────────────────── */

const services = [
  {
    Icon: IconDoctorAppointment,
    title: "Doctor Appointment Booking",
    cta: "Book Appointment",
    href: "/doctor",
    description:
      "Find the Most Experienced Physician from 20+ Specialities and Departments. Easy booking, guaranteed visit.",
    highlight: false,
    showArrow: false,
  },
  {
    Icon: IconHospital,
    title: "Find the Best Hospitals Near You",
    cta: "Hospital List",
    href: "/hospital",
    description:
      "Find Specialized and General Hospitals Near You in the Dhaka Surroundings.",
    highlight: false,
    showArrow: false,
  },
  {
    Icon: IconVideoCall,
    title: "Video Call with Doctor",
    cta: "Book Consultation",
    href: "/video-consultation",
    description:
      "Known as Online Doctor Appointment, this service lets you talk directly with a doctor from your home.",
    highlight: false,
    showArrow: false,
  },
  {
    Icon: IconDiagnostic,
    title: "Most Affordable Diagnostic Tests Options",
    cta: "Compare Prices",
    href: "/diagnostic",
    description:
      "Diagnostic tests account for a significant portion of healthcare costs, potentially over 10% of total medical expenses.",
    highlight: false,
    showArrow: true,
  },
  {
    Icon: IconBloodDonor,
    title: "Blood Donor Contact",
    cta: "Find Donors",
    href: "/blood-donors",
    description:
      "31% of all maternal deaths happen due to haemorrhage (severe blood loss). Timely blood transfusion could save lives.",
    highlight: false,
    showArrow: false,
  },
  {
    Icon: IconAmbulance,
    title: "Ambulance Contact",
    cta: "Book Consultation",
    href: "/ambulance",
    description:
      "We have a comprehensive list of ambulance contact numbers in Savar and nearby areas.",
    highlight: true,
    showArrow: false,
  },
];

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function ServicesSection() {
  return (
    <div className="bg-gray-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-slate-800 tracking-tight">
            Meditime Services
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-base leading-relaxed">
            Meditime has a broad range of medical information services from
            doctors&apos; appointment booking to ambulance contact numbers.
          </p>
        </motion.div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map(({ Icon, title, cta, href, description, highlight, showArrow }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="h-full"
            >
              <Link href={href} className="block h-full group">
                <Card
                  className={`p-5 lg:p-6 border h-full flex flex-col rounded-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg ${
                    highlight
                      ? "bg-yellow-300 border-yellow-300 shadow-md"
                      : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  {/* Teal circle with inline SVG icon */}
                  <div className="mb-4">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Icon />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-base font-bold mb-2 leading-snug ${
                      highlight ? "text-slate-900" : "text-slate-800"
                    }`}
                  >
                    {title}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-sm leading-relaxed flex-grow mb-5 line-clamp-3 ${
                      highlight ? "text-slate-800" : "text-slate-500"
                    }`}
                  >
                    {description}
                  </p>

                  {/* CTA row */}
                  <div className="mt-auto flex items-center gap-2">

                    {/*
                      group/btn — scoped hover group on just the button area.
                      Default state:  outlined pill with the service CTA label.
                      Hover state:    filled teal "View More" + ArrowUpRight icon.
                      Both layers are stacked via absolute positioning so the
                      container keeps a stable height (h-9).
                    */}
                    <div className="group/btn relative h-9">

                      {/* Default label — fades & shrinks out on hover */}
                      <span
                        className={`inline-flex items-center h-9 px-4 rounded-full text-sm font-medium border
                          transition-all duration-200
                          group-hover/btn:opacity-0 group-hover/btn:scale-90
                          ${highlight
                            ? "bg-white border-white text-slate-800"
                            : "bg-white border-slate-300 text-slate-700"
                          }`}
                      >
                        {cta}
                      </span>

                      {/* "View More" — fades & grows in on hover */}
                      <span
                        className="absolute left-0 top-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full
                          text-sm font-semibold bg-primary text-white whitespace-nowrap pointer-events-none
                          opacity-0 scale-90
                          group-hover/btn:opacity-100 group-hover/btn:scale-100
                          transition-all duration-200"
                      >
                        View More
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    {/* Arrow circle — only on the Diagnostic card (showArrow: true) */}
                    {showArrow && (
                      <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}