"use client";

import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Heart, 
  Search, 
  MapPin, 
  Phone, 
  User, 
  Droplet,
  PlusCircle,
  ShieldCheck,
  ChevronRight,
  Filter,
  CheckCircle2,
  Users
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage, getLocalizedValue } from "@/contexts/LanguageContext";
import { useState, useEffect, useCallback } from "react";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

export default function BloodDonorPage() {
  const { language } = useLanguage();
  const [selectedGroup, setSelectedGroup] = useState("");
  const [divisions, setDivisions] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedDivision, setSelectedDivision] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [donors, setDonors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const fetchDivisions = useCallback(async () => {
    try {
      const res = await fetch("/api/locations/divisions");
      const data = await res.json();
      if (res.ok) setDivisions(data.divisions);
    } catch (error) {
      console.error("Error fetching divisions:", error);
    }
  }, []);

  const fetchDistricts = useCallback(async (divisionId: string) => {
    try {
      const res = await fetch(`/api/locations/districts?division=${divisionId}`);
      const data = await res.json();
      if (res.ok) setDistricts(data.districts);
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
  }, []);

  useEffect(() => {
    fetchDivisions();
  }, [fetchDivisions]);

  useEffect(() => {
    if (selectedDivision) {
      fetchDistricts(selectedDivision);
    } else {
      setDistricts([]);
    }
    setSelectedDistrict("");
  }, [selectedDivision, fetchDistricts]);

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      let url = `/api/blood-donors?`;
      if (selectedGroup) url += `bloodGroup=${encodeURIComponent(selectedGroup)}&`;
      if (selectedDivision) {
        const div = divisions.find(d => d._id === selectedDivision);
        if (div) url += `division=${encodeURIComponent(div.name)}&`;
      }
      if (selectedDistrict) {
        const dist = districts.find(d => d._id === selectedDistrict);
        if (dist) url += `district=${encodeURIComponent(dist.name)}&`;
      }

      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setDonors(data.bloodDonors);
      }
    } catch (error) {
      console.error("Error searching donors:", error);
    } finally {
      setLoading(false);
      // Smooth scroll to results
      setTimeout(() => {
        const results = document.getElementById("results");
        if (results) results.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const t = {
    title: { en: "Find a Blood Donor", bn: "রক্তদাতা খুঁজুন" },
    subtitle: { en: "Connecting life-saving blood donors with those in need across Bangladesh.", bn: "সারা বাংলাদেশে রক্তদাতাদের সাথে প্রয়োজনে ব্যক্তিদের সংযোগ স্থাপন করছি।" },
    searchBtn: { en: "Search Donors", bn: "দাতা খুঁজুন" },
    becomeDonor: { en: "Become a Donor", bn: "রক্তদাতা হোন" },
    stats: [
      { label: { en: "Active Donors", bn: "সক্রিয় দাতা" }, value: "12k+" },
      { label: { en: "Lives Saved", bn: "জীবন বাঁচানো" }, value: "45k+" },
      { label: { en: "Districts", bn: "জেলা" }, value: "64" }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-white border-b border-slate-100">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-50 text-red-600 font-bold text-xs mb-6 uppercase tracking-widest border border-red-100">
                <Heart className="w-4 h-4 fill-current" />
                Blood Donation Management
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
                {language === 'en' ? (
                  <>Saving Lives with <span className="text-red-500">Every Drop</span> Counts</>
                ) : (
                  <>প্রতিটি রক্তবিন্দু দিয়ে <span className="text-red-500">জীবন</span> বাঁচান</>
                )}
              </h1>
              <p className="text-lg text-slate-600 mb-10 max-w-xl">
                {language === 'en' 
                  ? "Access our extensive database of voluntary blood donors from all of Bangladesh. Fast, secure, and life-saving."
                  : "সারা বাংলাদেশের স্বেচ্ছায় রক্তদাতাদের বিশাল ডাটাবেজ থেকে প্রয়োজনীয় রক্তদাতা খুঁজে নিন। দ্রুত, নিরাপদ এবং জীবন রক্ষাকারী।"}
              </p>
              
              <div className="grid grid-cols-3 gap-6">
                {t.stats.map((stat, i) => (
                  <div key={i}>
                    <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label[language as keyof typeof stat.label]}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <Card className="p-8 rounded-[3rem] shadow-2xl border-none bg-white relative z-10">
                <h3 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-2">
                  <Search className="w-6 h-6 text-red-500" />
                  {t.title[language as keyof typeof t.title]}
                </h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                      {language === 'en' ? "Blood Group" : "রক্তের গ্রুপ"}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {bloodGroups.map(group => (
                        <button
                          key={group}
                          onClick={() => setSelectedGroup(group)}
                          className={`h-12 rounded-xl font-bold flex items-center justify-center transition-all ${
                            selectedGroup === group 
                              ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                              : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {group}
                        </button>
                      ))}
                    </div>
                  </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                          {language === 'en' ? "Division" : "বিভাগ"}
                        </label>
                        <select 
                          value={selectedDivision}
                          onChange={(e) => setSelectedDivision(e.target.value)}
                          className="w-full h-14 px-4 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-red-500/20"
                        >
                          <option value="">{language === 'en' ? "Select Division" : "বিভাগ নির্বাচন করুন"}</option>
                          {divisions.map((div) => (
                            <option key={div._id} value={div._id}>
                              {getLocalizedValue(div.name, div.nameBn, language)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
                          {language === 'en' ? "District" : "জেলা"}
                        </label>
                        <select 
                          value={selectedDistrict}
                          onChange={(e) => setSelectedDistrict(e.target.value)}
                          disabled={!selectedDivision}
                          className="w-full h-14 px-4 bg-slate-50 border-none rounded-xl font-medium focus:ring-2 focus:ring-red-500/20 disabled:opacity-50"
                        >
                          <option value="">{language === 'en' ? "Select District" : "জেলা নির্বাচন করুন"}</option>
                          {districts.map((dist) => (
                            <option key={dist._id} value={dist._id}>
                              {getLocalizedValue(dist.name, dist.nameBn, language)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <Button 
                      onClick={handleSearch}
                      disabled={loading}
                      className="w-full h-16 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 gap-2"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          {t.searchBtn[language as keyof typeof t.searchBtn]}
                        </>
                      )}
                    </Button>
                </div>
              </Card>

              {/* Decorative elements */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-red-400/10 rounded-[3rem] -z-0" />
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-100 rounded-full -z-0" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <AnimatePresence>
        {hasSearched && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            id="results"
            className="py-12 bg-slate-50 scroll-mt-24"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-slate-900">
                  {language === 'en' ? "Search Results" : "অনুসন্ধানের ফলাফল"}
                  <span className="ml-3 px-3 py-1 rounded-full bg-red-100 text-red-600 text-sm">
                    {donors.length}
                  </span>
                </h2>
              </div>

              {donors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {donors.map((donor) => (
                    <motion.div
                      key={donor._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group"
                    >
                      <Card className="p-6 rounded-[2rem] border-none shadow-lg hover:shadow-xl transition-all bg-white relative overflow-hidden">
                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 ring-4 ring-slate-50">
                            {donor.photo ? (
                              <Image src={donor.photo} alt={donor.name} fill className="object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-500 text-2xl font-black">
                                {donor.bloodGroup}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-900 leading-tight">
                              {getLocalizedValue(donor.name, donor.nameBn, language)}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {donor.district || donor.division || "Location N/A"}
                              </p>
                            </div>
                          </div>
                          <div className="ml-auto w-12 h-12 rounded-xl bg-red-500 text-white flex items-center justify-center font-black text-lg shadow-lg shadow-red-500/20">
                            {donor.bloodGroup}
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 font-medium">Availability</span>
                            <span className={`font-bold ${donor.availabilityStatus === 'Available' ? 'text-green-500' : 'text-orange-500'}`}>
                              {donor.availabilityStatus}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 font-medium">Last Donation</span>
                            <span className="font-bold text-slate-700">
                              {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never'}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <a 
                            href={`tel:${donor.phoneNumber}`}
                            className="flex-1 h-12 inline-flex items-center justify-center bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold gap-2 transition-all active:scale-95"
                          >
                            <Phone className="w-4 h-4" />
                            {language === 'en' ? "Call Now" : "কল করুন"}
                          </a>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
                    <Users className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">
                    {language === 'en' ? "No Donors Found" : "কোনো রক্তদাতা পাওয়া যায়নি"}
                  </h3>
                  <p className="text-slate-400">
                    {language === 'en' 
                      ? "Try adjusting your filters to find more donors in nearby areas." 
                      : "আপনার ফিল্টার পরিবর্তন করে নিকটস্থ এলাকার রক্তদাতাদের খুঁজুন।"}
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Why Blood Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-[4/5] relative rounded-[3rem] overflow-hidden shadow-2xl">
                <Image 
                  src="/images/blood_donor_hero.png" 
                  alt="Blood Donation" 
                  fill 
                  className="object-cover" 
                />
              </div>
              <div className="absolute bottom-10 -right-10 bg-white p-8 rounded-[2rem] shadow-2xl border border-slate-100 hidden md:block max-w-[280px]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="font-black text-slate-800">{language === 'en' ? "Free Service" : "ফ্রি সার্ভিস"}</p>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  {language === 'en' 
                    ? "MediTime doesn't charge users for blood donor services. It's built for society."
                    : "মেডিটাইম রক্তদাতার সেবার জন্য কোন চার্জ নেয় না। এটি সমাজের জন্য নির্মিত।"}
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight">
                {language === 'en' 
                  ? "Be a Hero in Someone's Story" 
                  : "কারো জীবনের গল্পে নায়ক হয়ে উঠুন"}
              </h2>
              <div className="space-y-10">
                {[
                  {
                    icon: <Users className="w-6 h-6" />,
                    title: { en: "Community Driven", bn: "কমিউনিটি ভিত্তিক" },
                    desc: { en: "Our platform is built by the community for the community. Every donor is a verified hero.", bn: "আমাদের প্ল্যাটফর্মটি কমিউনিটির জন্য নির্মিত। প্রতিটি রক্তদাতা আমাদের কাছে নায়ক।" }
                  },
                  {
                    icon: <ShieldCheck className="w-6 h-6" />,
                    title: { en: "Secure Contact", bn: "নিরাপদ যোগাযোগ" },
                    desc: { en: "We ensure that your contact information is protected and only shared with verified users in need.", bn: "আমরা নিশ্চিত করি আপনার যোগাযোগের তথ্য নিরাপদ এবং শুধুমাত্র প্রয়োজনে যাচাইকৃত ব্যক্তিদের সাথে শেয়ার করা হয়।" }
                  }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{item.title[language as keyof typeof item.title]}</h4>
                      <p className="text-slate-500 leading-relaxed">{item.desc[language as keyof typeof item.desc]}</p>
                    </div>
                  </div>
                ))}

                <div className="pt-6">
                   <Button 
                    onClick={() => setShowRegisterModal(true)}
                    className="h-16 px-10 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-red-500/20 gap-3 group"
                  >
                    <PlusCircle className="w-6 h-6" />
                    {t.becomeDonor[language as keyof typeof t.becomeDonor]}
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-red-500 rounded-[3.5rem] p-12 md:p-24 text-center relative overflow-hidden">
             <div className="absolute top-0 left-1/2 w-full h-full bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
             <div className="relative z-10">
              <h2 className="text-3xl md:text-6xl font-black text-white mb-8">
                {language === 'en' ? "Emergency Need?" : "জরুরি প্রয়োজন?"}
              </h2>
              <p className="text-white/80 text-xl mb-12 max-w-2xl mx-auto font-medium">
                {language === 'en' 
                  ? "Our support team is available 24/7 to help you find blood in critical situations."
                  : "আপনার জরুরি অবস্থায় রক্তদাতা খুঁজে পেতে আমাদের সাপোর্ট টিম ২৪/৭ প্রস্তুত।"}
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Button className="h-16 px-12 bg-white text-red-500 hover:bg-red-50 rounded-2xl font-black text-xl shadow-2xl">
                  <Phone className="w-6 h-6 mr-3 fill-current" />
                  +880 1234 567890
                </Button>
              </div>
             </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Become a Donor Modal */}
      <AnimatePresence>
        {showRegisterModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegisterModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 fill-current" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-4">
                  {language === 'en' ? "Join as a Donor" : "রক্তদাতা হিসেবে যুক্ত হোন"}
                </h2>
                <p className="text-slate-500 mb-8 leading-relaxed">
                  {language === 'en' 
                    ? "Thank you for your interest! Please contact our coordination team to verify your details and join our life-saving community." 
                    : "আপনার আগ্রহের জন্য ধন্যবাদ! আপনার তথ্য যাচাই করতে এবং আমাদের জীবন রক্ষাকারী কমিউনিটিতে যোগ দিতে আমাদের টিমের সাথে যোগাযোগ করুন।"}
                </p>

                <div className="space-y-4">
                  <Button className="w-full h-14 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold gap-3">
                    <Phone className="w-5 h-5" />
                    +880 1234 567890
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowRegisterModal(false)}
                    className="w-full h-14 border-slate-200 text-slate-600 rounded-xl font-bold"
                  >
                    {language === 'en' ? "Close" : "বন্ধ করুন"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
