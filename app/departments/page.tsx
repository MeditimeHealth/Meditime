"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Department {
  _id: string;
  name: string;
  image?: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      const data = await response.json();
      if (response.ok) {
        setDepartments(data.departments || []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter departments based on search query
  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
            style={{
              fontFamily:
                "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-xl font-semibold text-gray-700">
              লোড হচ্ছে...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Navbar />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative mt-20 h-[400px] md:h-[500px] w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-primary/50 to-primary-dark/50 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="relative z-20 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                কোন রোগে কোন ডাক্তার?
              </h1>
              <p
                className="text-xl md:text-2xl text-white/95 mb-8 drop-shadow-lg"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                আপনার প্রয়োজন অনুযায়ী সঠিক বিভাগ এবং বিশেষজ্ঞ ডাক্তার খুঁজুন
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="বিভাগ খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg border-2 border-gray-200 focus:border-primary rounded-xl shadow-sm"
                style={{
                  fontFamily:
                    "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12 text-center"
        >
          <p
            className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
            style={{
              fontFamily:
                "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            আমাদের সকল চিকিৎসা বিভাগ দেখুন এবং আপনার প্রয়োজন অনুযায়ী সঠিক বিশেষজ্ঞ ডাক্তার খুঁজে নিন। 
            প্রতিটি বিভাগে ক্লিক করে সেই বিভাগের সকল ডাক্তারদের তালিকা দেখুন।
          </p>
        </motion.div>

        {/* Department Cards Grid */}
        {filteredDepartments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 py-12"
          >
            <p
              className="text-xl"
              style={{
                fontFamily:
                  "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              {searchQuery
                ? "কোনো বিভাগ খুঁজে পাওয়া যায়নি"
                : "কোনো বিভাগ পাওয়া যায়নি"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDepartments.map((department, index) => (
              <motion.div
                key={department._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link href={`/departments/${encodeURIComponent(department.name)}`}>
                  <div className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 p-6 flex flex-col items-center text-center cursor-pointer h-full group hover:scale-105 border border-gray-100">
                    {/* Image */}
                    {department.image ? (
                      <div className="mb-4 flex justify-center">
                        <div className="relative w-24 h-24 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <Image
                            src={department.image}
                            alt={department.name}
                            width={96}
                            height={96}
                            className="object-contain"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="mb-4 flex justify-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary-dark/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <span className="text-4xl">🏥</span>
                        </div>
                      </div>
                    )}

                    {/* Department Name */}
                    <h3
                      className="text-base md:text-lg font-bold text-gray-800 group-hover:text-primary transition-colors duration-300"
                      style={{
                        fontFamily:
                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      {department.name}
                    </h3>

                    {/* View Doctors Link */}
                    <p
                      className="mt-2 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        fontFamily:
                          "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      ডাক্তার দেখুন →
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Total Count */}
        {filteredDepartments.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p
              className="text-lg text-gray-600"
              style={{
                fontFamily:
                  "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              মোট {filteredDepartments.length} টি বিভাগ পাওয়া গেছে
            </p>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
