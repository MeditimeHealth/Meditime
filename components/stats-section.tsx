"use client";

import { motion } from "framer-motion";

/* ════════════════════════════════════════════════════════════════════════════
   SVG icons — teal outline, matched to Figma
════════════════════════════════════════════════════════════════════════════ */

const IconPatients = () => (
  <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6" stroke="#0d9488" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="8" r="3.5"/>
    <path d="M5 22 Q5 16 11 16 Q17 16 17 22"/>
    <circle cx="19" cy="7" r="3" strokeWidth="1.5"/>
    <path d="M16 22 Q16 16 19 15.5 Q23 15 23 19" strokeWidth="1.5"/>
  </svg>
);

const IconHospital = () => (
  <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6" stroke="#0d9488" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="8" width="20" height="17" rx="1.5"/>
    <path d="M2 10 L14 3 L26 10"/>
    <rect x="11" y="18" width="6" height="7" rx="0.5"/>
    <line x1="14" y1="10.5" x2="14" y2="15.5"/>
    <line x1="11.5" y1="13" x2="16.5" y2="13"/>
  </svg>
);

const IconDoctors = () => (
  <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6" stroke="#0d9488" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="14" cy="7.5" r="4"/>
    <path d="M8 27 L8 20 Q8 15 14 15 Q20 15 20 20 L20 27"/>
    <path d="M10 16 Q8 16 8 19"/>
    <path d="M18 16 Q20 16 20 19"/>
    <path d="M8 19 Q8 23 11 23 Q14 23 14 20" strokeWidth="1.4"/>
    <circle cx="14" cy="19.5" r="1.5" strokeWidth="1.4"/>
  </svg>
);

const IconSupport = () => (
  <svg viewBox="0 0 28 28" fill="none" className="w-6 h-6" stroke="#0d9488" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 15 Q5 7 14 7 Q23 7 23 15"/>
    <rect x="3" y="14" width="4" height="7" rx="2"/>
    <rect x="21" y="14" width="4" height="7" rx="2"/>
    <path d="M21 20 Q21 24 18 24 L16 24" strokeWidth="1.5"/>
    <circle cx="15.5" cy="24" r="1" fill="#0d9488" stroke="none"/>
  </svg>
);

/* ════════════════════════════════════════════════════════════════════════════
   Stats data
════════════════════════════════════════════════════════════════════════════ */

const stats = [
  { number: "1000+", label: "Happy Patients", Icon: IconPatients },
  { number: "40+",   label: "Hospitals",       Icon: IconHospital },
  { number: "1000+", label: "Doctors",          Icon: IconDoctors  },
  { number: "24/7",  label: "Support",          Icon: IconSupport  },
];

/* ════════════════════════════════════════════════════════════════════════════
   Component
════════════════════════════════════════════════════════════════════════════ */

export default function StatsSection() {
  return (
    /*
      ── Section background: teal radial gradient ──────────────────────────
      Figma shows a lighter teal center bleeding to deeper teal at edges —
      achieved with a radial gradient layered over a solid base teal.
      Two overlapping radial blobs give the organic glow seen in Figma.
    */
    <div
      className="w-full mx-auto py-10 sm:py-16 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(90deg, rgba(5, 69, 66, 0.75) 0%, rgba(3, 86, 83, 0.765) 25%, rgba(0, 103, 99, 0.78) 50%, #0F7E7A 100%)",
      }}
    >
      {/* Decorative radial glows — match the lighter patches in Figma */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 70% at 20% 30%, rgba(255,255,255,0.08) 0%, transparent 70%), " +
            "radial-gradient(ellipse 40% 50% at 80% 70%, rgba(255,255,255,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {stats.map(({ number, label, Icon }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              {/*
                ── Glass card ────────────────────────────────────────────────
                Figma card: frosted glass — semi-transparent white bg,
                backdrop-blur, soft white border, rounded-2xl
                bg: rgba(255,255,255,0.12)
                border: rgba(255,255,255,0.25)
                backdrop-filter: blur(12px)
              */}
              <div
                className="flex flex-col items-center text-center p-4 sm:p-8 sm:p-12 gap-3 sm:gap-6 rounded-[16px] sm:rounded-[20px] transition-transform duration-300 hover:-translate-y-1 w-full lg:max-w-[422px] lg:h-[298px] flex-grow justify-center"
                style={{
                  background: "rgba(240, 240, 240, 0.19)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                {/* White circle — teal SVG icon inside */}
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-white flex items-center justify-center mb-2 sm:mb-5 shrink-0 shadow-sm">
                  <Icon />
                </div>

                {/* Stat number */}
                <div className="text-2xl sm:text-4xl md:text-[52px] font-bold text-white mb-1 sm:mb-1.5 leading-none">
                  {number}
                </div>

                {/* Label */}
                <div className="text-[11px] sm:text-[13px] md:text-sm text-white/80 font-normal">
                  {label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}