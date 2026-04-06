"use client";

import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Video, 
  Calendar, 
  Clock, 
  Shield, 
  Smartphone, 
  UserRound, 
  Activity,
  CheckCircle2,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

const features = [
  {
    icon: <Video className="w-6 h-6" />,
    title: { en: "HD Video Call", bn: "এইচডি ভিডিও কল" },
    desc: { en: "Face-to-face consultation with top specialists from the comfort of your home.", bn: "আপনার ঘরের আরামদায়ক পরিবেশে সেরা বিশেষজ্ঞদের সাথে সরাসরি পরামর্শ করুন।" }
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: { en: "Secure & Private", bn: "সুরক্ষিত ও গোপনীয়" },
    desc: { en: "Your health information and consultations are protected with end-to-end encryption.", bn: "আপনার স্বাস্থ্য তথ্য এবং পরামর্শ এন্ড-টু-এন্ড এনক্রিপশনের মাধ্যমে সুরক্ষিত।" }
  },
  {
    icon: <MessageSquare className="w-6 h-6" />,
    title: { en: "Instant Chat", bn: "তাৎক্ষণিক চ্যাট" },
    desc: { en: "Follow-up with your doctor via secure messaging for any quick questions.", bn: "যেকোন দ্রুত প্রশ্নের জন্য সুরক্ষিত মেসেজিংয়ের মাধ্যমে ডাক্তারের সাথে যোগাযোগ রাখুন।" }
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: { en: "24/7 Availability", bn: "২৪/৭ উপস্থিতি" },
    desc: { en: "Access medical care anytime, anywhere, even on weekends and holidays.", bn: "যেকোন সময়, যেকোন জায়গা থেকে চিকিৎসা সেবা গ্রহণ করুন, এমনকি ছুটির দিনেও।" }
  }
];

export default function LiveConsultationPage() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-[#00B7B5]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00B7B5]/10 text-[#00B7B5] font-bold text-xs uppercase tracking-widest mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00B7B5] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00B7B5]"></span>
                </span>
                Live Now
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
                {language === 'en' ? (
                  <>Consult with Best Doctors <span className="text-[#00B7B5]">Live</span> Anywhere</>
                ) : (
                  <>সেরা ডাক্তারদের সাথে <span className="text-[#00B7B5]">লাইভ</span> পরামর্শ করুন</>
                )}
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-xl">
                {language === 'en' 
                  ? "Connect with certified specialists in minutes via secure video consultation. Quality healthcare is now just a tap away."
                  : "সহজ এবং নিরাপদ ভিডিও কলের মাধ্যমে সরাসরি বিশেষজ্ঞ ডাক্তারদের সাথে কথা বলুন। মানসম্পন্ন চিকিৎসা সেবা এখন আপনার হাতের নাগালে।"}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/doctor">
                  <Button className="h-14 px-8 bg-[#00B7B5] hover:bg-[#00B7B5]/90 text-white rounded-2xl font-bold text-lg shadow-xl shadow-[#00B7B5]/20 gap-2">
                    {language === 'en' ? "Find a Doctor" : "ডাক্তার খুঁজুন"}
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Button variant="outline" className="h-14 px-8 border-2 border-slate-200 rounded-2xl font-bold text-lg hover:bg-slate-50">
                  {language === 'en' ? "How it Works" : "কিভাবে কাজ করে"}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
                <Image 
                  src="https://images.unsplash.com/photo-1576091160550-217359f4ecf8?q=80&w=2070&auto=format&fit=crop" 
                  alt="Live Consultation" 
                  width={600} 
                  height={400}
                  className="object-cover"
                />
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md rounded-2xl p-4 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                      <Activity className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{language === 'en' ? "Consultation Status" : "পরামর্শের অবস্থা"}</p>
                      <p className="text-sm font-bold text-slate-900">{language === 'en' ? "Active Live Session" : "সক্রিয় লাইভ সেশন"}</p>
                    </div>
                  </div>
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                        <Image src={`https://i.pravatar.cc/150?u=${i}`} alt="Avatar" width={32} height={32} />
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-[#00B7B5] flex items-center justify-center text-white text-[10px] font-bold">+2k</div>
                  </div>
                </div>
              </div>
              {/* Floating Badge */}
              <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-6 border border-slate-100 hidden md:block">
                <p className="text-3xl font-black text-[#00B7B5]">98%</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{language === 'en' ? "Satisfaction Rate" : "সন্তুষ্টির হার"}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              {language === 'en' ? "Why Choose Live Consultation?" : "কেন লাইভ পরামর্শ বেছে নেবেন?"}
            </h2>
            <div className="w-20 h-1.5 bg-[#00B7B5] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#00B7B5]/10 text-[#00B7B5] flex items-center justify-center mb-6 group-hover:bg-[#00B7B5] group-hover:text-white transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title[language as keyof typeof feature.title]}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{feature.desc[language as keyof typeof feature.desc]}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-square relative rounded-[3rem] overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1581056399312-6031844f4955?q=80&w=2070&auto=format&fit=crop" 
                  alt="Steps" 
                  fill 
                  className="object-cover"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
                {language === 'en' ? "Get Started in 3 Easy Steps" : "৩টি সহজ ধাপে শুরু করুন"}
              </h2>
              <div className="space-y-8">
                {[
                  {
                    step: "01",
                    title: { en: "Pick a Specialist", bn: "বিশেষজ্ঞ বেছে নিন" },
                    desc: { en: "Search from hundreds of top-rated doctors across 20+ specialties.", bn: "২০টিরও বেশি বিভাগে শত শত সেরা ডাক্তারদের মধ্য থেকে বেছে নিন।" }
                  },
                  {
                    step: "02",
                    title: { en: "Book a Slot", bn: "সময় বুক করুন" },
                    desc: { en: "Choose a time that works for you and complete your booking easily.", bn: "আপনার সুবিধাজনক সময় বেছে নিয়ে সহজেই বুকিং সম্পন্ন করুন।" }
                  },
                  {
                    step: "03",
                    title: { en: "Join Live Session", bn: "লাইভ সেশনে যোগ দিন" },
                    desc: { en: "At the scheduled time, join the high-quality video call with your doctor.", bn: "নির্ধারিত সময়ে আপনার ডাক্তারের সাথে উচ্চমানের ভিডিও কলে যুক্ত হন।" }
                  }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="text-4xl font-black text-[#00B7B5]/20">{s.step}</div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{s.title[language as keyof typeof s.title]}</h4>
                      <p className="text-slate-500">{s.desc[language as keyof typeof s.desc]}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 relative overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00B7B5]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-8">
                {language === 'en' ? "Ready to Consult?" : "পরামর্শ করতে প্রস্তুত?"}
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
                {language === 'en' 
                  ? "Don't wait for your symptoms to get worse. Talk to a professional doctor now and get the care you deserve."
                  : "আপনার লক্ষণগুলো খারাপ হওয়ার জন্য অপেক্ষা করবেন না। এখনই একজন পেশাদার ডাক্তারের সাথে কথা বলুন এবং আপনার প্রয়োজনীয় যত্ন নিন।"}
              </p>
              <Link href="/doctor">
                <Button className="h-16 px-12 bg-white hover:bg-slate-100 text-slate-900 rounded-2xl font-bold text-xl shadow-2xl">
                  {language === 'en' ? "Book First Session" : "প্রথম সেশন বুক করুন"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
