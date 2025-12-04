"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="min-h-[80vh] flex items-center justify-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-6"
          >
            <AlertCircle className="w-24 h-24 text-orange-500 mx-auto" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            You have cancelled the payment process
          </p>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
            <p className="text-gray-700 mb-4">
              Your membership application has not been completed. No charges were made to your account.
            </p>
            <p className="text-gray-700">
              If you experienced any issues or have concerns, please feel free to contact our support team. We're here to help!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/membership">
              <button className="bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Try Again
              </button>
            </Link>
            <Link href="/">
              <button className="bg-white text-primary border-2 border-primary font-bold py-3 px-8 rounded-lg hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2">
                Go to Homepage
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Need help? <Link href="/contact" className="text-primary hover:underline font-semibold">Contact our support team</Link>
          </p>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
