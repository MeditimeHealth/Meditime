"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative mt-20 h-[300px] md:h-[350px] w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/50 to-primary-dark/60 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1920&q=80')",
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
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                Privacy Policy
              </h1>
              <p className="text-xl text-white/90 drop-shadow-lg">
                of Meditime
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
        >
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            Meditime is committed to keeping shared data safe, secure, and protected from misuse. As a medical information service and an online medical service booking platform, we collect the following information from our users.
          </p>

          {/* Information We Collect */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#009A98] mb-4">Information We Collect</h2>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>Email address and phone number to sign up for the application named Meditime Mobile App (official Google Play name) and for the website namely &quot;meditime.com.bd&quot; as a patient, doctor, or affiliate.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>Mobile number for booking doctor appointments.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>Payment method information for processing requests for Meditime Membership Cards.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>Our system tracks data about the services you book, use, or purchase through the Meditime website (meditime.com.bd) and Meditime app to enhance user experience and understand customer behavior across our communication channels.</span>
              </li>
            </ul>
          </section>

          {/* How We Use Your Data */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#009A98] mb-4">How We Use Your Data</h2>
            <p className="text-gray-700 mb-4 italic">
              These use cases apply to Meditime (website), Meditime App, and any other authorized third party licensed by Meditime.
            </p>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>We use your mobile contact number to refer, recall, and communicate with you based on the situation and necessity.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>We do not explicitly share or sell your phone number or any personal information such as your name, patient name, medical issues, selected treatment departments, doctor names, or diagnostic test names with any third-party organization through any communication medium, including social media.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>We store personal information, including mobile number, email address, and password used to sign up and log in to the application, for sales, marketing, and public relations purposes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>We do not sell or voluntarily share any of this information with any organization. Your data is not connected to any monetary service, is not used as a direct source of income, and is not treated as a product of Meditime.</span>
              </li>
            </ul>
          </section>

          {/* Precautions */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#009A98] mb-4">Precautions</h2>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></span>
                <span>Meditime will never ask for your payment method credentials, such as bKash passwords or bank account details including account number, password, or account name.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></span>
                <span>Meditime has no direct access to your financial information used when paying medical bills through the platform.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></span>
                <span>Meditime will never ask for advance payment for any medical services except for the service called &quot;Online Consultation with Doctor.&quot;</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></span>
                <span>We do not force users to purchase our services, nor do we use fabricated or misleading information such as incorrect years of experience, workplace, or designation of doctors to manipulate user behavior.</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6">
            <p className="text-gray-700 mb-4">
              For any kind of query, question, or suggestions please feel free to visit the <a href="/contact" className="text-primary font-semibold hover:underline">contact page</a> of Meditime.
            </p>
            <p className="text-gray-700 font-semibold">
              Team Meditime.
            </p>
          </section>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
