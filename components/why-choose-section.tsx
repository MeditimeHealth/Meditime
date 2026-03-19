"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

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

/* ─── Feature data ───────────────────────────────────────────────────────── */

const features = [
  {
    Icon: IconStethoscope,
    title: "Anytime Doctor - From Anywhere",
    description:
      "Meditime website and mobile app are designed to help you find doctors, schedule appointments, compare the prices of diagnostic tests in different hospitals, and many more in just one place.",
    highlight: false,
  },
  {
    Icon: IconCreditCard,
    title: "No Advance Payments of Fees",
    description:
      "To enjoy any of our services like finding doctor information, booking a consultation, access to an extended list of blood donors and ambulance contacts are completely free.",
  },
  {
    Icon: IconClock247,
    title: "Available 24/7",
    description:
      "You can book doctor appointments anytime that is convenient for you, seven days a week, every hour of the day. Use the Doctor Search to find the best doctors.",
    highlight: false,
  },
  {
    Icon: IconHeadphones,
    title: "Expert Help",
    description:
      "The Meditime Customer Support team is always ready to help you with any difficulties you may encounter while using our platform.",
    highlight: false,
  },
];

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function WhyChooseSection() {
  return (
    <div className="bg-[#ECECEE] py-10 max-w-[1920px] w-full mx-auto sm:py-14">
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
          <h2 className="text-3xl sm:text-[42px] font-bold mb-3 text-slate-800 tracking-tight max-w-[804px] mx-auto leading-[1.15]">
            Choose Meditime for <br className="hidden sm:block" /> Simplified Medical Services in Time
          </h2>
          <p className="text-sm sm:text-[14px] text-slate-500 max-w-[650px] mx-auto leading-relaxed">
            Choosing Meditime helps you bring speed in your doctor <br className="hidden sm:block" />
            appointment booking process which significantly reduces <br className="hidden sm:block" />
            the risk of being late to receive quality medical services
          </p>
        </motion.div>

        {/* ── Feature Cards ──
            KEY FIX: `items-stretch` on the grid + `h-full` on motion.div + Card
            forces all 4 cards to the same height regardless of content length.
            `flex flex-col` on Card + `flex-grow` on description fills the space.
        ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
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
                className="p-5 border h-full flex flex-col items-center text-center rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-white border-slate-200 group hover:bg-[#FFCC53] hover:border-[#FFCC53]"
              >
                {/* Icon */}
                <div className="mb-4 shrink-0">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center">
                    <Icon />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-[15px] font-bold mb-2 leading-snug shrink-0 text-slate-800 group-hover:text-slate-900">
                  {title}
                </h3>

                {/* Description — flex-grow pushes it to fill remaining space
                    so all cards have the same total height */}
                <p className="text-[13px] leading-relaxed flex-grow text-slate-500 group-hover:text-slate-700">
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