"use client";

import { motion } from "framer-motion";
import { Users, Building2, Stethoscope, HeadphonesIcon } from "lucide-react";

export default function StatsSection() {
  const stats = [
    { number: "1000+", label: "Happy Patients", icon: Users },
    { number: "40+",   label: "Hospitals",      icon: Building2 },
    { number: "1000+", label: "Doctors",         icon: Stethoscope },
    { number: "24/7",  label: "Support",         icon: HeadphonesIcon },
  ];

  return (
    /* Solid teal background — matches Figma exactly */
    <div className="w-full bg-primary py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                {/* Slightly lighter teal card */}
                <div className="flex flex-col items-center text-center p-6 lg:p-8 rounded-2xl bg-white/10 border border-white/10">
                  {/* White circle icon */}
                  <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mb-5 shrink-0">
                    <IconComponent className="w-6 h-6 text-primary" strokeWidth={1.5} />
                  </div>

                  {/* Number */}
                  <div className="text-4xl md:text-5xl font-extrabold text-white mb-2 leading-none">
                    {stat.number}
                  </div>

                  {/* Label */}
                  <div className="text-sm md:text-base text-white/80 font-medium">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}