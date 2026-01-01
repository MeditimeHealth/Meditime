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
      description:
        "Find the Most Experienced Physician from 20+ Specialities and Departments. Easy booking, guaranteed visit, with no advance payment. Pay only when you visit the hospital.",
      href: "/doctor",
    },
    {
      image: "/impression-2.png",
      title: "Find the Best Hospitals Near You",
      description:
        "Find Specialized and General Hospitals Near You in the Dhaka Surroundings. From semi-government hospitals to private clinics, our network covers it all. We have compiled 30+ hospitals.",
      href: "/hospital",
    },
    {
      image: "/impression-3.png",
      title: "Video Call with Doctor",
      description:
        "Known as Online Doctor Appointment, this service lets you talk directly with a doctor from your home. Ideal for seniors, pregnant women, and people with disabilities.",
      href: "/",
    },
    {
      image: "/impression-4.png",
      title: "Most Affordable Diagnostic Tests",
      description:
        "Find the most affordable options for medical tests such as blood tests, urine tests, CBC tests, CMP, and more. Compare prices and save your money and time.",
      href: "/diagnostic",
    },
    {
      image: "/impression-1.png",
      title: "Health Tips",
      description:
        "The More You Know About a Problem, the Easier It Becomes to Solve. Read blogs that will help you find simple solutions for your medical issues.",
      href: "/blog",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h2
          className="text-4xl md:text-5xl font-bold mb-6 text-left text-primary"
        >
          Our Services – You are the only one we care about
        </h2>
        
        <div className="space-y-4 mb-8">
          <p
            className="text-base md:text-lg text-gray-700 leading-relaxed"
          >
            With a broad range of health information and services, we have been a proud partner in booking 1,000+ doctor appointments online, minimizing the effort, time, and resources used in searching fresh and reliable medical information.
          </p>
          <p
            className="text-base md:text-lg text-gray-700 leading-relaxed"
          >
            Our lab test booking services have simplified the process of finding the most dependable and affordable diagnostic test options near you in Savar, Konabari, Gazipur, and beyond.
          </p>
        </div>
      </motion.div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                <Card className="p-8 bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 h-full flex flex-col cursor-pointer rounded-2xl group-hover:-translate-y-2 relative overflow-hidden">
                  {/* Hover Gradient Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  
                  {/* Icon */}
                  <div className="mb-6 flex justify-start">
                    <div className="relative w-16 h-16 flex items-center justify-center bg-teal-50 rounded-2xl group-hover:bg-white group-hover:shadow-md transition-all duration-300 p-3">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={48}
                        height={48}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mb-4">
                    <h3
                      className="text-xl font-bold text-slate-800 mb-2 group-hover:text-primary transition-colors"
                    >
                      {service.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p
                    className="text-sm md:text-base text-slate-600 leading-relaxed grow"
                  >
                    {service.description}
                  </p>
                  
                  {/* Arrow Indicator */}
                   <div className="mt-4 flex justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
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

