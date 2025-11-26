"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface Department {
  _id: string;
  name: string;
  image?: string;
}

export default function DepartmentSection() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      const data = await response.json();
      if (response.ok) {
        // Only show departments that have images
        const departmentsWithImages = (data.departments || []).filter(
          (dept: Department) => dept.image
        );
        setDepartments(departmentsWithImages);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2
            className="text-3xl md:text-4xl font-bold text-center mb-8"
            style={{
              color: "#1e3a8a",
              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            কোন রোগে কোন ডাক্তার?
          </h2>
        </motion.div>

        {/* Department Cards Grid */}
        {departments.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <p
              style={{
                fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              কোনো বিভাগ পাওয়া যায়নি
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {departments.map((department, index) => (
              <motion.div
                key={department._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center text-center cursor-pointer h-full">
                  {/* Image */}
                  <div className="mb-4 flex justify-center">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <Image
                        src={department.image!}
                        alt={department.name}
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    </div>
                  </div>

                  {/* Department Name */}
                  <h3
                    className="text-base md:text-lg font-bold"
                    style={{
                      color: "#1e3a8a",
                      fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    {department.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

