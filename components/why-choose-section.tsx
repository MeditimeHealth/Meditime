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
        "Meditime website and mobile app are designed to help you find doctors, schedule appointments, compare the prices of diagnostic tests in different hospitals, and many more in just one place. Smooth to use even for new users, fast, and packed with data.",
    },
    {
      icon: CreditCard,
      title: "No Advance Payments of Fees",
      description:
        "To enjoy any of our services like finding doctor information, booking a consultation, access to an extended list of blood donors and ambulance contacts are completely free. There is no hidden charge for the medical services you receive.",
    },
    {
      icon: Clock,
      title: "Available 24/7",
      description:
        "You can book doctor appointments anytime that is convenient for you, seven days a week, every hour of the day. Use the Doctor Search to find and book appointments with the doctor who best fits your area, budget, and medical needs.",
    },
    {
      icon: HeadphonesIcon,
      title: "Expert Help",
      description:
        "The Meditime Customer Support team is always ready to help you with any difficulties you may encounter while using our platform. We assist you through every process, whether booking an online doctor appointment or finding the best diagnostic test option.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-center"
      >
        <h2
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{
            color: "#009A98",
          }}
        >
          Choose Meditime - Because You Deserve Quality Medical Services In Time
        </h2>
        <p
          className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto"
        >
          We strongly believe that as human beings all of us deserve the right to get the most updated information that makes lives easier in the tough days of sickness. Choosing Meditime helps you bring speed in your doctor appointment booking process which significantly reduces the risk of being late to receive quality medical services.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <Card className="p-3 sm:p-4 md:p-6 bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow h-full flex flex-col">
                {/* Icon */}
                <div className="mb-2 sm:mb-3 md:mb-4 flex justify-center sm:justify-start">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg bg-blue-50 flex items-center justify-center">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-blue-200 flex items-center justify-center">
                      <IconComponent className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-900" strokeWidth={2} />
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3
                  className="text-sm sm:text-base md:text-xl font-bold text-gray-900 mb-1 sm:mb-2 md:mb-3 text-center sm:text-left"
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed grow text-center sm:text-left"
                >
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
