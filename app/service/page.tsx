"use client";

import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import { buttonVariants } from "@/components/ui/button";
import { Droplet, Car, ArrowRight, Building2, Stethoscope } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12 mt-24 md:mt-28">
        {/* Service Sections - Four Big Clickable Cards */}
        <div className="max-w-6xl mx-auto">
          <h1 
            className="text-4xl font-bold text-[#009A98] mb-12 text-center"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            আমাদের সেবাসমূহ
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Blood Donors Section */}
            <Link href="/service/blood-donors">
              <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <Droplet className="h-8 w-8 text-red-600" />
                    </div>
                    <h2 
                      className="text-3xl font-bold text-[#009A98] group-hover:text-[#009A98] transition-colors"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      রক্তদাতা
                    </h2>
                  </div>
                  <p 
                    className="text-gray-600 text-lg leading-relaxed"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    আপনার এলাকায় দ্রুত এবং সহজে রক্তদাতা খুঁজে নিন। আমাদের প্ল্যাটফর্ম আপনাকে বিভিন্ন রক্তের গ্রুপ এবং অবস্থানের যাচাইকৃত রক্তদাতাদের সাথে সংযুক্ত করে। রক্তের গ্রুপ, অবস্থান এবং প্রাপ্যতার অবস্থা অনুযায়ী অনুসন্ধান করুন এবং যখন আপনার সবচেয়ে বেশি প্রয়োজন, তখনই সঠিক দাতা খুঁজে নিন। প্রতিটি দাতা যাচাইকৃত এবং জীবন বাঁচাতে প্রস্তুত।
                  </p>
                  <div className="pt-4">
                    <span 
                      className={cn(buttonVariants({ variant: "default", size: "lg" }), "inline-flex items-center")}
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      সব রক্তদাতা দেখুন
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Ambulance Services Section */}
            <Link href="/service/ambulance-services">
              <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Car className="h-8 w-8 text-primary" />
                    </div>
                    <h2 
                      className="text-3xl font-bold text-[#009A98] group-hover:text-[#009A98] transition-colors"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      অ্যাম্বুলেন্স সেবা
                    </h2>
                  </div>
                  <p 
                    className="text-gray-600 text-lg leading-relaxed"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    জরুরি অবস্থায় যখন প্রতিটি সেকেন্ড গুরুত্বপূর্ণ, তখনই অ্যাম্বুলেন্স সেবা অ্যাক্সেস করুন। বিভিন্ন ধরনের যানবাহন সহ যাচাইকৃত অ্যাম্বুলেন্স সেবার আমাদের নেটওয়ার্ক ব্রাউজ করুন, যার মধ্যে রয়েছে বেসিক লাইফ সাপোর্ট, অ্যাডভান্সড লাইফ সাপোর্ট, ক্রিটিক্যাল কেয়ার এবং এয়ার অ্যাম্বুলেন্স। অবস্থান এবং প্রাপ্যতা অনুযায়ী ফিল্টার করুন এবং আপনার জরুরি প্রয়োজনের জন্য নিকটতম উপলব্ধ অ্যাম্বুলেন্স সেবা খুঁজে নিন।
                  </p>
                  <div className="pt-4">
                    <span 
                      className={cn(buttonVariants({ variant: "default", size: "lg" }), "inline-flex items-center")}
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      সব অ্যাম্বুলেন্স দেখুন
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Hospital Section */}
            <Link href="/hospital">
              <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 
                      className="text-3xl font-bold text-[#009A98] group-hover:text-[#009A98] transition-colors"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      হাসপাতাল
                    </h2>
                  </div>
                  <p 
                    className="text-gray-600 text-lg leading-relaxed"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    আপনার এলাকার হাসপাতাল খুঁজে নিন। আমাদের প্ল্যাটফর্মে বিভিন্ন বিভাগ, জেলা এবং থানার হাসপাতালের বিস্তৃত তালিকা রয়েছে। অবস্থান, নাম, ফোন নম্বর বা ইমেইল দিয়ে অনুসন্ধান করুন এবং আপনার প্রয়োজনের জন্য উপযুক্ত হাসপাতাল খুঁজে নিন। প্রতিটি হাসপাতালের বিস্তারিত তথ্য, যোগাযোগের বিবরণ এবং সংশ্লিষ্ট ডাক্তারদের তালিকা দেখুন।
                  </p>
                  <div className="pt-4">
                    <span 
                      className={cn(buttonVariants({ variant: "default", size: "lg" }), "inline-flex items-center")}
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      সব হাসপাতাল দেখুন
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>

            {/* Doctor Section */}
            <Link href="/doctor">
              <Card className="p-8 h-full hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 hover:border-primary">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <Stethoscope className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 
                      className="text-3xl font-bold text-[#009A98] group-hover:text-[#009A98] transition-colors"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      ডাক্তার
                    </h2>
                  </div>
                  <p 
                    className="text-gray-600 text-lg leading-relaxed"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    বিশেষজ্ঞ ডাক্তার খুঁজে নিন। আমাদের প্ল্যাটফর্মে বিভিন্ন বিভাগ, হাসপাতাল এবং অবস্থানের বিশেষজ্ঞ ডাক্তারদের বিস্তৃত তালিকা রয়েছে। নাম, বিভাগ, হাসপাতাল, অবস্থান বা রোগের ধরন অনুযায়ী অনুসন্ধান করুন। প্রতিটি ডাক্তারের প্রোফাইল, যোগ্যতা, অভিজ্ঞতা, ফি, উপলব্ধতা সময়সূচী এবং যোগাযোগের তথ্য দেখুন।
                  </p>
                  <div className="pt-4">
                    <span 
                      className={cn(buttonVariants({ variant: "default", size: "lg" }), "inline-flex items-center")}
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      সব ডাক্তার দেখুন
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
