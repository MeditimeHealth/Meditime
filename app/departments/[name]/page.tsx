"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Stethoscope } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DoctorCard, { Doctor } from "@/components/doctor-card";
import PageLoader from "@/components/page-loader";
import Link from "next/link";

export default function DepartmentDoctorsPage() {
  const params = useParams();
  const departmentName = decodeURIComponent(params.name as string);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDoctors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [departmentName]);

  const fetchDoctors = async () => {
    try {
      const response = await fetch(`/api/doctors?limit=200`);
      const data = await response.json();
      if (response.ok) {
        const departmentDoctors = (data.doctors || []).filter(
          (doctor: Doctor) => doctor.department === departmentName
        );
        setDoctors(departmentDoctors);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = useMemo(() => {
    if (!searchQuery) return doctors;
    const query = searchQuery.toLowerCase();
    return doctors.filter(
      (doctor) =>
        doctor.name.toLowerCase().includes(query) ||
        doctor.specialty?.toLowerCase().includes(query) ||
        doctor.availability?.some(slot => slot.hospital?.toLowerCase().includes(query)) ||
        doctor.qualification.toLowerCase().includes(query)
    );
  }, [doctors, searchQuery]);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative  h-[300px] md:h-[400px] w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/50 to-primary-dark/60 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1584432810601-6c7f27d2362b?w=1920&q=80')",
          }}
        />
        <div className="relative z-20 h-full flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <p className="text-white/80 text-sm font-medium mb-3 uppercase tracking-widest">বিভাগ</p>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-2xl leading-tight">
                {departmentName}
              </h1>
              <p className="text-lg text-white/90 drop-shadow-md">
                এই বিভাগের সকল বিশেষজ্ঞ ডাক্তার দেখুন এবং অ্যাপয়েন্টমেন্ট বুক করুন
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8"
        >
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="নাম, বিশেষতা, হাসপাতাল দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-5 text-base border-2 border-gray-200 focus:border-primary rounded-xl shadow-sm"
              />
            </div>
          </div>
        </motion.div>

        {/* Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-6 text-center"
        >
          <p className="text-base text-gray-600">
            {filteredDoctors.length} জন ডাক্তার খুঁজে পাওয়া গেছে
          </p>
        </motion.div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <Stethoscope className="h-20 w-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-semibold text-gray-700 mb-4">
                এই বিভাগে কোন ডাক্তার পাওয়া যায়নি
              </h3>
              <p className="text-gray-500 mb-8">
                দয়া করে অন্য বিভাগ দেখুন অথবা পরে আবার চেষ্টা করুন
              </p>
              <Link href="/departments">
                <Button className="bg-primary hover:bg-primary-dark text-white">
                  সকল বিভাগ দেখুন
                </Button>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2  xl:grid-cols-3 gap-5">
            {filteredDoctors.map((doctor, index) => (
              <motion.div
                key={doctor._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <DoctorCard doctor={doctor} index={index} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
