"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

/* ─── SVG icons ──────────────────────────────────────────────────────────── */

const IconStethoscope = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <path d="M6 4 L6 11 Q6 16 11 16" stroke="white" strokeWidth="1.9" strokeLinecap="round" fill="none"/>
    <path d="M18 4 L18 11 Q18 16 13 16" stroke="white" strokeWidth="1.9" strokeLinecap="round" fill="none"/>
    <circle cx="6" cy="3.5" r="1.5" fill="white"/>
    <circle cx="18" cy="3.5" r="1.5" fill="white"/>
    <path d="M12 16 Q12 22 17 22 Q22 22 22 17" stroke="white" strokeWidth="1.9" strokeLinecap="round" fill="none"/>
    <circle cx="11.5" cy="16" r="1.8" fill="white"/>
    <circle cx="22" cy="15.5" r="2.5" stroke="white" strokeWidth="1.9" fill="none"/>
    <circle cx="22" cy="15.5" r="1" fill="white"/>
  </svg>
);

const IconCreditCard = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <rect x="2" y="7" width="24" height="14" rx="2.5" stroke="white" strokeWidth="1.9" fill="none"/>
    <rect x="2" y="11" width="24" height="3.5" fill="white" opacity="0.9"/>
    <rect x="5" y="17" width="5" height="2" rx="1" fill="white" opacity="0.7"/>
    <rect x="12" y="17" width="3" height="2" rx="1" fill="white" opacity="0.7"/>
  </svg>
);

const IconClock247 = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <circle cx="14" cy="14" r="11" stroke="white" strokeWidth="1.9" fill="none"/>
    <line x1="14" y1="14" x2="14" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <line x1="14" y1="14" x2="18.5" y2="16.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="14" cy="14" r="1.2" fill="white"/>
    <line x1="14" y1="4" x2="14" y2="5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="24" y1="14" x2="22.5" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="14" y1="24" x2="14" y2="22.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="4" y1="14" x2="5.5" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconHeadphones = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    <path d="M5 14 Q5 5 14 5 Q23 5 23 14" stroke="white" strokeWidth="1.9" strokeLinecap="round" fill="none"/>
    <rect x="3" y="13" width="5" height="8" rx="2.5" stroke="white" strokeWidth="1.9" fill="none"/>
    <rect x="20" y="13" width="5" height="8" rx="2.5" stroke="white" strokeWidth="1.9" fill="none"/>
  </svg>
);

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function WhyChooseSection() {
  const { language } = useLanguage();
  const t = homepageTranslations[language].whyChoose;

  const features = [
    {
      Icon: IconStethoscope,
      title: t.anytimeDoctorTitle,
      description: t.anytimeDoctorDesc,
      highlight: false,
    },
    {
      Icon: IconCreditCard,
      title: t.noAdvanceTitle,
      description: t.noAdvanceDesc,
    },
    {
      Icon: IconClock247,
      title: t.available247Title,
      description: t.available247Desc,
      highlight: false,
    },
    {
      Icon: IconHeadphones,
      title: t.expertHelpTitle,
      description: t.expertHelpDesc,
      highlight: false,
    },
  ];

  return (
    <div className="bg-[#ECECEE] py-8 max-w-[1920px] w-full mx-auto sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ──
            Figma: title fits on 2 lines at ~560px max-width, ~36px
            Live was breaking wider causing a 3rd line push
        ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-[22px] sm:text-[42px] font-bold mb-2 sm:mb-3 text-slate-800 tracking-tight max-w-[804px] mx-auto leading-[1.15]">
            {t.title}
          </h2>
          <p className="text-[13px] sm:text-[14px] text-slate-500 max-w-[650px] mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </motion.div>

        {/* ── Feature Cards ──
            KEY FIX: `items-stretch` on the grid + `h-full` on motion.div + Card
            forces all 4 cards to the same height regardless of content length.
            `flex flex-col` on Card + `flex-grow` on description fills the space.
        ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 items-stretch">
          {features.map(({ Icon, title, description, highlight }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="h-full" /* ← makes motion.div fill the grid row height */
            >
              <Card
                className="p-6 sm:p-5 border h-full flex flex-col items-center text-center rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-white border-slate-200 group hover:bg-[#00B7B5] hover:border-[#00B7B5]"
              >
                {/* Icon */}
                <div className="mb-4 shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-primary flex items-center justify-center">
                    <Icon />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-[16px] sm:text-[15px] font-bold mb-2 leading-snug shrink-0 text-slate-800 group-hover:text-slate-900">
                  {title}
                </h3>

                {/* Description — flex-grow pushes it to fill remaining space
                    so all cards have the same total height */}
                <p className="text-[14px] sm:text-[13px] leading-relaxed flex-grow text-slate-500 group-hover:text-slate-700">
                  {description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}