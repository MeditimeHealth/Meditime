"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

export default function BookAppointmentSection() {
  const { language } = useLanguage();
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const translations = {
    title: {
      en: "Book An Appointment",
      bn: "অ্যাপয়েন্টমেন্ট বুক করুন"
    },
    fullName: {
      en: "Full Name*",
      bn: "সম্পূর্ণ নাম*"
    },
    phoneNumber: {
      en: "Phone Number*",
      bn: "ফোন নম্বর*"
    },
    message: {
      en: "Message*",
      bn: "বার্তা*"
    },
    submit: {
      en: "Book Appointment",
      bn: "অ্যাপয়েন্টমেন্ট বুক করুন"
    },
    submitting: {
      en: "Submitting...",
      bn: "জমা দেওয়া হচ্ছে..."
    },
    success: {
      en: "✓ Your appointment request has been sent!",
      bn: "✓ আপনার অ্যাপয়েন্টমেন্ট অনুরোধ পাঠানো হয়েছে!"
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSuccess(true);
      setForm({ name: "", phone: "", message: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-[16px] sm:rounded-[24px] mx-auto max-w-[1760px] my-6 sm:my-12">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/slide.jpg')" }}
      />
      {/* Dark teal overlay — stronger on left, fades right */}
      <div className="absolute inset-0 bg-slate-900/40" />

      {/* Content */}
      <div className="relative z-10 py-10 sm:py-16 lg:py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full flex justify-center lg:justify-start lg:pl-[120px]"
        >
          {/* White card */}
          <div 
            className="rounded-[20px] sm:rounded-[32px] p-5 sm:p-8 lg:p-14 shadow-2xl w-full lg:w-[717px] lg:min-h-[594px] flex flex-col justify-center"
            style={{ background: "var(--color-white-solid, #FFFFFF)" }}
          >
            <h2 
              className="text-xl sm:text-3xl lg:text-[42px] font-bold text-slate-900 mb-6 sm:mb-10 text-center lg:text-left leading-tight"
            >
              {translations.title[language]}
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Full Name */}
              <input
                type="text"
                placeholder={translations.fullName[language]}
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-[#F5F8FA] text-slate-700 placeholder:text-slate-400 text-base px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all border-0"
                />

              {/* Phone Number */}
              <input
                type="tel"
                placeholder={translations.phoneNumber[language]}
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-[#F5F8FA] text-slate-700 placeholder:text-slate-400 text-base px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all border-0"
                />

              {/* Message */}
              <textarea
                placeholder={translations.message[language]}
                required
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-[#F5F8FA] text-slate-700 placeholder:text-slate-400 text-base px-6 py-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all border-0 resize-none"
                />

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold text-[15px] py-5 rounded-full transition-all shadow-lg hover:shadow-primary/30 disabled:opacity-60 mt-4 tracking-wide"
                >
                {loading ? translations.submitting[language] : translations.submit[language]}
              </button>

              {success && (
                <p 
                  className="text-center text-sm text-green-600 font-medium"
                    >
                  {translations.success[language]}
                </p>
              )}
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}