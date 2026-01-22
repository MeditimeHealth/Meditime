"use client";

import { motion } from "framer-motion";
import { Smartphone, CreditCard, Clock, HeadphonesIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function WhyChooseSection() {
  const features = [
    {
      icon: Smartphone,
      title: "Anytime Doctor - From Anywhere",
      description:
        "Meditime website and mobile app are designed to help you find doctors, schedule appointments, compare the prices of diagnostic tests in different hospitals, and many more in just one place.",
    },
    {
      icon: CreditCard,
      title: "No Advance Payments of Fees",
      description:
        "To enjoy any of our services like finding doctor information, booking a consultation, access to an extended list of blood donors and ambulance contacts are completely free.",
    },
    {
      icon: Clock,
      title: "Available 24/7",
      description:
        "You can book doctor appointments anytime that is convenient for you, seven days a week, every hour of the day. Use the Doctor Search to find the best doctors.",
    },
    {
      icon: HeadphonesIcon,
      title: "Expert Help",
      description:
        "The Meditime Customer Support team is always ready to help you with any difficulties you may encounter while using our platform.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-white via-slate-50/50 to-white relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl -z-10" />
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16 text-center"
      >
        <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-primary bg-primary/8 rounded-full border border-primary/20">
          Why Choose Us
        </span>
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-slate-800 tracking-tight max-w-4xl mx-auto leading-tight">
          Choose Meditime — Because You Deserve{" "}
          <span className="text-gradient">Quality Medical Services</span>
        </h2>
        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          We believe everyone deserves access to updated healthcare information. Choosing Meditime helps speed up your doctor appointment process.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="p-6 lg:p-8 bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col rounded-2xl group hover:-translate-y-2 relative overflow-hidden">
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                {/* Icon */}
                <div className="mb-6 flex justify-center lg:justify-start">
                  <div className="w-16 h-16 lg:w-18 lg:h-18 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 group-hover:from-primary/20 group-hover:to-primary/10 group-hover:scale-110 transition-all duration-500 group-hover:shadow-lg group-hover:shadow-primary/10">
                    <IconComponent className="w-8 h-8 text-primary" strokeWidth={1.5} />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-3 text-center lg:text-left group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-slate-500 leading-relaxed text-center lg:text-left flex-grow">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
