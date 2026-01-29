"use client";

import { motion } from "framer-motion";
import { Smartphone } from "lucide-react";

export default function AppDownloadSection() {
  return (
    <div className="w-full py-16 bg-gradient-to-br from-[#009A98]/5 via-white to-[#00B5B2]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left Side - Text and Download Buttons */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6 w-full lg:w-1/2"
          >
            <div>
              {/* <p className="text-lg text-primary font-semibold mb-2">
                Mobile App
              </p> */}
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                style={{
                  color: "#009A98",
                }}
              >
                Download Meditime Mobile App Today
              </h2>
              <p
                className="text-lg md:text-xl text-gray-600"
              >
                Meditime Mobile App is your expert medical service assistant. Book Doctor Appointment, See test price, Hosital Location within one place.
              </p>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {/* Google Play Button */}
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-300">Download on the</span>
                  <span className="text-lg font-semibold">Google Play</span>
                </div>
              </motion.a>

              {/* App Store Button */}
              <motion.a
                href="#"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-8 h-8"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-300">Download on the</span>
                  <span className="text-lg font-semibold">App Store</span>
                </div>
              </motion.a>
            </div>
          </motion.div>

          {/* Right Side - Phone Mockup and QR Code */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative flex flex-col items-center justify-center"
          >
            {/* Phone Mockup */}
            <div className="relative mb-8">
              {/* Decorative Background Circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 rounded-full bg-[#009A98]/10 blur-3xl"></div>
              </div>

              {/* Phone Frame */}
              <div className="relative z-10 mx-auto w-64 h-[500px] bg-gray-800 rounded-[2.5rem] p-2 shadow-2xl">
                {/* Phone Screen */}
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                  {/* Status Bar */}
                  <div className="bg-[#009A98] text-white px-4 py-2 flex justify-between items-center text-xs font-semibold">
                    <span>9:41</span>
                    <div className="flex items-center gap-1">
                      <span className="font-bold">MEDI TIME</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-4 h-2 border border-white rounded-sm"></div>
                      <div className="w-1 h-1 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* App Content Preview */}
                  <div className="p-4 space-y-3 overflow-y-auto h-[calc(100%-3rem)]">
                    {/* Doctor Appointment */}
                    <div className="bg-gradient-to-r from-[#009A98] to-[#00B5B2] rounded-lg p-3 text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xs">ডাক্তার অ্যাপয়েন্টমেন্ট</h3>
                          <p className="text-[10px] opacity-90 truncate">Doctor Appointment</p>
                        </div>
                      </div>
                    </div>

                    {/* Hospital */}
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm-1 14H9v-2h2v-2h2v2h2v2h-2v2h-2v-2z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xs text-gray-800">হাসপাতাল</h3>
                          <p className="text-[10px] text-gray-600 truncate">Hospital</p>
                        </div>
                      </div>
                    </div>

                    {/* Video Consultation */}
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xs text-gray-800">ভিডিও কনসালটেশন</h3>
                          <p className="text-[10px] text-gray-600 truncate">Video Consultation</p>
                        </div>
                      </div>
                    </div>

                    {/* Health Tips */}
                    <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xs text-gray-800">হেলথ টিপস</h3>
                          <p className="text-[10px] text-gray-600 truncate">Health Tips</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Medicine */}
                    {/* <div className="bg-orange-50 rounded-lg p-3 border border-orange-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M4.22 11.29l1.06 1.06L7 10.59V20h2v-9.41l1.72 1.76 1.06-1.06L8 7.5l-3.78 3.79zM14.5 2H6v6h8.5V2zm-1 5H7V3h6.5v4zM20 8h-6v12h6V8zm-1 11h-4V9h4v10z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xs text-gray-800">ঔষধ অর্ডার</h3>
                          <p className="text-[10px] text-gray-600 truncate">Order Medicine</p>
                        </div>
                      </div>
                    </div> */}

                    {/* Diagnostic & Tests */}
                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xs text-gray-800">ডায়াগনস্টিক ও টেস্ট</h3>
                          <p className="text-[10px] text-gray-600 truncate">Diagnostic & Tests</p>
                        </div>
                      </div>
                    </div>

                    {/* Ambulance Service */}
                    <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xs text-gray-800">অ্যাম্বুলেন্স সেবা</h3>
                          <p className="text-[10px] text-gray-600 truncate">Ambulance Service</p>
                        </div>
                      </div>
                    </div>

                    {/* Healthcare Packages */}
                    <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-xs text-gray-800">স্বাস্থ্যসেবা প্যাকেজ</h3>
                          <p className="text-[10px] text-gray-600 truncate">Healthcare Packages</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-32 h-32 bg-white border-4 border-gray-900 rounded-lg flex items-center justify-center shadow-lg overflow-hidden">
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://meditime.com.bd" 
                  alt="Scan to download" 
                  className="w-full h-full object-contain" 
                />
              </div>
              <p
                className="text-sm font-semibold text-gray-700"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                QR কোড স্ক্যান করে ডাউনলোড করুন
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

