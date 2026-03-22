"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

interface Department {
  _id: string;
  name: string;
  nameBn?: string;
  image?: string;
}

/* ════════════════════════════════════════════════════════════════════════════
   MEDICALLY ACCURATE OUTLINE SVGs
════════════════════════════════════════════════════════════════════════════ */

const SvgCardiology = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 33 C20 33 7 23 7 14.5 C7 10.4 10.4 7 14.5 7 C16.9 7 19 8.2 20 10 C21 8.2 23.1 7 25.5 7 C29.6 7 33 10.4 33 14.5 C33 23 20 33 20 33Z"/>
    <polyline points="10,19 14,19 16.5,13 20,25 23,17 25.5,19 30,19" strokeWidth="1.6"/>
  </svg>
);

const SvgNeurology = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 9 C16 9 13 12 13 15.5 C13 17 13.5 18.3 14.5 19.2 C13.5 20 13 21.5 13 23 C13 26 15.5 28.5 18.5 28.5 L20 28.5"/>
    <path d="M20 9 C24 9 27 12 27 15.5 C27 17 26.5 18.3 25.5 19.2 C26.5 20 27 21.5 27 23 C27 26 24.5 28.5 21.5 28.5 L20 28.5"/>
    <line x1="20" y1="9" x2="20" y2="28.5"/>
    <path d="M14.5 19.2 Q17 20.5 20 20 Q23 20.5 25.5 19.2" strokeWidth="1.4"/>
    <line x1="20" y1="28.5" x2="20" y2="33"/>
    <line x1="16" y1="33" x2="24" y2="33" strokeWidth="1.6"/>
  </svg>
);

const SvgOrthopedics = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="20" y1="7" x2="20" y2="20"/>
    <ellipse cx="20" cy="7" rx="4" ry="3"/>
    <line x1="20" y1="21" x2="20" y2="33"/>
    <ellipse cx="20" cy="33" rx="3" ry="2"/>
    <circle cx="20" cy="20.5" r="4.5"/>
    <line x1="16.5" y1="7" x2="23.5" y2="7" strokeWidth="1.2"/>
    <line x1="17.5" y1="33" x2="22.5" y2="33" strokeWidth="1.2"/>
  </svg>
);

const SvgPediatrics = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="20" cy="11" r="6"/>
    <path d="M14 22 Q14 18 20 18 Q26 18 26 22 L26 30 Q26 33 20 33 Q14 33 14 30 Z"/>
    <line x1="14" y1="23" x2="10" y2="27"/>
    <line x1="26" y1="23" x2="30" y2="27"/>
    <line x1="17" y1="33" x2="15" y2="38" strokeWidth="1.6"/>
    <line x1="23" y1="33" x2="25" y2="38" strokeWidth="1.6"/>
  </svg>
);

const SvgGynecology = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22 Q14 16 20 15 Q26 16 25 22 L25 26 Q25 30 20 30 Q15 30 15 26 Z"/>
    <path d="M15 20 Q10 17 8 13 Q8 10 11 10 Q13 10 13 13" strokeWidth="1.6"/>
    <path d="M25 20 Q30 17 32 13 Q32 10 29 10 Q27 10 27 13" strokeWidth="1.6"/>
    <circle cx="11" cy="13" r="2.5"/>
    <circle cx="29" cy="13" r="2.5"/>
    <line x1="20" y1="30" x2="20" y2="35"/>
  </svg>
);

const SvgMedicine = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 7 L11 16 Q11 22 17 22"/>
    <path d="M29 7 L29 16 Q29 22 23 22"/>
    <circle cx="11" cy="6.5" r="2" strokeWidth="1.6"/>
    <circle cx="29" cy="6.5" r="2" strokeWidth="1.6"/>
    <path d="M20 22 Q20 29 26 29 Q32 29 32 23"/>
    <circle cx="20" cy="22" r="2.5" strokeWidth="1.6"/>
    <circle cx="32" cy="21.5" r="3.5"/>
    <circle cx="32" cy="21.5" r="1.2" fill="#0d9488" stroke="none"/>
  </svg>
);

const SvgDiabetes = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 8 Q14 16 14 21 Q14 27 20 27 Q26 27 26 21 Q26 16 20 8Z"/>
    <rect x="10" y="28" width="20" height="9" rx="2"/>
    <rect x="13" y="30" width="9" height="5" rx="1" strokeWidth="1.4"/>
    <circle cx="26" cy="32.5" r="1.5" strokeWidth="1.4"/>
    <polyline points="17,21 19,23 23,18" strokeWidth="1.6"/>
  </svg>
);

const SvgOncology = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 8 Q26 10 26 17 Q26 22 20 24 Q14 22 14 17 Q14 10 20 8Z"/>
    <path d="M16 23 L12 33 Q12 35 14 34 L20 28"/>
    <path d="M24 23 L28 33 Q28 35 26 34 L20 28"/>
  </svg>
);

const SvgPulmonology = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="20" y1="6" x2="20" y2="16"/>
    <path d="M20 16 Q15 16 14 20"/>
    <path d="M20 16 Q25 16 26 20"/>
    <path d="M14 20 Q8 22 8 28 Q8 34 14 34 Q18 34 18 30 L18 20 Z"/>
    <path d="M26 20 Q32 22 32 28 Q32 34 26 34 Q22 34 22 30 L22 20 Z"/>
  </svg>
);

const SvgENT = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 14 Q14 7 20 7 Q28 7 28 16 Q28 22 23 25 Q21 26 21 29 L21 33"/>
    <path d="M19 14 Q19 11 22 11 Q25 11 25 15 Q25 19 22 21 Q20 22 20 25" strokeWidth="1.4"/>
    <path d="M14 25 Q14 33 18 33 L21 33"/>
  </svg>
);

const SvgOphthalmology = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 20 Q13.5 10 20 10 Q26.5 10 33 20 Q26.5 30 20 30 Q13.5 30 7 20Z"/>
    <circle cx="20" cy="20" r="5.5"/>
    <circle cx="20" cy="20" r="2.5" fill="#0d9488" stroke="none"/>
    <circle cx="22" cy="18" r="1" fill="white" stroke="none"/>
  </svg>
);

const SvgDermatology = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 10 Q15 7 20 7 Q25 7 25 10 L27 16 Q30 18 30 22 L30 34 Q30 36 20 36 Q10 36 10 34 L10 22 Q10 18 13 16 Z"/>
    <path d="M13 20 Q20 18 27 20" strokeWidth="1.3"/>
    <path d="M13 24 Q20 22 27 24" strokeWidth="1.3"/>
    <path d="M13 28 Q20 26 27 28" strokeWidth="1.3"/>
  </svg>
);

const SvgUrology = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12 Q7 14 7 20 Q7 28 12 30 Q16 31 18 27 Q19 24 18 20 Q17 16 18 13 Q16 9 12 12Z"/>
    <path d="M28 12 Q33 14 33 20 Q33 28 28 30 Q24 31 22 27 Q21 24 22 20 Q23 16 22 13 Q24 9 28 12Z"/>
    <line x1="18" y1="22" x2="22" y2="22"/>
  </svg>
);

const SvgGastro = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 9 Q14 9 13 13 Q11 17 12 22 Q13 29 18 31 Q24 33 28 28 Q32 23 30 17 Q28 11 24 10 Q22 9 20 11 Q19 12 18 9Z"/>
    <line x1="18" y1="7" x2="18" y2="9"/>
    <path d="M28 24 Q32 26 32 30" strokeWidth="1.6"/>
  </svg>
);

const SvgPsychiatry = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 16 Q12 8 20 8 Q28 8 28 16 L28 24 Q28 30 20 30 Q12 30 12 24 Z"/>
    <line x1="16" y1="30" x2="16" y2="34"/>
    <line x1="24" y1="30" x2="24" y2="34"/>
    <line x1="14" y1="34" x2="26" y2="34"/>
    <polyline points="13,18 16,18 17.5,14 20,22 22.5,16 24,18 27,18" strokeWidth="1.5"/>
  </svg>
);

const SvgDentistry = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 8 Q13 6 16 7 L17 10 Q18 12 20 12 Q22 12 23 10 L24 7 Q27 6 27 8 L27 17 Q27 25 25 32 Q24 36 22 33 Q21 30 20 30 Q19 30 18 33 Q16 36 15 32 Q13 25 13 17 Z"/>
  </svg>
);

const SvgSurgery = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 30 L22 18 Q24 16 26 16 L30 12"/>
    <path d="M22 18 Q26 20 30 12 Q27 16 22 18Z" fill="#0d9488" fillOpacity="0.15"/>
    <line x1="22" y1="18" x2="30" y2="12"/>
    <line x1="12" y1="28" x2="14" y2="26" strokeWidth="1.4"/>
    <line x1="15" y1="25" x2="17" y2="23" strokeWidth="1.4"/>
    <line x1="18" y1="22" x2="20" y2="20" strokeWidth="1.4"/>
    <line x1="30" y1="26" x2="36" y2="26" strokeWidth="1.6"/>
    <line x1="33" y1="23" x2="33" y2="29" strokeWidth="1.6"/>
  </svg>
);

const SvgRadiology = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="6" width="24" height="30" rx="2"/>
    <line x1="20" y1="11" x2="20" y2="30"/>
    <path d="M20 14 Q16 14 15 17" strokeWidth="1.4"/>
    <path d="M20 18 Q15 18 14 21" strokeWidth="1.4"/>
    <path d="M20 22 Q15 22 14 25" strokeWidth="1.4"/>
    <path d="M20 14 Q24 14 25 17" strokeWidth="1.4"/>
    <path d="M20 18 Q25 18 26 21" strokeWidth="1.4"/>
    <path d="M20 22 Q25 22 26 25" strokeWidth="1.4"/>
  </svg>
);

const SvgHematology = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 14 L26 14 L28 32 Q28 35 20 35 Q12 35 12 32 Z"/>
    <line x1="20" y1="8" x2="20" y2="14"/>
    <path d="M16 8 Q20 5 24 8"/>
    <line x1="20" y1="35" x2="20" y2="39"/>
    <line x1="20" y1="21" x2="20" y2="27" strokeWidth="1.6"/>
    <line x1="17" y1="24" x2="23" y2="24" strokeWidth="1.6"/>
  </svg>
);

const SvgPhysio = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="20" cy="8" r="4"/>
    <line x1="20" y1="12" x2="20" y2="24"/>
    <line x1="20" y1="16" x2="10" y2="10"/>
    <line x1="20" y1="16" x2="30" y2="10"/>
    <line x1="20" y1="24" x2="13" y2="33"/>
    <line x1="20" y1="24" x2="27" y2="33"/>
  </svg>
);

const SvgNutrition = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9" stroke="#0d9488" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13 Q14 13 11 18 Q8 23 10 29 Q12 35 17 36 Q19 37 20 35 Q21 37 23 36 Q28 35 30 29 Q32 23 29 18 Q26 13 20 13Z"/>
    <path d="M20 13 Q20 9 23 7"/>
    <path d="M23 7 Q27 7 26 11 Q24 12 23 10"/>
  </svg>
);

/* ── Icon matcher ── */
const getIconForDepartment = (name: string): React.ComponentType => {
  const n = name.toLowerCase();
  if (n.includes("cardiol") || n.includes("heart"))                                          return SvgCardiology;
  if (n.includes("neurol") || n.includes("brain"))                                           return SvgNeurology;
  if (n.includes("orthop") || n.includes("orthopaed") || n.includes("bone"))                 return SvgOrthopedics;
  if (n.includes("pediatr") || n.includes("paediatr") || n.includes("child") || n.includes("neonat")) return SvgPediatrics;
  if (n.includes("gynecol") || n.includes("gynaecol") || n.includes("obstet"))               return SvgGynecology;
  if (n.includes("pulmon") || n.includes("chest") || n.includes("thorac") || n.includes("lung") || n.includes("respirat")) return SvgPulmonology;
  if (n.includes("ent") || n.includes("ear") || n.includes("nose") || n.includes("throat"))  return SvgENT;
  if (n.includes("ophthal") || n.includes("eye") || n.includes("vision"))                    return SvgOphthalmology;
  if (n.includes("dermat") || n.includes("skin"))                                             return SvgDermatology;
  if (n.includes("urol") || n.includes("nephr") || n.includes("kidney") || n.includes("renal")) return SvgUrology;
  if (n.includes("gastro") || n.includes("stomach") || n.includes("digest") || n.includes("liver")) return SvgGastro;
  if (n.includes("psychi") || n.includes("mental") || n.includes("behav"))                   return SvgPsychiatry;
  if (n.includes("dent") || n.includes("oral") || n.includes("tooth"))                       return SvgDentistry;
  if (n.includes("surg") || n.includes("operation"))                                          return SvgSurgery;
  if (n.includes("radiol") || n.includes("imaging") || n.includes("x-ray") || n.includes("mri")) return SvgRadiology;
  if (n.includes("diabet") || n.includes("endocrin") || n.includes("thyroid"))               return SvgDiabetes;
  if (n.includes("oncol") || n.includes("cancer") || n.includes("tumor"))                    return SvgOncology;
  if (n.includes("hematol") || n.includes("blood") || n.includes("thalassem"))               return SvgHematology;
  if (n.includes("physio") || n.includes("rehabilit"))                                        return SvgPhysio;
  if (n.includes("nutrit") || n.includes("diet"))                                             return SvgNutrition;
  return SvgMedicine;
};

/* Faded watermark curve behind icon — matches Figma */
const WatermarkCurve = () => (
  <svg
    viewBox="0 0 120 100"
    fill="none"
    className="absolute top-1 right-1 w-28 h-24 pointer-events-none select-none"
    style={{ opacity: 0.07 }}
  >
    <path d="M10 80 Q30 20 60 40 Q90 60 110 10" stroke="#0d9488" strokeWidth="18" strokeLinecap="round"/>
  </svg>
);

/* ════════════════════════════════════════════════════════════════════════════
   Component
════════════════════════════════════════════════════════════════════════════ */

export default function DepartmentSection() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();
  const t = homepageTranslations[language].departments;

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await fetch("/api/departments");
        const data = await res.json();
        if (res.ok) setDepartments(data.departments.slice(0, 12));
      } catch (err) {
        console.error("Error fetching departments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-16 bg-white flex justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full py-8 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-3 text-slate-800 tracking-tight leading-snug">
            {t.title}
          </h2>
          <p className="text-[11px] sm:text-[13px] text-slate-500 max-w-sm mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </motion.div>

        {/* ── Desktop Slider ── */}
        <div className="hidden md:block relative">
          {/* Left arrow */}
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute -left-5 lg:-left-8 top-1/2 -translate-y-1/2 z-10 text-slate-400 hover:text-primary transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-7 h-7" strokeWidth={1.8} />
          </button>

          {/* Right arrow */}
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute -right-5 lg:-right-8 top-1/2 -translate-y-1/2 z-10 text-slate-400 hover:text-primary transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-7 h-7" strokeWidth={1.8} />
          </button>

          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={2}
            loop={departments.length > 4}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            onSwiper={(s) => { swiperRef.current = s; }}
            breakpoints={{
              768:  { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
            }}
          >
            {departments.map((dept) => {
              const Icon = getIconForDepartment(dept.name);
              const slug = dept.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

              return (
                <SwiperSlide key={dept._id}>
                  <Link href={`/departments/${encodeURIComponent(slug)}`} className="block group">
                    {/* Clean card — icon top, name bottom, no button inside */}
                    <div className="relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 group-hover:-translate-y-1 p-6 overflow-hidden h-[180px] flex flex-col justify-between border border-slate-100">
                      <WatermarkCurve />

                      {/* Icon — no background box, bare outline SVG */}
                      <div className="relative z-10">
                        <Icon />
                      </div>

                      {/* Department name only */}
                      <h3 className="relative z-10 text-[17px] font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200">
                        {getLocalizedValue(dept.name, dept.nameBn, language)}
                      </h3>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* ── Mobile Swiper — single large card per slide ── */}
        <div className="md:hidden">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            loop={departments.length > 1}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
          >
            {departments.map((dept) => {
              const Icon = getIconForDepartment(dept.name);
              const slug = dept.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
              return (
                <SwiperSlide key={dept._id}>
                  <Link href={`/departments/${encodeURIComponent(slug)}`} className="block">
                    <div className="relative bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col overflow-hidden min-h-[180px] justify-between">
                      <WatermarkCurve />
                      <div className="relative z-10 mb-4">
                        <div className="w-12 h-12"><Icon /></div>
                      </div>
                      <h3 className="relative z-10 text-[20px] font-bold text-slate-800 leading-snug">
                        {getLocalizedValue(dept.name, dept.nameBn, language)}
                      </h3>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* ── "Other Departments" button with ServicesSection hover-swap ──
            group/btn scopes hover to this button only.
            Default:  teal filled pill "Other Departments"
            On hover: fades out → teal "View All + ArrowUpRight" fades in
        ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex justify-center"
        >
          <Link href="/departments">
            <div className="group/btn relative h-11 flex items-center">

              {/* Default state — filled teal pill */}
              <span className="inline-flex items-center h-11 px-8 rounded-full text-[14px] font-medium bg-primary text-white transition-all duration-200 group-hover/btn:opacity-0 group-hover/btn:scale-90 whitespace-nowrap">
                {t.otherDepts}
              </span>

              {/* Hover state — darker teal + "View All" + arrow */}
              <span className="absolute left-0 top-0 inline-flex items-center gap-2 h-11 px-8 rounded-full text-[14px] font-semibold bg-primary-dark text-white whitespace-nowrap pointer-events-none opacity-0 scale-90 group-hover/btn:opacity-100 group-hover/btn:scale-100 transition-all duration-200">
                {t.viewAll}
                <ArrowUpRight className="w-4 h-4" />
              </span>

            </div>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}