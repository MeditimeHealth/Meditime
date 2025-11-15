"use client";

import { motion } from "framer-motion";
import { Smartphone, QrCode } from "lucide-react";

export default function AppDownloadSection() {
  return (
    <div className="w-full py-16 bg-gradient-to-br from-[#009A98]/5 via-white to-[#00B5B2]/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text and Download Buttons */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4"
                style={{
                  color: "#009A98",
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                আমাদের অ্যাপ ডাউনলোড করুন
              </h2>
              <p
                className="text-lg md:text-xl text-gray-800 mb-2 font-semibold"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                বিনামূল্যে আমাদের অ্যাপ ডাউনলোড করুন এবং নিবন্ধন করুন এবং বিশেষ স্বাস্থ্যসেবা সুবিধা পান।
              </p>
              <p
                className="text-base md:text-lg text-gray-600"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                আপনার মোবাইলে অ্যাপ ডাউনলোড করতে, Play Store এ যান বা QR কোড স্ক্যান করুন।
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
                  <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-3rem)]">
                    {/* Video Consultation */}
                    <div className="bg-gradient-to-r from-[#009A98] to-[#00B5B2] rounded-lg p-4 text-white">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                          <Smartphone className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">ভিডিও কনসালটেশন</h3>
                          <p className="text-xs opacity-90">Video Consultation</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Medicine */}
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <div className="w-8 h-8 bg-blue-200 rounded flex items-center justify-center">
                            <div className="w-4 h-4 bg-blue-400 rounded"></div>
                          </div>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-gray-800">ঔষধ অর্ডার করুন</h3>
                          <p className="text-xs text-gray-600">Order Medicine</p>
                        </div>
                      </div>
                    </div>

                    {/* Diagnostic & Tests */}
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-green-400 rounded"></div>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-gray-800">ডায়াগনস্টিক ও টেস্ট</h3>
                          <p className="text-xs text-gray-600">Diagnostic & Tests</p>
                        </div>
                      </div>
                    </div>

                    {/* Healthcare Packages */}
                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <div className="w-6 h-6 bg-purple-300 rounded"></div>
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-gray-800">স্বাস্থ্যসেবা প্যাকেজ</h3>
                          <p className="text-xs text-gray-600">Healthcare Packages</p>
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
              <div className="w-32 h-32 bg-white border-4 border-gray-900 rounded-lg flex items-center justify-center shadow-lg">
                {/* QR Code Placeholder - Replace with actual QR code image */}
                <QrCode className="w-24 h-24 text-gray-900" strokeWidth={1.5} />
                {/* You can replace the above with: <img src="/qr-code.png" alt="QR Code" className="w-full h-full object-contain" /> */}
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

