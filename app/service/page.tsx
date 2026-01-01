"use client";

import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { buttonVariants } from "@/components/ui/button";
import { Droplet, Car, ArrowRight, Building2, Stethoscope, Video, FlaskConical } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function ServicePage() {
  const services = [
    {
      id: 1,
      title: "Doctor Appointment Booking",
      description: "Find the Most Experienced Physician from 20+ Specialities and Departments. Easy booking, guaranteed visit, with no advance payment. Pay only when you visit the hospital.",
      icon: Stethoscope,
      iconBg: "bg-green-100 group-hover:bg-green-200",
      iconColor: "text-green-600",
      href: "/doctor",
      buttonText: "Book Appointment",
    },
    {
      id: 2,
      title: "Find the Best Hospitals Near You",
      description: "Find Specialized and General Hospitals Near You in the Dhaka Surroundings. From semi-government hospitals to private clinics, our network covers it all, keeping your needs and preferences in mind. We have compiled 30+ hospitals, bringing all the information you need at a glance.",
      icon: Building2,
      iconBg: "bg-blue-100 group-hover:bg-blue-200",
      iconColor: "text-blue-600",
      href: "/hospital",
      buttonText: "Find Hospitals",
    },
    {
      id: 3,
      title: "Video Call with Doctor",
      description: "Known as Online Doctor Appointment, this service lets you talk directly with a doctor from your home. It is ideal for seniors, pregnant women, and people with disabilities. By booking an online consultation, you can speak to the doctor live using your smartphone from anywhere you feel comfortable. For convenience, download the Medicare App to access in-app video streaming, making what could be a journey of 10,000 steps easy with just a few clicks. You can also use this service directly from this website.",
      icon: Video,
      iconBg: "bg-purple-100 group-hover:bg-purple-200",
      iconColor: "text-purple-600",
      href: "/",
      buttonText: "Start Video Call",
    },
    {
      id: 4,
      title: "Most Affordable Diagnostic Tests Options",
      description: "Diagnostic tests account for a significant portion of healthcare costs, potentially over 10% of total medical spending. Meditime is designed to help you find the most affordable options for medical tests such as blood tests, urine tests, CBC tests, CMP, and more in renowned hospitals. Compare prices and book diagnostic tests in Savar and surrounding areas using the Meditime app to save your money and time. This process also saves your money from overspending on expensive options.",
      icon: FlaskConical,
      iconBg: "bg-orange-100 group-hover:bg-orange-200",
      iconColor: "text-orange-600",
      href: "/diagnostic",
      buttonText: "Compare Prices",
    },
    {
      id: 5,
      title: "Blood Donor Contact",
      description: "31% of all maternal deaths happen due to haemorrhage (severe blood loss). Timely blood transfusion could save half of these lives. Just like the Bangla classics in real life, collecting blood for patients has become a major challenge in Bangladesh. Considering this situation, we have created a list of blood donors in Savar and nearby areas to help users access fresh and up-to-date contact information of blood donors.",
      icon: Droplet,
      iconBg: "bg-red-100 group-hover:bg-red-200",
      iconColor: "text-red-600",
      href: "/service/blood-donors",
      buttonText: "Find Blood Donors",
    },
    {
      id: 6,
      title: "Ambulance Contact",
      description: "We have a comprehensive list of ambulance contact numbers in Savar and nearby areas. In emergency situations, when every second matters, you can access ambulance services easily.",
      icon: Car,
      iconBg: "bg-primary/10 group-hover:bg-primary/20",
      iconColor: "text-primary",
      href: "/service/ambulance-services",
      buttonText: "Find Ambulance",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 mt-24 md:mt-28">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#009A98] mb-4">
              Our Services
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Meditime has a broad range of medical information services from doctors&apos; appointment booking to ambulance contact numbers.
            </p>
          </motion.div>
          
          {/* Service Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={service.href}>
                    <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary flex flex-col">
                      <div className="space-y-4 flex-1">
                        {/* Icon and Title */}
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`h-14 w-14 rounded-full ${service.iconBg} flex items-center justify-center transition-colors`}>
                            <IconComponent className={`h-7 w-7 ${service.iconColor}`} />
                          </div>
                          <h2 className="text-xl font-bold text-[#009A98] group-hover:text-[#009A98] transition-colors">
                            {service.title}
                          </h2>
                        </div>
                        
                        {/* Description */}
                        <p className="text-gray-600 text-base leading-relaxed flex-1">
                          {service.description}
                        </p>
                        
                        {/* Button */}
                        <div className="pt-4">
                          <span 
                            className={cn(buttonVariants({ variant: "default", size: "default" }), "inline-flex items-center")}
                          >
                            {service.buttonText}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
