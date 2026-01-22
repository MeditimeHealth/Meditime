"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Stethoscope, Activity, Baby, Bone, ArrowRight } from "lucide-react";

const featuredDepartments = [
  {
    id: "1",
    name: "Department of Medicine",
    description: "The Medicine department covers nearly all medical conditions and is often the first step in your treatment.",
    icon: Stethoscope,
    slug: "medicine",
    color: "from-blue-500 to-blue-600",
  },
  {
    id: "2",
    name: "Diabetes Department",
    description: "Find the Most Experienced Diabetes Doctors in Savar, Ashulia, Gazipur, and Nearby Areas.",
    icon: Activity,
    slug: "diabetes",
    color: "from-primary to-primary-dark",
  },
  {
    id: "3",
    name: "Gynecology & Obstetrics",
    description: "See the curated list of gynecologists near you. Also referred to as women's health specialists.",
    icon: Baby,
    slug: "gynecology",
    color: "from-rose-500 to-rose-600",
  },
  {
    id: "4",
    name: "Department of Orthopedics",
    description: "Doctors help you overcome complications caused by trauma, injuries, and orthopedic issues.",
    icon: Bone,
    slug: "orthopedics",
    color: "from-amber-500 to-amber-600",
  },
];

export default function DepartmentSection() {
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
          <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium text-primary bg-primary/8 rounded-full border border-primary/20">
            Medical Departments
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-slate-800 tracking-tight">
            Doctor List by <span className="text-gradient">Department</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-lg">
            Simply click on the department name and you will see an extended list of doctors with specialty.
          </p>
        </motion.div>

        {/* Department Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
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
                  <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 p-6 lg:p-8 flex flex-col items-center text-center cursor-pointer h-full border border-slate-100 group hover:-translate-y-2 relative overflow-hidden">
                    {/* Hover Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    
                    {/* Icon */}
                    <div className="mb-5 flex justify-center">
                      <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${department.color} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-500`}>
                        <IconComponent className="w-10 h-10 text-white" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Department Name */}
                    <h3 className="text-base md:text-lg font-bold mb-2 text-slate-800 group-hover:text-primary transition-colors duration-300 leading-tight">
                      {department.name}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm text-slate-500 leading-relaxed hidden sm:block">
                      {department.description}
                    </p>
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
