"use client";

import { motion } from "framer-motion";

export default function StatsSection() {
  const stats = [
    {
      number: "1000+",
      label: "Happy Patients",
    },
    {
      number: "30+",
      label: "Hospitals",
    },
    {
      number: "1000+",
      label: "Doctors",
    },
    {
      number: "24/7",
      label: "Support",
    },
  ];

  return (
    <div className="w-full py-16 bg-gradient-to-r from-[#009A98]/10 via-[#009A98]/5 to-[#00B5B2]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2"
                style={{
                  color: "#009A98",
                }}
              >
                {stat.number}
              </div>
              <div
                className="text-sm md:text-base lg:text-lg text-gray-600"
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
