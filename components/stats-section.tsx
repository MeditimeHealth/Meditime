"use client";

import { motion } from "framer-motion";
import { Users, Building2, Stethoscope, HeadphonesIcon } from "lucide-react";

export default function StatsSection() {
  const stats = [
    {
      number: "1000+",
      label: "Happy Patients",
      icon: Users,
    },
    {
      number: "30+",
      label: "Hospitals",
      icon: Building2,
    },
    {
      number: "1000+",
      label: "Doctors",
      icon: Stethoscope,
    },
    {
      number: "24/7",
      label: "Support",
      icon: HeadphonesIcon,
    },
  ];

  return (
    <div className="w-full py-20 relative overflow-hidden">
      {/* Sophisticated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGZpbGw9IiMxNDE0MTQiIGQ9Ik0wIDBoNjB2NjBIMHoiLz48Y2lyY2xlIGZpbGw9IiMyMjIiIGN4PSIzMCIgY3k9IjMwIiByPSIxIi8+PC9nPjwvc3ZnPg==')] opacity-30" />
      
      {/* Accent Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center group"
              >
                {/* Glassmorphism Card */}
                <div className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-500 group-hover:scale-105">
                  {/* Icon */}
                  <div className="mx-auto mb-4 w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                    <IconComponent className="w-7 h-7 text-primary" />
                  </div>
                  
                  {/* Number */}
                  <div
                    className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-2 bg-gradient-to-r from-white via-white to-primary-light bg-clip-text text-transparent"
                  >
                    {stat.number}
                  </div>
                  
                  {/* Label */}
                  <div className="text-sm md:text-base lg:text-lg text-slate-400 font-medium tracking-wide">
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
