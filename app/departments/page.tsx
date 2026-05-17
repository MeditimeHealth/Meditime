"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import PageLoader from "@/components/page-loader";

interface Department {
  _id: string;
  name: string;
  image?: string;
}

// All available icon filenames (without .png extension) in /public/icon_of_dept
const DEPT_ICONS = [
  "Burn-Plastic & Reconstructive Surgery",
  "Cardiology & Medicine",
  "Chest Thoracic Surgery",
  "Dermatology & Venereology",
  "Diabetes  Endocrinology",
  "ENT-Ear Nose & Throat",
  "Gastro-Liver Diseases",
  "General & Laparoscopic Surgery",
  "Gynecology & Obstetrics",
  "Hematology & Medicine (Blood diseases)",
  "Hepato-Biliary & Liver Transplant Surgery",
  "Medicine Specialist",
  "Neonatal & Pediatrics",
  "Nephrology & Medicine",
  "Neuromedicine & Neurosurgery",
  "Nuclear Medicine",
  "Nutrition & Dietetics",
  "Oncology Cancer)",
  "Ophthalmology",
  "Oral & Dental Diseases",
  "Pain Medicine & Rheumatology ",
  "Physiotherapy",
  "Psychiatry & Psychotherapy",
  "Pulmonology & Asthma",
  "Thyroid & Hormone ",
  "Trauma & Orthopedic Surgery",
  "Urology & Nephrology",
  "Vascular Surgery (Blood vessels)",
];

/**
 * Fuzzy match a department name to an icon filename by checking if
 * any significant word in the dept name appears in the icon filename.
 */
function findDeptIcon(deptName: string): string | null {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim();

  const deptWords = normalize(deptName)
    .split(/\s+/)
    .filter((w) => w.length > 3); // ignore short words like "and", "of"

  if (deptWords.length === 0) return null;

  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const icon of DEPT_ICONS) {
    const normalizedIcon = normalize(icon);
    let score = 0;
    for (const word of deptWords) {
      if (normalizedIcon.includes(word)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = icon;
    }
  }

  return bestScore > 0 ? bestMatch : null;
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

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
                কোন রোগে কোন ডাক্তার?
              </h1>
              <p className="text-xl md:text-2xl text-white/95 mb-8 drop-shadow-lg">
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
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
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
            <p className="text-xl">
              {searchQuery ? "কোনো বিভাগ খুঁজে পাওয়া যায়নি" : "কোনো বিভাগ পাওয়া যায়নি"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {filteredDepartments.map((department, index) => {
              // Use DB image if set; otherwise do fuzzy icon matching
              const matchedIcon = findDeptIcon(department.name);
              const iconSrc = department.image
                ? department.image
                : matchedIcon
                ? `/icon_of_dept/${encodeURIComponent(matchedIcon)}.png`
                : null;

              return (
                <motion.div
                  key={department._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.04 }}
                  whileHover={{ y: -4 }}
                >
                  <Link href={`/departments/${encodeURIComponent(department.name)}`}>
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-5 flex flex-col items-center text-center cursor-pointer h-full group border border-gray-100 hover:border-primary/30">
                      {/* Icon */}
                      <div className="mb-4 flex items-center justify-center w-20 h-20 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors duration-300">
                        {iconSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={iconSrc}
                            alt={department.name}
                            width={56}
                            height={56}
                            className="object-contain group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = '<span style="font-size:2rem">🏥</span>';
                              }
                            }}
                          />
                        ) : (
                          <span className="text-3xl group-hover:scale-110 transition-transform duration-300 inline-block">🏥</span>
                        )}
                      </div>

                      {/* Department Name */}
                      <h3 className="text-sm md:text-sm font-bold text-gray-800 group-hover:text-primary transition-colors duration-300 leading-snug">
                        {department.name}
                      </h3>

                      {/* View Doctors Link */}
                      <p className="mt-2 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        ডাক্তার দেখুন →
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
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
            <p className="text-lg text-gray-600">
              মোট {filteredDepartments.length} টি বিভাগ পাওয়া গেছে
            </p>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
