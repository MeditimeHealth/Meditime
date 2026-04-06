"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

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
    <path
      d="M4 22 Q4 18 8 18 L12 18 L12 16 Q12 13 15 13 L21 13 Q24 13 24 16 L24 18 L28 18 Q32 18 32 22 L32 26 Q32 30 28 30 L8 30 Q4 30 4 26 Z"
      stroke="white" strokeWidth="2.2" fill="none" strokeLinejoin="round"
    />
    <path
      d="M18 6 Q18 6 14 12 Q12 15 14.5 17.5 Q17 20 18 19 Q19 20 21.5 17.5 Q24 15 22 12 Z"
      stroke="white" strokeWidth="2" fill="none" strokeLinejoin="round"
    />
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

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function ServicesSection() {
  const { language } = useLanguage();
  const t = homepageTranslations[language].services;

  const services = [
    {
      Icon: IconDoctorAppointment,
      title: t.doctorAppointmentTitle,
      cta: t.bookAppointmentBtn,
      href: "/doctor",
      description: t.doctorAppointmentDesc,
      highlight: false,
      showArrow: false,
    },
    {
      Icon: IconHospital,
      title: t.hospitalsTitle,
      cta: t.hospitalListBtn,
      href: "/hospital",
      description: t.hospitalsDesc,
      highlight: false,
      showArrow: false,
    },
    {
      Icon: IconVideoCall,
      title: t.videoConsultTitle,
      cta: t.bookConsultationBtn,
      href: "/live-consultation",
      description: t.videoConsultDesc,
      highlight: false,
      showArrow: false,
    },
    {
      Icon: IconDiagnostic,
      title: t.diagnosticTitle,
      cta: t.comparePriceBtn,
      href: "/diagnostic",
      description: t.diagnosticDesc,
      highlight: false,
      showArrow: false,
    },
    {
      Icon: IconBloodDonor,
      title: t.bloodDonorTitle,
      cta: t.findDonorBtn,
      href: "/blood-donor",
      description: t.bloodDonorDesc,
      highlight: false,
      showArrow: false,
    },
    {
      Icon: IconAmbulance,
      title: t.ambulanceTitle,
      cta: t.callNowBtn,
      href: "/ambulance",
      description: t.ambulanceDesc,
      showArrow: false,
    },
  ];

  return (
    <div className="bg-gray-50 py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header
              Figma: title ~36px (text-4xl), subtitle ~14px, narrow max-width
        ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          {/* Figma title is ~36–40px — text-4xl matches, NOT text-5xl */}
          <h2 className="text-[22px] sm:text-4xl font-bold mb-2 sm:mb-3 text-slate-800 tracking-tight">
            {t.title}
          </h2>
          {/* Figma subtitle wraps to 3 short lines — keep max-w tight */}
          <p className="text-[13px] sm:text-[15px] text-slate-500 max-w-[498px] mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </motion.div>

        {/* ── Service Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
                  className="p-6 border h-full flex flex-col rounded-2xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg bg-white border-slate-200 shadow-sm group-hover:bg-[#00B7B5] group-hover:border-[#00B7B5]"
                >
                  {/* ── Teal circle icon
                        Figma: ~56px circle, icon is ~28px — w-14 h-14 is correct
                        mb-3 tighter than mb-4 to compress card height
                  ── */}
                  <div className="mb-5 sm:mb-3">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Icon />
                    </div>
                  </div>

                  {/* ── Title
                        Figma: ~15-16px bold, tight leading
                        mb-2 gap to description
                  ── */}
                  <h3 className="text-[16px] sm:text-[15px] font-bold mb-2 leading-snug text-slate-800 group-hover:text-slate-900">
                    {title}
                  </h3>

                  {/* ── Description
                        Figma shows 2 lines max — line-clamp-2 to match card height
                        text-[13px] to match Figma's smaller body text
                        flex-grow pushes the button to the bottom
                  ── */}
                  <p className="text-[14px] sm:text-[13px] leading-relaxed flex-grow mb-4 text-slate-500 group-hover:text-slate-700">
                    {description}
                  </p>

                  {/* ── CTA row
                        group/btn scopes hover to the button only (not whole card)
                        Default: outlined pill with CTA label
                        Hover:   filled teal "View More" + ArrowUpRight
                  ── */}
                  <div className="mt-auto flex items-center gap-2">
                    <div className="group/btn relative h-8">

                      {/* Default label — fades & shrinks out on button hover */}
                      <span
                        className="inline-flex items-center h-10 sm:h-8 px-6 sm:px-4 rounded-full text-[14px] sm:text-[13px] font-medium
                          transition-all duration-200 bg-slate-100 sm:bg-white sm:border border-slate-300 text-slate-700
                          group-hover/btn:opacity-0 group-hover/btn:scale-90"
                      >
                        {cta}
                      </span>

                      {/* Hover state — fades & grows in on button hover */}
                      <span
                        className="absolute left-0 top-0 inline-flex items-center gap-1.5 h-8 px-4 rounded-full
                          text-[13px] font-semibold bg-[#00B7B5] text-white whitespace-nowrap pointer-events-none
                          opacity-0 scale-90
                          group-hover/btn:opacity-100 group-hover/btn:scale-100
                          transition-all duration-200"
                      >
                        View More
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    {/* Teal arrow circle — Diagnostic card only */}
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