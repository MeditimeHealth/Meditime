"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export default function ServicesSection() {
  const services = [
    {
      image: "/impression-1.png",
      title: "Doctor Appointment Booking",
      cta: "Book Appointment",
      href: "/doctor",
      description:
        "Find the Most Experienced Physician from 20+ Specialities and Departments. Easy booking, guaranteed visit",
      highlight: false,
      showArrow: false,
    },
    {
      image: "/impression-2.png",
      title: "Find the Best Hospitals Near You",
      cta: "Hospital List",
      href: "/hospital",
      description:
        "Find Specialized and General Hospitals Near You in the Dhaka Surroundings.",
      highlight: false,
      showArrow: false,
    },
    {
      image: "/impression-3.png",
      title: "Video Call with Doctor",
      cta: "Book Consultation",
      href: "/video-consultation",
      description:
        "Known as Online Doctor Appointment, this service lets you talk directly with a doctor from your home.",
      highlight: false,
      showArrow: false,
    },
    {
      image: "/impression-4.png",
      title: "Most Affordable Diagnostic Tests Options",
      cta: "Compare Prices",
      href: "/diagnostic",
      description:
        "Diagnostic tests account for a significant portion of healthcare costs, potentially over 10% of total medical",
      highlight: false,
      showArrow: true,
    },
    {
      image: "/impression-1.png",
      title: "Blood Donor Contact",
      cta: "Find Donors",
      href: "/blood-donors",
      description:
        "31% of all maternal deaths happen due to haemorrhage (severe blood loss). Timely blood transfusion could save",
      highlight: false,
      showArrow: false,
    },
    {
      image: "/impression-2.png",
      title: "Ambulance Contact",
      cta: "Book Consultation",
      href: "/ambulance",
      description:
        "We have a comprehensive list of ambulance contact numbers in Savar and nearby areas.",
      highlight: true, // yellow card
      showArrow: false,
    },
  ];

  return (
    <div className="bg-gray-50 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-800 tracking-tight">
            Meditime Services
          </h2>
          <p className="text-slate-500 max-w-md mx-auto text-base leading-relaxed">
            Meditime has a broad range of medical information services from
            doctors' appointment booking to ambulance contact numbers.
          </p>
        </motion.div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="h-full"
            >
              <Link href={service.href} className="block h-full">
                <Card
                  className={`p-6 lg:p-8 border h-full flex flex-col rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                    service.highlight
                      ? "bg-yellow-400 border-yellow-400 shadow-md"
                      : "bg-white border-slate-200 shadow-sm"
                  }`}
                >
                  {/* Teal circle icon */}
                  <div className="mb-5">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={32}
                        height={32}
                        className="object-contain w-7 h-7 invert brightness-200"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-lg font-bold mb-3 leading-snug ${
                      service.highlight ? "text-slate-900" : "text-slate-800"
                    }`}
                  >
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-sm leading-relaxed flex-grow mb-6 line-clamp-3 ${
                      service.highlight ? "text-slate-800" : "text-slate-500"
                    }`}
                  >
                    {service.description}
                  </p>

                  {/* CTA — swaps to "View More" only when hovering the button itself */}
                  <div className="mt-auto flex items-center gap-3">
                    <div className="group/btn relative h-9 flex items-center">
                      {/* Default outlined button */}
                      <span
                        className={`inline-flex items-center px-5 py-2 rounded-full text-sm font-medium border transition-all duration-200 group-hover/btn:opacity-0 group-hover/btn:scale-90 ${
                          service.highlight
                            ? "bg-white border-white text-slate-800"
                            : "bg-white border-slate-300 text-slate-700"
                        }`}
                      >
                        {service.cta}
                      </span>
                      {/* Hover: filled teal "View More" — only on button hover */}
                      <span className="absolute left-0 inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold bg-primary text-white opacity-0 scale-90 group-hover/btn:opacity-100 group-hover/btn:scale-100 transition-all duration-200 whitespace-nowrap pointer-events-none">
                        View More
                        <ArrowUpRight className="w-4 h-4" />
                      </span>
                    </div>
                    {service.showArrow && (
                      <span className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 ml-1">
                        <ArrowRight className="w-4 h-4 text-white" />
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}