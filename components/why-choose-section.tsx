"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";

/* ─── Inline SVG icons — matched to Figma vectors ─────────────────────────
   Each icon sits inside a 56×56 teal rounded-xl container.
   All strokes are white, strokeWidth ~1.8–2 for clean rendering at this size.
──────────────────────────────────────────────────────────────────────────── */

/* Card 1: Stethoscope (Anytime Doctor) */
const IconStethoscope = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    {/* Ear tubes */}
    <path d="M6 4 L6 11 Q6 16 11 16" stroke="white" strokeWidth="1.9" strokeLinecap="round" fill="none"/>
    <path d="M18 4 L18 11 Q18 16 13 16" stroke="white" strokeWidth="1.9" strokeLinecap="round" fill="none"/>
    {/* Ear tips */}
    <circle cx="6" cy="3.5" r="1.5" fill="white"/>
    <circle cx="18" cy="3.5" r="1.5" fill="white"/>
    {/* Tube going down from chest piece */}
    <path d="M12 16 Q12 22 17 22 Q22 22 22 17" stroke="white" strokeWidth="1.9" strokeLinecap="round" fill="none"/>
    {/* Chest piece circle */}
    <circle cx="11.5" cy="16" r="1.8" fill="white"/>
    {/* End bulb */}
    <circle cx="22" cy="15.5" r="2.5" stroke="white" strokeWidth="1.9" fill="none"/>
    <circle cx="22" cy="15.5" r="1" fill="white"/>
  </svg>
);

/* Card 2: Credit card (No Advance Payments) */
const IconCreditCard = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    {/* Card outline */}
    <rect x="2" y="7" width="24" height="14" rx="2.5" stroke="white" strokeWidth="1.9" fill="none"/>
    {/* Stripe */}
    <rect x="2" y="11" width="24" height="3.5" fill="white" opacity="0.9"/>
    {/* Chip dots */}
    <rect x="5" y="17" width="5" height="2" rx="1" fill="white" opacity="0.7"/>
    <rect x="12" y="17" width="3" height="2" rx="1" fill="white" opacity="0.7"/>
  </svg>
);

/* Card 3: 24/7 Clock (Available 24/7) */
const IconClock247 = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    {/* Clock circle */}
    <circle cx="14" cy="14" r="11" stroke="white" strokeWidth="1.9" fill="none"/>
    {/* Hour hand */}
    <line x1="14" y1="14" x2="14" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    {/* Minute hand */}
    <line x1="14" y1="14" x2="18.5" y2="16.5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    {/* Center dot */}
    <circle cx="14" cy="14" r="1.2" fill="white"/>
    {/* "24/7" text rendered as small tick marks at 12, 3, 6, 9 */}
    <line x1="14" y1="4" x2="14" y2="5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="24" y1="14" x2="22.5" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="14" y1="24" x2="14" y2="22.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="4" y1="14" x2="5.5" y2="14" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

/* Card 4: Headphones (Expert Help) */
const IconHeadphones = () => (
  <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
    {/* Arc */}
    <path d="M5 14 Q5 5 14 5 Q23 5 23 14" stroke="white" strokeWidth="1.9" strokeLinecap="round" fill="none"/>
    {/* Left ear cup */}
    <rect x="3" y="13" width="5" height="8" rx="2.5" stroke="white" strokeWidth="1.9" fill="none"/>
    {/* Right ear cup */}
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
    highlight: true,
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
    <div className="bg-gray-50 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header — matches Figma: large bold title, small muted subtitle ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          {/* Figma title: ~36–40px, bold, max ~600px wide, 2-line break */}
          <h2 className="text-3xl sm:text-4xl font-bold mb-3 text-slate-800 tracking-tight max-w-2xl mx-auto leading-snug">
            Choose Meditime for Simplified Medical Services in Time
          </h2>
          {/* Figma subtitle: ~14px, muted, max ~420px */}
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Choosing Meditime helps you bring speed in your doctor appointment
            booking process which significantly reduces the risk of being late
            to receive quality medical services
          </p>
        </motion.div>

        {/* ── Feature Cards — compact to match Figma card height ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map(({ Icon, title, description, highlight }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
            >
              <Card
                className={`p-5 border flex flex-col items-center text-center rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                  highlight
                    ? "bg-yellow-300 border-yellow-300"
                    : "bg-white border-slate-200"
                }`}
              >
                {/* ── Teal rounded-xl icon box — matches Figma shape ── */}
                <div className="mb-4">
                  <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shrink-0">
                    <Icon />
                  </div>
                </div>

                {/* ── Title: ~15px bold, tight line-height ── */}
                <h3
                  className={`text-[15px] font-bold mb-2 leading-snug ${
                    highlight ? "text-slate-900" : "text-slate-800"
                  }`}
                >
                  {title}
                </h3>

                {/* ── Description: ~13px, relaxed ── */}
                <p
                  className={`text-[13px] leading-relaxed ${
                    highlight ? "text-slate-800" : "text-slate-500"
                  }`}
                >
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