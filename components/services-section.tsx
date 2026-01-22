"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

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
      cta: "Hospital List",
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-white">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-primary bg-primary/8 rounded-full border border-primary/20">
          Our Services
        </span>
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-800 tracking-tight"
        >
          Meditime <span className="text-gradient">Services</span>
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Comprehensive healthcare solutions designed to make your medical journey seamless and accessible
        </p>
      </motion.div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
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
                <Card className="p-6 lg:p-8 bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col cursor-pointer rounded-2xl group-hover:-translate-y-3 relative overflow-hidden">
                  {/* Subtle Gradient Background on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
                  
                  {/* Top Accent Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary-light to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                  
                  {/* Icon */}
                  <div className="mb-6 flex justify-start relative">
                    <div className="relative w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center bg-gradient-to-br from-primary-50 to-teal-50 rounded-2xl group-hover:from-white group-hover:to-primary-50 group-hover:shadow-lg transition-all duration-500 p-4 border border-primary/10">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={48}
                        height={48}
                        className="object-contain w-10 h-10 lg:w-12 lg:h-12 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mb-3">
                    <h3
                      className="text-lg lg:text-xl font-bold text-slate-800 group-hover:text-primary transition-colors duration-300 leading-snug"
                    >
                      {service.title}
                    </h3>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed flex-grow">
                    {service?.description}
                  </p>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-full text-sm font-semibold group-hover:from-primary-dark group-hover:to-primary transition-all duration-300 shadow-md group-hover:shadow-lg group-hover:shadow-primary/20">
                      {service.cta}
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
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
