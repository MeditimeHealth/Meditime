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
      highlight: false,
    },
    {
      icon: CreditCard,
      title: "No Advance Payments of Fees",
      description:
        "To enjoy any of our services like finding doctor information, booking a consultation, access to an extended list of blood donors and ambulance contacts are completely free.",
      highlight: true,
    },
    {
      icon: Clock,
      title: "Available 24/7",
      description:
        "You can book doctor appointments anytime that is convenient for you, seven days a week, every hour of the day. Use the Doctor Search to find the best doctors.",
      highlight: false,
    },
    {
      icon: HeadphonesIcon,
      title: "Expert Help",
      description:
        "The Meditime Customer Support team is always ready to help you with any difficulties you may encounter while using our platform.",
      highlight: false,
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
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-800 tracking-tight max-w-3xl mx-auto leading-tight">
            Choose Meditime for Simplified Medical Services in Time
          </h2>
          <p className="text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
            Choosing Meditime helps you bring speed in your doctor appointment
            booking process which significantly reduces the risk of being late
            to receive quality medical services
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="h-full"
              >
                <Card
                  className={`p-6 lg:p-8 border h-full flex flex-col items-center text-center rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                    feature.highlight
                      ? "bg-yellow-300 border-yellow-300"
                      : "bg-white border-slate-200"
                  }`}
                >
                  {/* Teal square icon */}
                  <div className="mb-5">
                    <div className="w-14 h-14 rounded-xl bg-primary flex items-center justify-center shrink-0">
                      <IconComponent
                        className="w-7 h-7 text-white"
                        strokeWidth={1.5}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3
                    className={`text-base font-bold mb-3 leading-snug ${
                      feature.highlight ? "text-slate-900" : "text-slate-800"
                    }`}
                  >
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p
                    className={`text-sm leading-relaxed ${
                      feature.highlight ? "text-slate-800" : "text-slate-500"
                    }`}
                  >
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}