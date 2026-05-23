"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, CheckCircle2, Facebook, MessageCircle, Clock, Info, ShieldCheck } from "lucide-react";
import { showToast } from "@/lib/toast";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { FaFacebookF, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaHeadset } from "react-icons/fa";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^(?:\+8801|01|8801)[3-9]\d{8}$/, "Please enter a valid Bangladeshi phone number"),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  isExistingCustomer: z.enum(["yes", "no"], {
    error: "Please select if you are an existing customer",
  }),
});

type ContactFormValues = z.infer<typeof contactSchema>;

const SUBJECTS = [
  { en: "Doctor & Video Consultation", bn: "ডাক্তার বুকিং ও ভিডিও কল সংক্রান্ত" },
  { en: "Hospital & Test Booking", bn: "হাসপাতাল তথ্য ও ল্যাব টেস্ট সংক্রান্ত" },
  { en: "Ambulance Emergency", bn: "জরুরি অ্যাম্বুলেন্স সেবা" },
  { en: "Blood Donor Services", bn: "রক্তের জন্য অনুরোধ বা ডোনার হতে চাইলে" },
  { en: "Health Discount Card", bn: "ডিসকাউন্ট কার্ডের সুবিধা সংক্রান্ত" },
  { en: "Payment & Refund Issues", bn: "পেমেন্ট বা টাকা ফেরত সংক্রান্ত সমস্যা" },
  { en: "Partnership Inquiry", bn: "ডাক্তার বা প্রতিষ্ঠান হিসেবে যুক্ত হতে চাইলে" },
  { en: "Account & Profile Issues", bn: "লগইন বা প্রোফাইল আপডেট সংক্রান্ত সমস্যা" },
  { en: "Feedback & Complaints", bn: "সেবার মান নিয়ে অভিযোগ বা মতামত" },
  { en: "General Inquiry", bn: "অন্যান্য যেকোনো সাধারণ তথ্যের জন্য" },
];

export default function ContactPage() {
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      isExistingCustomer: "no"
    }
  });

  const isExistingCustomer = watch("isExistingCustomer");

  const onSubmit = async (data: ContactFormValues) => {
    setIsLoading(true);
    setIsSuccess(false);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        reset();
        showToast.success(language === 'bn' ? "আপনার বার্তা সফলভাবে পাঠানো হয়েছে!" : "Your message has been sent successfully!");
        setTimeout(() => setIsSuccess(false), 5000);
      } else {
        showToast.error(result.error || (language === 'en' ? "Failed to send message." : "মেসেজ পাঠাতে ব্যর্থ হয়েছে।"));
      }
    } catch (error) {
      showToast.error(language === 'en' ? "An error occurred." : "একটি সমস্যা দেখা দিয়েছে।");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero / Cover Section */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#111827]/80 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop" 
            alt="Contact Cover" 
            className="w-full h-full object-cover transition-opacity duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1516387933901-8266440cda54?w=1920&q=80";
            }}
          />
        </div>
        
        <div className="relative z-20 text-center px-4 max-w-4xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight"
          >
            {language === 'bn' ? "আমাদের সাথে যোগাযোগ করুন" : "Contact Us"}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-300 font-light max-w-2xl mx-auto"
          >
            {language === 'bn' 
              ? "আপনার যেকোনো জিজ্ঞাসা বা সাহায্যের জন্য আমরা ২৪/৭ নিয়োজিত আছি।" 
              : "Have questions or need help? Our support team is here for you 24/7."}
          </motion.p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-30">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Info Cards */}
          <div className="lg:col-span-4 relative space-y-6 h-full">
            {/* Emergency Hotline Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#ff5e29] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <FaHeadset className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <p className="text-orange-100 font-bold uppercase tracking-widest text-sm mb-2">
                  {language === 'bn' ? "জরুরি হটলাইন" : "Emergency Hot line Number"}
                </p>
                <h2 className="text-3xl font-bold mb-6">
                  {language === 'bn' ? "আমাদের কাছে কি কোনো প্রশ্ন আছে?" : "Have a Question For Us?"}
                </h2>
                <a 
                  href="tel:+8801610384444" 
                  className="inline-flex items-center gap-4 bg-white text-[#ff5e29] px-8 py-4 rounded-2xl font-bold text-2xl shadow-lg hover:bg-orange-50 transition-all active:scale-95"
                >
                  <Phone className="w-6 h-6" />
                  +880 1610-384444
                </a>
              </div>
            </motion.div>

            {/* Contact Details Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[32px] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100"
            >
              <h3 className="text-3xl font-bold text-slate-900 mb-10">
                {language === 'bn' ? "যোগাযোগের মাধ্যম" : "Get in Touch"}
              </h3>
              
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#3DB5A0] shrink-0 border border-slate-100">
                    <FaEnvelope className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Email</p>
                    <a href="mailto:support@meditime.com.bd" className="text-xl font-bold text-slate-900 hover:text-[#3DB5A0] transition-colors">
                      support@meditime.com.bd
                    </a>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#3DB5A0] shrink-0 border border-slate-100">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Phone</p>
                    <a href="tel:+8801610384444" className="text-xl font-bold text-slate-900 hover:text-[#3DB5A0] transition-colors">
                      +880 1610-384444
                    </a>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#3DB5A0] shrink-0 border border-slate-100">
                    <FaFacebookF className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Facebook</p>
                    <a href="https://www.facebook.com/meditime.health" target="_blank" className="text-xl font-bold text-slate-900 hover:text-[#3DB5A0] transition-colors">
                      meditime.health
                    </a>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-[#3DB5A0] shrink-0 border border-slate-100">
                    <FaMapMarkerAlt className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Address</p>
                    <p className="text-xl font-bold text-slate-900 leading-relaxed">
                      {language === 'bn' 
                        ? 'সাভার ডিওএইচএস, ঢাকা, বাংলাদেশ, ১৩৪৯' 
                        : 'Savar DOHS, Dhaka, Bangladesh, 1349'}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8"
          >
            <Card className="bg-white rounded-[40px] p-8 shadow-[0_40px_80px_rgba(0,0,0,0.06)] border border-slate-50">
              <div className="text-center mb-12">
                <h3 className="text-[32px] md:text-[42px] font-bold text-[#1a1a1a] ">
                  {language === 'bn' ? "আমাদের কাছে কি কোনো প্রশ্ন আছে?" : "Have a question for us?"}
                </h3>
                <p className="text-slate-500 text-lg">
                  {language === 'bn' ? "আমাদের সাপোর্ট টিম আপনার সমস্ত প্রশ্নের উত্তর দেবে।" : "Our support team will answer all your questions."}
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                  {/* Full Name */}
                  <div className="space-y-2.5">
                    <Label htmlFor="name" className="text-[15px] font-semibold text-[#1a1a1a]">
                      {language === 'bn' ? "পুরো নাম" : "Full Name"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder=""
                      {...register("name")}
                      className="h-14 rounded-xl border-slate-200 bg-white focus:ring-slate-100 transition-all text-base"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2.5">
                    <Label htmlFor="email" className="text-[15px] font-semibold text-[#1a1a1a]">
                      {language === 'bn' ? "ইমেইল" : "Email"} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder=""
                      {...register("email")}
                      className="h-14 rounded-xl border-slate-200 bg-white focus:ring-slate-100 transition-all text-base"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="space-y-2.5">
                    <Label htmlFor="subject" className="text-[15px] font-semibold text-[#1a1a1a]">
                      {language === 'bn' ? "বিষয়" : "Subject"} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <select
                        id="subject"
                        {...register("subject")}
                        className="w-full h-14 rounded-xl border border-slate-200 bg-white focus:ring-slate-100 transition-all text-base px-4 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">{language === 'bn' ? "একটি বিষয় নির্বাচন করুন" : "Select a subject"}</option>
                        {SUBJECTS.map((sub, idx) => (
                          <option key={idx} value={sub.en}>
                            {language === 'bn' ? sub.bn : sub.en}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.subject && (
                      <p className="text-sm text-red-500">{errors.subject.message}</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2.5">
                    <Label htmlFor="phone" className="text-[15px] font-semibold text-[#1a1a1a]">
                      {language === 'bn' ? "ফোন নম্বর" : "Phone Number"} <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative flex items-center">
                      <div className="absolute left-4 flex items-center gap-2 pr-3 border-r border-slate-200">
                        <img src="https://flagcdn.com/w40/bd.png" alt="BD" className="w-6 h-4 rounded-sm object-cover" />
                        <span className="text-slate-600 font-medium">+880</span>
                      </div>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder=""
                        {...register("phone")}
                        className="h-14 rounded-xl border-slate-200 bg-white focus:ring-slate-100 transition-all text-base pl-[105px]"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-sm text-red-500">{errors.phone.message}</p>
                    )}
                  </div>
                </div>

               

                {/* Message */}
                <div className="space-y-2.5">
                  <Label htmlFor="message" className="text-[15px] font-semibold text-[#1a1a1a]">
                    {language === 'bn' ? "আপনার বার্তা" : "Your message"} <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    placeholder=""
                    rows={6}
                    {...register("message")}
                    className="rounded-xl border-slate-200 bg-white focus:ring-slate-100 transition-all text-base p-4 min-h-[160px] resize-none"
                  />
                  {errors.message && (
                    <p className="text-sm text-red-500">{errors.message.message}</p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex flex-col-reverse sm:flex-row-reverse sm:items-center justify-between gap-6 pt-4">
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="btn-slide bg-white text-black border border-primary px-12 h-14 text-lg min-w-[160px] flex items-center justify-center gap-3 group/btn overflow-hidden"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin w-6 h-6" />
                    ) : (
                      <>
                        {language === 'bn' ? "পাঠান" : "Send"}
                        <Send className="w-5 h-5 " />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
