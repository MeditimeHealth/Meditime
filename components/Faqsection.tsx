"use client";

import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How do I book a doctor appointment on Meditime?",
    answer:
      "Search for your preferred doctor or department using the search bar. Select your doctor, choose an available time slot, and confirm with your phone number. You'll receive a confirmation SMS instantly.",
  },
  {
    question: "What is the Meditime Health Discount Card?",
    answer:
      "The Meditime Health Discount Card gives you instant discounts on 100+ medical services across 40+ partner hospitals near Savar. It covers you, your spouse, and up to 2 children.",
  },
  {
    question: "Is the appointment booking service free?",
    answer:
      "Yes, booking through Meditime is completely free. You only pay the doctor's consultation fee at the chamber — no extra platform charges are added.",
  },
  {
    question: "How can I compare diagnostic test prices?",
    answer:
      "Go to the Diagnostic section and search for your required test. Meditime shows real-time pricing from multiple labs so you can choose the most affordable option near you.",
  },
  {
    question: "Does Meditime support video consultation?",
    answer:
      "Yes. Select a doctor offering video consultation, book a slot, and join the call at your scheduled time from any device. Ideal for follow-ups and non-emergency queries.",
  },
  {
    question: "How do I contact an ambulance through Meditime?",
    answer:
      "Open the Ambulance section on the website or app. You'll find a directory of ambulance services with direct contact numbers to call or request through the platform.",
  },
];

export default function FaqSection() {
  return (
    <div className="w-full py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-lg">
            Got questions? We've got answers. Can't find what you're looking for?
            Call us at{" "}
            <a href="tel:+8801610385555" className="text-primary font-medium">
              +880 1610 38 5555
            </a>
            .
          </p>
        </motion.div>

        {/* ── FAQ Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-200 group"
            >
              {/* Icon + Question */}
              <div className="flex items-start gap-4 mb-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform duration-200">
                  <HelpCircle className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-800 leading-snug pt-1.5">
                  {faq.question}
                </h3>
              </div>

              {/* Answer */}
              <p className="text-sm text-slate-500 leading-relaxed pl-[52px]">
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}