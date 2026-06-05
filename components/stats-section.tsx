"use client"
import { useEffect, useState, useRef } from "react";
import { motion, useInView, useSpring, useTransform } from "framer-motion";
import { PiUsersThreeDuotone, PiHospitalDuotone, PiStethoscopeDuotone, PiHeadsetDuotone } from "react-icons/pi";

function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  
  const spring = useSpring(0, {
    stiffness: 40,
    damping: 20,
    restDelta: 0.001
  });
  
  const displayValue = useTransform(spring, (current) => Math.floor(current));

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, spring, value]);

  return (
    <span ref={ref}>
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
}

const stats = [
  { value: 1000, suffix: "+", label: "Happy Patients", icon: PiUsersThreeDuotone },
  { value: 40,   suffix: "+", label: "Partner Hospitals", icon: PiHospitalDuotone },
  { value: 1000, suffix: "+", label: "Expert Doctors", icon: PiStethoscopeDuotone },
  { value: 24,   suffix: "/7", label: "Support", icon: PiHeadsetDuotone },
];

/* ════════════════════════════════════════════════════════════════════════════
   Component
════════════════════════════════════════════════════════════════════════════ */

export default function StatsSection() {
  return (
    <div className="w-full mx-auto my-6 sm:my-10 py-12 sm:py-20 bg-white relative overflow-hidden mx-auto rounded-none sm:rounded-[40px] shadow-sm border-y sm:border border-slate-100">
      <div className="relative z-10 container mx-auto px-6 sm:px-10 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(({ value, suffix, label, icon: Icon }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className={`btn-slide
               group flex flex-col items-center text-center p-12 sm:p-16 
               rounded-none transition-all duration-500 btn-primary shadow-xl 
               min-h-[280px] h-full justify-center ${index === 0 ? "rounded-none rounded-tl-4xl" : "rounded-none rounded-br-4xl"}`}>
                {/* Icon */}
                <div className="mb-6 text-[#20E7E7] transition-all duration-300 group-hover:scale-110 group-hover:brightness-125">
                  <Icon size={72} height="duotone" />
                </div>

                {/* Stat number with Counter */}
                <div className="text-[48px] sm:text-[60px] font-bold text-white mb-2 leading-none transition-colors duration-300">
                  <Counter value={value} suffix={suffix} />
                </div>

                {/* Label */}
                <div className="text-[16px] text-teal-100/70 font-bold uppercase tracking-widest transition-colors duration-300">
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