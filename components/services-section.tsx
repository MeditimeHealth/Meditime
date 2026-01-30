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
      description: "Find the Most Experienced Physician from 20+ Specialities and Departments. Easy booking, guaranteed visit, with no advance payment. Pay only when you visit the doctor's chamber. We have listed top doctors from 40+ leading hospitals in Savar, Gazipur, Ashulia, Kaliyakoir, Dhamrai and nearby areas."
    },
    {
      image: "/impression-2.png",
      title: "Find the Best Hospitals Near You",
      cta: "Hospital List",
      href: "/hospital",
      description: "Find Specialized and General Hospitals Near You in the Dhaka Surroundings. From semi-government hospitals to private clinics, our network covers it all, keeping your needs and preferences in mind. We have compiled 30+ hospitals, bringing all the information you need at a glance."
    },
    {
      image: "/impression-3.png",
      title: "Video Call with Doctor",
      cta: "Book Consultation",
      href: "/video-consultation",
      description: "Known as Online Doctor Appointment, this service lets you talk directly with a doctor from your home. It is ideal for seniors, pregnant women, and people with disabilities. By booking an online consultation, you can speak to the doctor live using your smartphone from anywhere you feel comfortable."
    },
    {
      image: "/impression-4.png",
      title: "Most Affordable Diagnostic Tests Options",
      cta: "Compare Prices",
      href: "/diagnostic",
      description: "Diagnostic tests account for a significant portion of healthcare costs, potentially over 10% of total medical spending. Meditime is designed to help you find the most affordable options for medical tests such as blood tests, urine tests, CBC tests, CMP, and more in renowned hospitals."
    },
    {
      image: "/impression-1.png", 
      title: "Blood Donor Contact",
      cta: "Find Donors",
      href: "/blood-donors",
      description: "31% of all maternal deaths happen due to haemorrhage (severe blood loss). Timely blood transfusion could save half of these lives. Just like the Bangla classics in real life, collecting blood for patients has become a major challenge in Bangladesh. Considering this situation, we have created a list of blood donors in Savar and nearby areas."
    },
    {
      image: "/impression-2.png",
      title: "Ambulance Contact",
      cta: "Find Ambulance",
      href: "/ambulance",
      description: "We have a comprehensive list of ambulance contact numbers in Savar and nearby areas. In emergency situations, when every second matters, you can access ambulance services easily."
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 bg-white">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        {/* <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-primary bg-primary/8 rounded-full border border-primary/20">
          Our Services
        </span> */}
        <h2
          className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-slate-800 tracking-tight"
        >
          Meditime <span className="text-gradient">Services</span>
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
          Meditime has a broad range of medical information services from doctors’ appointment booking to ambulance contact numbers.
        </p>
      </motion.div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {services.map((service, index) => {
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <Link href={service.href} className="block h-full group">
                <Card className={`p-6 lg:p-8 border border-slate-200 shadow-md transition-all duration-500 h-full flex flex-col cursor-pointer rounded-2xl group-hover:-translate-y-2 relative overflow-hidden ${
                  index % 3 === 0 ? "bg-gradient-to-br from-blue-50 to-cyan-50 group-hover:from-blue-100 group-hover:to-cyan-100 group-hover:shadow-xl group-hover:shadow-blue-200" : 
                  index % 3 === 1 ? "bg-gradient-to-br from-teal-50 to-green-50 group-hover:from-teal-100 group-hover:to-green-100 group-hover:shadow-xl group-hover:shadow-teal-200" :
                  "bg-gradient-to-br from-purple-50 to-pink-50 group-hover:from-purple-100 group-hover:to-pink-100 group-hover:shadow-xl group-hover:shadow-purple-200"
                }`}>
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-500 pointer-events-none ${
                    index % 3 === 0 ? "bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-300" :
                    index % 3 === 1 ? "bg-gradient-to-br from-teal-400 via-green-400 to-teal-300" :
                    "bg-gradient-to-br from-purple-400 via-pink-400 to-purple-300"
                  }`} />
                  
                  {/* Top Accent Line */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ${
                    index % 3 === 0 ? "bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500" :
                    index % 3 === 1 ? "bg-gradient-to-r from-teal-400 via-green-400 to-teal-500" :
                    "bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500"
                  }`} />
                  
                  {/* Icon */}
                  <div className="mb-6 flex justify-start relative">
                    <div className={`relative w-16 h-16 flex items-center justify-center rounded-2xl group-hover:shadow-lg transition-all duration-500 p-3 border-2 ${
                      index % 3 === 0 ? "bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-300 group-hover:from-blue-200 group-hover:to-cyan-200 group-hover:border-blue-400" :
                      index % 3 === 1 ? "bg-gradient-to-br from-teal-100 to-green-100 border-teal-300 group-hover:from-teal-200 group-hover:to-green-200 group-hover:border-teal-400" :
                      "bg-gradient-to-br from-purple-100 to-pink-100 border-purple-300 group-hover:from-purple-200 group-hover:to-pink-200 group-hover:border-purple-400"
                    }`}>
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={64}
                        height={64}
                        className="object-contain w-10 h-10 group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="mb-3 min-h-[3.5rem] flex items-center">
                    <h3
                      className="text-lg font-bold text-slate-800 group-hover:text-primary transition-colors duration-300 leading-snug line-clamp-2"
                    >
                      {service.title}
                    </h3>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed flex-grow line-clamp-4">
                    {service?.description}
                  </p>

                  {/* CTA Button */}
                  <div className="mt-auto">
                    <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-primary-light text-white rounded-full text-sm font-semibold hover:from-primary-dark hover:to-primary group-hover:from-primary-dark group-hover:to-primary transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 group-hover:shadow-lg group-hover:shadow-primary/20">
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
