"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Activity, ShieldCheck, History, MessageCircleMore } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";



/* ─── Component ──────────────────────────────────────────────────────────── */

export default function WhyChooseSection() {
  const { language } = useLanguage();
  const t = homepageTranslations[language].whyChoose;

  const features = [
    {
      Icon: Activity,
      title: t.anytimeDoctorTitle,
      description: t.anytimeDoctorDesc,
    },
    {
      Icon: ShieldCheck,
      title: t.noAdvanceTitle,
      description: t.noAdvanceDesc,
    },
    {
      Icon: History,
      title: t.available247Title,
      description: t.available247Desc,
    },
    {
      Icon: MessageCircleMore,
      title: t.expertHelpTitle,
      description: t.expertHelpDesc,
    },
  ];

  return (
    <div className="bg-[var(--background-dark)] py-12 w-full mx-auto sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="text-[28px] sm:text-[48px]  font-bold mb-4 text-white tracking-tight max-w-[804px] mx-auto leading-[1.1]">
            {t.title}
          </h2>
          <div className="w-20 h-1.5 bg-primary mx-auto mb-6 shadow-[0_0_15px_rgba(13,148,136,0.5)]" />

          <p className="text-white/90  text-sm sm:text-lg max-w-[650px] mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </motion.div>

        {/* ── Feature Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  gap-6 items-stretch">
          {features.map(({ Icon, title, description }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="h-full"
            >
              <Card
                className="btn-slide border-none rounded-none group p-8 sm:p-10 h-full flex flex-col items-start text-left  shadow-xl transition-all duration-300 hover:shadow-2xl md:min-h-[420px]"
              >
                {/* Icon Container */}
                <div className="mb-10 shrink-0 relative">
                  <Icon
                    className="w-16 h-16 sm:w-20 sm:h-20 text-primary transition-all duration-300 group-hover:text-white group-hover:scale-110"
                    strokeWidth={1.2}
                  />
                </div>

                {/* Title */}
                <h3 className="text-[20px] sm:text-[24px] font-bold mb-5 leading-tight shrink-0 text-[#193252] transition-colors duration-300">
                  <span className="relative z-10">{title}</span>
                </h3>

                {/* Description */}
                <p className="text-[15px] sm:text-[16px] leading-relaxed flex-grow text-slate-600 transition-colors duration-300">
                  <span className="relative z-10">{description}</span>
                </p>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}