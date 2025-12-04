"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Crown, ArrowRight } from "lucide-react";

export default function MembershipSection() {
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
                {/* Placeholder for stock photo - you can replace with actual image */}
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
                {/* 
                  Uncomment and add your image path:
                  <Image
                    src="/membership-banner.jpg"
                    alt="Membership Benefits"
                    fill
                    className="object-cover"
                  />
                */}
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
                  Become a Member Today
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Join our exclusive membership program and unlock premium healthcare benefits. Get special discounts, priority booking, free health checkups, and access to wellness programs. Choose from Silver, Gold, Platinum, or Corporate plans tailored to your needs.
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                  <p className="text-gray-700">Up to 15% discount on consultations and diagnostics</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                  <p className="text-gray-700">Free health checkups and wellness programs</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                  </div>
                  <p className="text-gray-700">Priority booking and 24/7 helpline support</p>
                </div>
              </div>

              <Link href="/membership">
                <button className="bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2 w-full lg:w-auto justify-center">
                  Join Now
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
