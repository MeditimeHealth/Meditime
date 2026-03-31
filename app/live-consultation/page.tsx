"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";
import Link from "next/link";
import Image from "next/image";
import { Video, Clock, Users, DollarSign, Phone, Search, Wifi, WifiOff } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Doctor {
  _id: string;
  name: string;
  nameBn?: string;
  specialty?: string;
  specialtyBn?: string;
  qualification?: string;
  qualificationBn?: string;
  designation?: string;
  designationBn?: string;
  image?: string;
}

interface LiveConsultant {
  _id: string;
  doctorId: Doctor;
  isLive: boolean;
  consultationFee: number;
  estimatedWaitTime: number;
  maxQueueSize: number;
  waitingCount: number;
  inCallCount: number;
  queueFull: boolean;
  roomId: string;
  specialization?: string;
  specializationBn?: string;
}

export default function LiveConsultationPage() {
  const { language } = useLanguage();
  const [consultants, setConsultants] = useState<LiveConsultant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedConsultant, setSelectedConsultant] = useState<LiveConsultant | null>(null);
  const [joinForm, setJoinForm] = useState({ patientName: "", patientPhone: "", patientEmail: "" });
  const [joining, setJoining] = useState(false);

  const fetchConsultants = useCallback(async () => {
    try {
      const res = await fetch("/api/live-consultation");
      const data = await res.json();
      if (res.ok) setConsultants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsultants();
    const interval = setInterval(fetchConsultants, 10000);
    return () => clearInterval(interval);
  }, [fetchConsultants]);

  const handleJoinQueue = async () => {
    if (!joinForm.patientName || !joinForm.patientPhone) {
      toast.error(language === "bn" ? "নাম এবং ফোন নম্বর আবশ্যক" : "Name and phone number are required");
      return;
    }
    setJoining(true);
    try {
      const res = await fetch("/api/live-consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultantId: selectedConsultant?._id,
          ...joinForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(language === "bn" ? "কিউতে যোগ দেওয়া হয়েছে!" : "Joined the queue!");
        setShowJoinModal(false);
        // Redirect to waiting/meeting room
        window.location.href = `/live-consultation/${selectedConsultant?.roomId}?name=${encodeURIComponent(joinForm.patientName)}&position=${data.queuePosition}&wait=${data.estimatedWaitTime}`;
      } else {
        toast.error(data.error || "Failed to join");
      }
    } catch (err) {
      toast.error("Failed to join queue");
    } finally {
      setJoining(false);
    }
  };

  const filteredConsultants = consultants.filter((c) => {
    const doctorName = (language === "bn" && c.doctorId?.nameBn) ? c.doctorId.nameBn : c.doctorId?.name || "";
    const specialty = (language === "bn" && c.doctorId?.specialtyBn) ? c.doctorId.specialtyBn : c.doctorId?.specialty || "";
    const specialization = (language === "bn" && c.specializationBn) ? c.specializationBn : c.specialization || "";
    const qualification = (language === "bn" && c.doctorId?.qualificationBn) ? c.doctorId.qualificationBn : c.doctorId?.qualification || "";
    
    const q = search.toLowerCase().trim();
    if (!q) return true;

    return (
      doctorName.toLowerCase().includes(q) || 
      specialty.toLowerCase().includes(q) || 
      specialization.toLowerCase().includes(q) ||
      qualification.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative mt-20 h-[450px] md:h-[550px] w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d9488]/90 via-[#115e59]/80 to-teal-600/60 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('/live-consultation-hero.png')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md rounded-full px-4 py-2 mb-6 border border-white/30">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                </span>
                <span className="text-white text-xs font-bold uppercase tracking-wider">
                  {language === "bn" ? "লাইভ কনসালটেশন চালু আছে" : "Live Consultations Available"}
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl leading-tight">
                {language === "bn" ? "এখনই ডাক্তারের সাথে কথা বলুন" : "Talk to a Doctor Right Now"}
              </h1>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8 font-light italic">
                {language === "bn"
                  ? "অপেক্ষার ঝামেলা নেই — সরাসরি ভিডিও কলে বিশেষজ্ঞ ডাক্তারের পরামর্শ নিন।"
                  : "No waiting hassles — get expert advice via a live video call instantly."}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 -mt-32 relative z-30">
        {/* Search Section - Floating */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-16"
        >
          <div className="relative max-w-3xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative bg-white rounded-2xl shadow-xl flex items-center p-2 border border-teal-50">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-teal-600 h-6 w-6 z-10" />
                <Input
                  id="live-search-input"
                  type="text"
                  placeholder={language === "bn" ? "ডাক্তার বা বিভাগ খুঁজুন..." : "Search doctor or specialty..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-4 py-7 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent placeholder:text-gray-400 font-medium"
                />
                <Button 
                  onClick={() => document.getElementById('live-search-input')?.focus()}
                  className="hidden md:flex bg-teal-600 hover:bg-teal-700 text-white items-center gap-2 rounded-xl px-8 py-6 text-lg font-bold transition-all shadow-lg hover:shadow-teal-200 active:scale-95"
                >
                  <Search className="h-5 w-5" />
                  {language === "bn" ? "খুঁজুন" : "Search"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
          </div>
        ) : filteredConsultants.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-teal-50">
            <WifiOff className="h-20 w-20 mx-auto text-teal-100 mb-6 animate-pulse" />
            <h3 className="text-2xl font-bold text-gray-800">
              {search 
                ? (language === "bn" ? "ভোক্তার পছন্দের ডাক্তার পাওয়া যায়নি" : "No matching doctors found")
                : (language === "bn" ? "এই মুহূর্তে কোনো ডাক্তার লাইভে নেই" : "No Doctors Are Live Right Now")}
            </h3>
            <p className="text-gray-500 mt-3 text-lg">
              {search 
                ? (language === "bn" ? "অন্য কিছু লিখে চেষ্টা করুন" : "Try searching for something else")
                : (language === "bn" ? "পরে আবার চেষ্টা করুন" : "Please check back later")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConsultants.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl shadow-md border border-teal-50 overflow-hidden hover:shadow-xl transition-all duration-500 group transform hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="relative p-6 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={c.doctorId?.image || "https://img.freepik.com/free-vector/doctor-character-background_1270-84.jpg"}
                        alt={c.doctorId?.name || "Doctor"}
                        className="w-20 h-20 rounded-2xl object-cover shadow-sm border border-teal-100"
                      />
                      <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-white" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight truncate hover:text-teal-600 transition-colors">
                        {language === "bn" && c.doctorId?.nameBn ? c.doctorId.nameBn : c.doctorId?.name}
                      </h3>
                      <p className="text-teal-600 text-sm font-semibold mt-1">
                        {language === "bn" ? (c.specializationBn || c.doctorId?.specialtyBn) : (c.specialization || c.doctorId?.specialty)}
                      </p>
                      <p className="text-gray-500 text-xs mt-1 truncate font-medium">
                        {language === "bn" && c.doctorId?.qualificationBn ? c.doctorId.qualificationBn : c.doctorId?.qualification}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-0 divide-x border-t border-b mx-4">
                  <div className="py-3 text-center">
                    <DollarSign className="h-4 w-4 mx-auto text-teal-500 mb-1" />
                    <p className="text-sm font-bold text-gray-900">৳{c.consultationFee}</p>
                    <p className="text-[10px] text-gray-500">{language === "bn" ? "ফি" : "Fee"}</p>
                  </div>
                  <div className="py-3 text-center">
                    <Users className="h-4 w-4 mx-auto text-orange-500 mb-1" />
                    <p className="text-sm font-bold text-gray-900">{c.waitingCount}</p>
                    <p className="text-[10px] text-gray-500">{language === "bn" ? "অপেক্ষায়" : "Waiting"}</p>
                  </div>
                  <div className="py-3 text-center">
                    <Clock className="h-4 w-4 mx-auto text-blue-500 mb-1" />
                    <p className="text-sm font-bold text-gray-900">~{c.estimatedWaitTime * (c.waitingCount + 1)}m</p>
                    <p className="text-[10px] text-gray-500">{language === "bn" ? "আনুমানিক" : "Est. Wait"}</p>
                  </div>
                </div>

                {/* Action */}
                <div className="p-4">
                  <button
                    onClick={() => {
                      if (c.queueFull) {
                        toast.error(language === "bn" ? "কিউ পূর্ণ!" : "Queue is full!");
                        return;
                      }
                      setSelectedConsultant(c);
                      setShowJoinModal(true);
                    }}
                    disabled={c.queueFull}
                    className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                      c.queueFull
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    }`}
                  >
                    <Video className="h-4 w-4" />
                    {c.queueFull
                      ? (language === "bn" ? "কিউ পূর্ণ" : "Queue Full")
                      : (language === "bn" ? "কিউতে যোগ দিন" : "Join Queue")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />

      {/* Join Modal */}
      {showJoinModal && selectedConsultant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-3">
                <Video className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {language === "bn" ? "কিউতে যোগ দিন" : "Join Consultation Queue"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {language === "bn" && selectedConsultant.doctorId?.nameBn
                  ? selectedConsultant.doctorId.nameBn
                  : selectedConsultant.doctorId?.name}{" "}
                • ৳{selectedConsultant.consultationFee}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "bn" ? "আপনার নাম *" : "Your Name *"}
                </label>
                <input
                  type="text"
                  value={joinForm.patientName}
                  onChange={(e) => setJoinForm({ ...joinForm, patientName: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder={language === "bn" ? "আপনার পূর্ণ নাম" : "Your full name"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "bn" ? "ফোন নম্বর *" : "Phone Number *"}
                </label>
                <input
                  type="tel"
                  value={joinForm.patientPhone}
                  onChange={(e) => setJoinForm({ ...joinForm, patientPhone: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder={language === "bn" ? "01XXXXXXXXX" : "01XXXXXXXXX"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === "bn" ? "ইমেইল (ঐচ্ছিক)" : "Email (Optional)"}
                </label>
                <input
                  type="email"
                  value={joinForm.patientEmail}
                  onChange={(e) => setJoinForm({ ...joinForm, patientEmail: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder={language === "bn" ? "ইমেইল ঠিকানা" : "Email address"}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition"
              >
                {language === "bn" ? "বাতিল" : "Cancel"}
              </button>
              <button
                onClick={handleJoinQueue}
                disabled={joining}
                className="flex-1 py-2.5 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {joining ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Video className="h-4 w-4" />
                    {language === "bn" ? "যোগ দিন" : "Join"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
