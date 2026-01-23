"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Crown, ArrowRight, Check } from "lucide-react";

export default function MembershipSection() {
  const benefits: any[] = [
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
            {/* Left Side - Video Container (on mobile, this appears second due to flex-col-reverse) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative h-64 lg:h-full min-h-[400px] bg-white order-2 lg:order-1"
            >
              <div className="absolute inset-0 flex items-center justify-center p-4 lg:p-8">
                <div className="relative w-full h-full flex items-center justify-center bg-white rounded-xl overflow-hidden">
                  {/* YouTube Video Embed */}
                  <iframe 
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/45XDv8gH5x4?autoplay=1&mute=1&loop=1&playlist=45XDv8gH5x4&controls=0&showinfo=0&rel=0&modestbranding=1"
                    title="Healthcare Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </motion.div>

            {/* Right Side - Content (on mobile, this appears first) */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="p-8 lg:p-12 flex flex-col justify-center order-1 lg:order-2"
            >
              <div className="mb-6">
                <h2 
                  className="text-3xl lg:text-4xl font-bold mb-4"
                  style={{ color: "#1e3a8a" }}
                >
                  Meditime Health Discount Cards
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed">
                  Enjoy discounts in 100+ medical services in 40+ hospitals near Savar and save up to 15% on medical bills.
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
                  Get Your Card
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
