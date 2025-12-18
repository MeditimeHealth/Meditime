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
        "Find the Most Experienced Physician from 20+ Specialities and Departments. Easy booking, guaranteed visit, with no advance payment. Pay only when you visit the doctor's chamber.",
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
          className="text-4xl md:text-5xl font-bold mb-6 text-left"
          style={{
            color: "#009A98",
          }}
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
              <Link href={service.href} className="block h-full">
                <Card className="p-6 bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow h-full flex flex-col cursor-pointer">
                {/* Icon */}
                <div className="mb-4 flex justify-center">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <Image
                      src={service.image}
                      alt={service.title}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                </div>

                {/* Title with red underline */}
                <div className="mb-4">
                  <h3
                    className="text-xl font-bold text-gray-900 mb-2"
                  >
                    {service.title}
                  </h3>
                  <div className="w-12 h-1 bg-red-500"></div>
                </div>

                {/* Description */}
                <p
                  className="text-sm md:text-base text-gray-600 leading-relaxed grow"
                >
                  {service.description}
                </p>
              </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

