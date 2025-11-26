"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function ServicesSection() {
  const services = [
    {
      image: "/impression-1.png",
      title: "ডাক্তার",
      description:
        "বিশেষজ্ঞ ডাক্তারের তালিকা থেকে খুঁজে নিন আপনার প্রয়োজনীয় ডাক্তারের চেম্বার ও সময়সূচি।",
      href: "/doctor",
    },
    {
      image: "/impression-2.png",
      title: "হাসপাতাল",
      description:
        "বিশেষায়িত হাসপাতালের তালিকা থেকে খুঁজে নিন আপনার লোকেশনে পছন্দকৃত হাসপাতাল।",
      href: "/hospital",
    },
    {
      image: "/impression-3.png",
      title: "লাইভ ডাক্তার",
      description:
        "আপনার প্রয়োজনীয় মূহুর্তে বিশেষজ্ঞ ডাক্তারের পরামর্শ নিন ভিডিও কলের মাধ্যমে।",
      href: "/",
    },
    {
      image: "/impression-4.png",
      title: "হেলথ টিপস্",
      description:
        "বছরজুড়ে নানা রকম স্বাস্থ্যসেবা সম্পর্কিত টিপস পেতে যুক্ত থাকুন আমাদের সাথে।",
      href: "/blog",
    },
    {
      image: "/impression-1.png",
      title: "ডায়াগনস্টিক টেস্ট",
      description:
        "বিভিন্ন ধরনের ডায়াগনস্টিক টেস্ট বুক করুন এবং সেরা মূল্যে পরীক্ষা করান।",
      href: "/diagnostic",
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
            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
          }}
        >
          আমাদের সেবা সমূহ
        </h2>
        
        <div className="space-y-4 mb-8">
          <p
            className="text-base md:text-lg text-gray-700 leading-relaxed"
            style={{
              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            মেডিকেয়ার একটি বিশেষায়িত স্বাস্থ্যসেবা প্রদানকারী প্লাটফর্ম। এখানে মোবাইল অ্যাপের মাধ্যমে নিবন্ধন করে আপনি খুব সহজে সিরিয়াল না দিয়েই দেখাতে পারেন বিশেষজ্ঞ ডাক্তার।
          </p>
          <p
            className="text-base md:text-lg text-gray-700 leading-relaxed"
            style={{
              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            অ্যাপের নিবন্ধন প্রক্রিয়া খুবই সহজ। গুগল প্লে স্টোর থেকে বিনামূল্যে ডাউনলোড করে নিন মেডিকেয়ার অ্যাপ।
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
                    style={{
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    {service.title}
                  </h3>
                  <div className="w-12 h-1 bg-red-500"></div>
                </div>

                {/* Description */}
                <p
                  className="text-sm md:text-base text-gray-600 leading-relaxed grow"
                  style={{
                    fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
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

