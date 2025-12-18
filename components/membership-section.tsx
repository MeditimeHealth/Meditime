"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Crown, ArrowRight, Check } from "lucide-react";

export default function MembershipSection() {
  const benefits = [
    "Specialized Health Care Discount Cards for families with 2, 3, 5 Members",
    "On-spot 15% Discount on covered medical services",
    "One Time Medical Privilege Subscription, 12 Months Validity",
    "Corporate Healthcare Discount Cards for Covered Organizations",
  ];

  return (
    <div className="w-full py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left Side - Photo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-64 lg:h-full min-h-[400px] bg-gradient-to-br from-primary/20 to-primary/40"
            >
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark rounded-xl">
                  <div className="text-center text-white">
                    <Crown className="w-24 h-24 mx-auto mb-4 opacity-80" />
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <p className="text-sm opacity-90">Silver</p>
                          <p className="text-2xl font-bold">৳1,000</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm opacity-90">Gold</p>
                          <p className="text-2xl font-bold">৳2,500</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <p className="text-sm opacity-90">Platinum</p>
                          <p className="text-2xl font-bold">৳5,000</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm opacity-90">Corporate</p>
                          <p className="text-xl font-bold">Custom</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 lg:p-12 flex flex-col justify-center"
            >
              <div className="mb-6">
                <h2 
                  className="text-3xl lg:text-4xl font-bold mb-4"
                  style={{ color: "#1e3a8a" }}
                >
                  Meditime Health Discount Cards
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Not all Healthcare Discount Cards are the same. We have designed 4 different, extremely affordable Medical Privilege Membership packages based on the distinct needs of different families and individuals. Enjoy discounts in 100+ medical services in 30+ hospitals near Savar and save up to 15% on medical bills.
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>

              <Link href="/membership">
                <button className="bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 w-full lg:w-auto justify-center">
                  Get Your Medical Discount Card
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
