"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AppDownloadSection() {
  return (
    <div className="w-full bg-yellow-300 py-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">

          {/* LEFT — Title + description + store buttons */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-5"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
              Download Meditime Mobile App Today
            </h2>
            <p className="text-sm text-slate-800 leading-relaxed">
              Meditime Mobile App is your expert medical service assistant.
              Book Doctor Appointment, See test price, Hosital Location within
              one place.
            </p>

            {/* Store buttons — stacked black pills */}
            <div className="flex flex-col gap-3 w-fit">
              {/* Google Play */}
              <a
                href="#"
                className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl transition-all w-48"
              >
                <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] text-gray-300 uppercase tracking-wide">GET IT ON</span>
                  <span className="text-sm font-bold">Google Play</span>
                </div>
              </a>

              {/* App Store */}
              <a
                href="#"
                className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl transition-all w-48"
              >
                <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] text-gray-300 uppercase tracking-wide">Download on the</span>
                  <span className="text-sm font-bold">App Store</span>
                </div>
              </a>
            </div>
          </motion.div>

          {/* CENTER — Phone on circle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center justify-center relative"
          >
            {/* Large teal circle bg */}
            <div className="absolute w-72 h-72 rounded-full bg-primary/80" />

            {/* Phone mockup — use actual app screenshot or fallback to built mockup */}
            <div className="relative z-10 w-52 -mb-12 drop-shadow-2xl" style={{ transform: "rotate(-8deg)" }}>
              {/* Phone frame */}
              <div className="w-full bg-slate-900 rounded-[2rem] p-1.5 shadow-2xl">
                <div className="bg-white rounded-[1.7rem] overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-primary px-4 py-1.5 flex justify-between items-center">
                    <span className="text-white text-[10px] font-bold">9:41</span>
                    <span className="text-white text-[10px] font-bold">MEDI TIME</span>
                    <div className="w-6 h-2.5 border border-white rounded-sm" />
                  </div>
                  {/* App content */}
                  <div className="p-3 space-y-2 bg-gray-50">
                    {[
                      { label: "ডাক্তার অ্যাপয়েন্টমেন্ট", sub: "Doctor Appointment", color: "bg-primary", text: "text-white" },
                      { label: "হাসপাতাল", sub: "Hospital", color: "bg-blue-50", text: "text-gray-800" },
                      { label: "ভিডিও কনসালটেশন", sub: "Video Consultation", color: "bg-purple-50", text: "text-gray-800" },
                      { label: "ডায়াগনস্টিক ও টেস্ট", sub: "Diagnostic & Tests", color: "bg-red-50", text: "text-gray-800" },
                    ].map((item, i) => (
                      <div key={i} className={`${item.color} rounded-lg px-3 py-2`}>
                        <p className={`text-[10px] font-bold ${item.text}`}>{item.label}</p>
                        <p className={`text-[9px] ${item.text} opacity-70`}>{item.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT — QR code */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center lg:items-end gap-3"
          >
            <div className="w-36 h-36 bg-white border-4 border-slate-900 rounded-xl overflow-hidden shadow-lg">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://meditime.com.bd"
                alt="Scan to download"
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-sm font-semibold text-slate-900 text-center">
              QR কোড স্ক্যান করে<br />ডাউনলোড করুন
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}