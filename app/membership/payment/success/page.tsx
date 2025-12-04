"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("tran_id") || "";

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
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>

          <p className="text-xl text-gray-600 mb-6">
            Thank you for purchasing a membership card with Meditime
          </p>

          {transactionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500">Transaction ID</p>
              <p className="text-lg font-mono font-semibold text-gray-900">
                {transactionId}
              </p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-lg text-gray-900 mb-2">
              What happens next?
            </h3>
            <ul className="text-left space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Your membership card will be processed within 2-3 business days
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                You will receive a confirmation call from our team
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Your card will be delivered to your registered address within 5-7 business days
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Track your order status by contacting our support team
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <button className="bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2">
                Go to Homepage
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link href="/contact">
              <button className="bg-white text-primary border-2 border-primary font-bold py-3 px-8 rounded-lg hover:bg-primary hover:text-white transition-all duration-300">
                Contact Support
              </button>
            </Link>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
