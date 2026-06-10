"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative  h-[300px] md:h-[350px] w-full overflow-hidden"
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
          <div className="max-w-7xl mx-auto text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                Terms and Conditions
              </h1>
              <p className="text-xl text-white/90 drop-shadow-lg">
                of Meditime Limited
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
            The terms and conditions mentioned hereby will be applicable for the Meditime Website (meditime.com.bd) and the Meditime App (Meditime Mobile App on Google Play Store). Meditime reserves the right to change and edit these conditions without any prior notice. All users are requested to read the page carefully to understand the terms and conditions of Meditime on their own responsibility.
          </p>

          {/* Who Can Use */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#009A98] mb-4">Who Can Use a Meditime Website and Application?</h2>
            <p className="text-gray-700">
              Legal-age citizens of the People&apos;s Republic of Bangladesh. The user must be 18+ years old and mentally stable to use the website and application.
            </p>
          </section>

          {/* Use of Meditime Website */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#009A98] mb-4">Use of Meditime Website</h2>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>The user must sign up to avail the services with a valid phone number issued by government registered mobile network operators.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>The user must agree with the terms and conditions mentioned on this page, and by agreeing to this page, the user agrees to potential changes in the terms and conditions in the future by default.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>The user must pay the advance payments in services applicable. (Online Doctor Consultation aka Video Call With Doctor)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>The information available on the website is collected from different sources and self-published by users such as doctors, blood donors, and ambulance drivers, and is not subject to verification by Meditime or any other entity related to the organization. Meditime shall not bear any responsibility for any misleading information provided by any user.</span>
              </li>
            </ul>
          </section>

          {/* Financial Credentials */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#009A98] mb-4">Meditime Never Asks for Your Financial Credentials</h2>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></span>
                <span>Meditime will not ask for the password of your mobile banking app or channels, your bank account password.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>Meditime may collect information about your mobile banking channels and associated numbers to disburse the affiliate commissions earned.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>Meditime can hold your affiliate commissions in case of any violation of the Bangladesh Telecommunication Act, 2001.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>Meditime shall not bear any responsibility for such information you have shared with anyone in the name of Meditime or any other entity.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>Meditime payment system will run through declared systems and workflow; discrepancies are a subject of fraudulent activity, and Meditime shall not bear the responsibilities.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>Meditime has its emergency contact mentioned on the contact page; any other phone or mobile number(s) shall not be used to communicate with Meditime.</span>
              </li>
            </ul>
          </section>

          {/* Right to Cancel */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-[#009A98] mb-4">Meditime Reserves the Right to Reverse or Cancel Any Service Prior Notice</h2>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>Meditime can cancel any service booked through Meditime platforms (Website and Mobile Application) with 24 hours prior notice.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>Meditime can close your user account (as patient, doctor, ambulance service provider, or blood donor) based on any discrepancies found in the shared information.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                <span>Meditime can take legal steps against any organization or individual for fraudulent or misleading information shared on this platform without any prior notice to the associated user account.</span>
              </li>
            </ul>
          </section>

          {/* Contact */}
          <section className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6">
            <p className="text-gray-700">
              For any further questions or queries regarding the terms and conditions of Meditime, feel free to visit our <a href="/contact" className="text-primary font-semibold hover:underline">contact page</a>.
            </p>
          </section>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
