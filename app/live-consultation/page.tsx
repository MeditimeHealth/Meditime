"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";
import Link from "next/link";
import { Video, Clock, Users, DollarSign, Phone, Search, Wifi, WifiOff } from "lucide-react";
import toast from "react-hot-toast";

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
    const q = search.toLowerCase();
    return doctorName.toLowerCase().includes(q) || specialty.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f0fdfa" }}>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 overflow-hidden" style={{ background: "linear-gradient(135deg, #0d9488 0%, #115e59 100%)" }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
              </span>
              <span className="text-white/90 text-sm font-medium">
                {language === "bn" ? "লাইভ কনসালটেশন চালু আছে" : "Live Consultations Available"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              {language === "bn" ? "এখনই ডাক্তারের সাথে কথা বলুন" : "Talk to a Doctor Right Now"}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              {language === "bn"
                ? "অপেক্ষার ঝামেলা নেই — সরাসরি ভিডিও কলে বিশেষজ্ঞ ডাক্তারের পরামর্শ নিন। কিউতে যোগ দিন এবং আপনার পালা এলে সরাসরি কথা বলুন।"
                : "No waiting hassles — get expert advice via a live video call. Join the queue and talk directly when it's your turn."}
            </p>
            {/* Search */}
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === "bn" ? "ডাক্তার বা বিভাগ খুঁজুন..." : "Search doctor or specialty..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full bg-white shadow-lg text-gray-800 focus:ring-2 focus:ring-teal-300 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
          </div>
        ) : filteredConsultants.length === 0 ? (
          <div className="text-center py-20">
            <WifiOff className="h-20 w-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">
              {language === "bn" ? "এই মুহূর্তে কোনো ডাক্তার লাইভে নেই" : "No Doctors Are Live Right Now"}
            </h3>
            <p className="text-gray-400 mt-2">{language === "bn" ? "পরে আবার চেষ্টা করুন" : "Please check back later"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredConsultants.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                {/* Card Header */}
                <div className="relative p-6 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      {c.doctorId?.image ? (
                        <img
                          src={c.doctorId.image}
                          alt={c.doctorId.name}
                          className="w-20 h-20 rounded-2xl object-cover shadow-sm"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
                          {c.doctorId?.name?.charAt(0) || "D"}
                        </div>
                      )}
                      <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-green-500 border-2 border-white" />
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight truncate">
                        {language === "bn" && c.doctorId?.nameBn ? c.doctorId.nameBn : c.doctorId?.name}
                      </h3>
                      <p className="text-teal-600 text-sm font-medium mt-0.5">
                        {language === "bn" && c.doctorId?.specialtyBn ? c.doctorId.specialtyBn : c.doctorId?.specialty}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5 truncate">
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
      </section>

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
