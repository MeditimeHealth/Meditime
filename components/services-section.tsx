"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function ServicesSection() {
  const services = [
    {
      image: "/impression-1.png",
      title: "Doctor Appointment Booking",
      cta: "Book Appointment",
      href: "/doctor",
      description:"Find the Most Experienced doctors in Savar and nearby areas from 1000+ Specialities and 20+ Departments."
    },
    {
      image: "/impression-2.png",
      title: "Find the Best Hospitals Near You",
      cta: " Hospital List",
      href: "/hospital",
      description:"Find 40+ renowned Specialized and General Hospitals Near You in Ashulia, Savar, and surroundings."
    },
    {
      image: "/impression-3.png",
      title: "Video Call with Doctor",
      cta: "Book Consultation",
      href: "/",
      description:"Talk With Doctors from 40+ Hospitals Seating at Your Home Using our Meditime Mobile Application."
    },
    {
      image: "/impression-4.png",
      title: "Most Affordable Diagnostic Tests",
      cta: "Compare Prices",
      href: "/diagnostic",
      description:"Find the most affordable Diagnostic Tests Options in Gazipur, Ashulia, Kaliyakoir, Dhamrai, and Konabari."
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 bg-white">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-center text-primary leading-tight"
        >
          Meditime Services
        </h2>
      </motion.div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {services.map((service, index) => {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={service.href} className="block h-full group">
                <Card className="p-4 sm:p-6 lg:p-8 bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col cursor-pointer rounded-xl sm:rounded-2xl group-hover:-translate-y-2 relative overflow-hidden">
                  {/* Hover Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Icon */}
                  <div className="mb-4 sm:mb-6 flex justify-start">
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 flex items-center justify-center bg-teal-50 rounded-xl sm:rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all duration-300 p-2 sm:p-3">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={48}
                        height={48}
                        className="object-contain w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mb-2 sm:mb-4">
                    <h3
                      className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 mb-1 sm:mb-2 group-hover:text-primary transition-colors leading-snug"
                    >
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">
                    {service?.description}
                  </p>

                  {/* CTA Button */}
                  <div className="mt-auto pt-2 sm:pt-4">
                    <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-primary text-white rounded-full text-xs sm:text-sm font-semibold group-hover:bg-primary/90 transition-all duration-300 shadow-md group-hover:shadow-lg">
                      {service.cta}
                      <svg className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
              </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

