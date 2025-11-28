"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, Shield, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function WhyChooseSection() {
  const features = [
    {
      icon: Calendar,
      title: "সহজ অ্যাপয়েন্টমেন্ট বুকিং",
      description:
        "মাত্র কয়েকটি ক্লিকে যোগ্য ডাক্তারের সাথে অ্যাপয়েন্টমেন্ট বুক করুন। আপনার পছন্দের সময় এবং তারিখ বেছে নিন।",
    },
    {
      icon: Clock,
      title: "২৪/৭ উপলব্ধতা",
      description:
        "যেকোনো সময়, যেকোনো জায়গায় স্বাস্থ্যসেবা অ্যাক্সেস করুন। জরুরি পরামর্শ সারাদিন উপলব্ধ।",
    },
    {
      icon: Shield,
      title: "নিরাপদ ও গোপনীয়",
      description:
        "আপনার স্বাস্থ্য ডেটা ব্যাংক-লেভেল নিরাপত্তা দিয়ে সুরক্ষিত। সম্পূর্ণ গোপনীয়তা নিশ্চিত।",
    },
    {
      icon: Heart,
      title: "মানসম্মত স্বাস্থ্যসেবা",
      description:
        "বাংলাদেশ জুড়ে প্রত্যয়িত ডাক্তার এবং স্বাস্থ্যসেবা পেশাদারদের সাথে সংযুক্ত হন।",
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
            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
          }}
        >
          কেন মেডিটাইম বেছে নিবেন?
        </h2>
        <p
          className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto"
          style={{
            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
          }}
        >
          আধুনিক বাংলাদেশের জন্য ডিজাইন করা আমাদের ব্যাপক ডিজিটাল প্ল্যাটফর্মের সাথে আগের মতো স্বাস্থ্যসেবা উপভোগ করুন।
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
                  style={{
                    fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                >
                  {feature.title}
                </h3>

                {/* Description */}
                <p
                  className="text-xs sm:text-sm md:text-base text-gray-600 leading-relaxed grow text-center sm:text-left"
                  style={{
                    fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
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

