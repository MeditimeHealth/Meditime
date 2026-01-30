"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Stethoscope, Activity, Baby, Bone, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Department {
  _id: string;
  name: string;
  image?: string;
}

// Icon mapping for departments
const getIconForDepartment = (departmentName: string) => {
  const name = departmentName.toLowerCase();
  if (name.includes('medicine')) return Stethoscope;
  if (name.includes('diabetes')) return Activity;
  if (name.includes('gynecology') || name.includes('obstetrics')) return Baby;
  if (name.includes('orthopedics') || name.includes('orthopaedics')) return Bone;
  return Stethoscope; // Default icon
};

// Color mapping for departments
const getColorForDepartment = (departmentName: string) => {
  const name = departmentName.toLowerCase();
  if (name.includes('medicine')) return 'from-blue-500 to-blue-600';
  if (name.includes('diabetes')) return 'from-primary to-primary-dark';
  if (name.includes('gynecology') || name.includes('obstetrics')) return 'from-rose-500 to-rose-600';
  if (name.includes('orthopedics') || name.includes('orthopaedics')) return 'from-amber-500 to-amber-600';
  if (name.includes('cardiology')) return 'from-red-500 to-red-600';
  if (name.includes('pediatric') || name.includes('child')) return 'from-purple-500 to-purple-600';
  if (name.includes('neurology')) return 'from-indigo-500 to-indigo-600';
  return 'from-teal-500 to-teal-600'; // Default color
};

export default function DepartmentSection() {
  const swiperRef = useRef<SwiperType | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        const data = await response.json();
        if (response.ok) {
          // Limit to first 6 departments for the slider
          setDepartments(data.departments.slice(0, 6));
        }
      } catch (error) {
        console.error('Error fetching departments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  if (loading) {
    return (
      <div className="w-full py-20 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
            />
            <p className="text-xl font-semibold text-gray-700">Loading departments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-20 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-50 rounded-full blur-3xl -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          {/* <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-primary bg-primary/8 rounded-full border border-primary/20">
            Medical Departments
          </span> */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-800 tracking-tight">
            Doctor List by <span className="text-gradient">Department</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Simply click on the department name and you will see an extended list of doctors with specialty.
          </p>
        </motion.div>

        {/* Department Cards Slider (Desktop/Tablet) */}
        <div className="hidden md:block relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 lg:-left-12 top-1/2 -translate-y-1/2 z-10 text-primary hover:text-primary-dark transition-colors p-2"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 lg:-right-12 top-1/2 -translate-y-1/2 z-10 text-primary hover:text-primary-dark transition-colors p-2"
            aria-label="Next slide"
          >
            <ChevronRight className="w-8 h-8" />
          </button>

          <Swiper
            modules={[Navigation, Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            loop={departments.length > 4}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 24,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 32,
              },
            }}
            className="!pb-2"
          >
            {departments.map((department) => {
              const IconComponent = getIconForDepartment(department.name);
              const colorGradient = getColorForDepartment(department.name);
              const slug = department.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
              
              return (
                <SwiperSlide key={department._id}>
                  <Link href={`/departments/${encodeURIComponent(slug)}`}>
                    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 p-6 lg:p-8 flex flex-col items-center text-center cursor-pointer h-[200px] border border-slate-100 group hover:-translate-y-2 relative overflow-hidden">
                      {/* Hover Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      
                      {/* Icon */}
                      <div className="mb-5 flex justify-center">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${colorGradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                          <IconComponent className="w-10 h-10 text-white" strokeWidth={1.5} />
                        </div>
                      </div>

                      {/* Department Name */}
                      <h3 className="text-base md:text-lg font-bold mb-2 text-slate-800 group-hover:text-primary transition-colors duration-300 leading-tight line-clamp-2">
                        {department.name}
                      </h3>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* Mobile Grid View */}
        <div className="md:hidden flex flex-wrap gap-4">
          {departments.map((department) => {
            const IconComponent = getIconForDepartment(department.name);
            const colorGradient = getColorForDepartment(department.name);
            const slug = department.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

            return (
              <Link href={`/departments/${encodeURIComponent(slug)}`} key={department._id} className="w-[calc(33.333%-11px)]">
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 flex flex-col items-center text-center cursor-pointer border border-slate-100 h-full">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorGradient} flex items-center justify-center shadow-md mb-3`}>
                    <IconComponent className="w-7 h-7 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 leading-tight line-clamp-2">
                    {department.name}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View All Departments Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-14 text-center"
        >
          <Link href="/departments">
            <button className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 transform hover:scale-105 group">
              Other Departments
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
