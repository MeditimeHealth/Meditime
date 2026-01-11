"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Stethoscope, Activity, Baby, Bone } from "lucide-react";

const featuredDepartments = [
  {
    id: "1",
    name: "Department of Medicine",
    description: "The Medicine department covers nearly all medical conditions and is often the first step in your treatment. Meet the best medicine specialists near you.",
    icon: Stethoscope,
    slug: "medicine",
  },
  {
    id: "2",
    name: "Diabetes Department",
    description: "Find the Most Experienced Diabetes Doctors in Savar, Ashulia, Gazipur, Konabari, Kaliyakoir, Dhamrai and Nearby Areas.",
    icon: Activity,
    slug: "diabetes",
  },
  {
    id: "3",
    name: "Gynecology & Obstetrics Department",
    description: "See the curated list of gynecologists near you in Savar. Gynecologists may also be referred to as women's health specialists or OB-GYNs.",
    icon: Baby,
    slug: "gynecology",
  },
  {
    id: "4",
    name: "Department of Orthopedics",
    description: "Doctors in Orthopedics help you overcome complications caused by trauma, injuries, and more. Commonly known as Orthopedic Doctors or Orthopedic Surgeons.",
    icon: Bone,
    slug: "orthopedics",
  },
];

export default function DepartmentSection() {
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
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            style={{
              color: "#1e3a8a",
            }}
          >
            See Doctor List by Department Name
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto">
            Simply click on the department name and you will see an extended list of doctors with specialty.
          </p>
        </motion.div>

        {/* Department Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featuredDepartments.map((department, index) => {
            const IconComponent = department.icon;
            return (
              <motion.div
                key={department.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/departments/${encodeURIComponent(department.slug)}`}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-center text-center cursor-pointer h-full">
                    {/* Icon */}
                    <div className="mb-4 flex justify-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#009A98] to-[#00B5B2] flex items-center justify-center">
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    {/* Department Name */}
                    <h3
                      className="text-base md:text-lg font-bold mb-2"
                      style={{
                        color: "#1e3a8a",
                      }}
                    >
                      {department.name}
                    </h3>
                    
                    {/* Description */}
                    {/* <p className="text-sm text-gray-600 leading-relaxed">
                      {department.description}
                    </p> */}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* View All Departments Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Link href="/departments">
            <button
              className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Other Departments →
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
