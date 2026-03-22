"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

export default function FaqSection() {
  const { language } = useLanguage();
  const t = homepageTranslations[language].faq;
  const faqs = t.questions;

  // Track which FAQ index is currently open (-1 means all closed)
  const [openIndex, setOpenIndex] = useState<number>(-1);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    /* ── Section wrapper: dark background to match the design ── */
    <section className="w-full py-16 sm:py-20 lg:py-24" style={{ backgroundColor: "#111827" }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 sm:mb-14"
        >
          {/* Title in teal — matches the screenshot typography */}
          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4 sm:mb-5 leading-tight"
            style={{ color: "#14b8a6" }}
          >
            {t.title}
          </h2>
          {/* Subtitle in muted white */}
          <p className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto" style={{ color: "#94a3b8" }}>
            {t.subtitle}{" "}
            <a
              href="tel:+8801610385555"
              className="font-semibold underline underline-offset-2 transition-opacity hover:opacity-80"
              style={{ color: "#14b8a6" }}
            >
              {t.callUsPrefix} {t.callUsNumber}
            </a>
            .
          </p>
        </motion.div>

        {/* ── Accordion List ── */}
        <div className="flex flex-col gap-3 sm:gap-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
              >
                {/* Card: slightly lighter dark with teal border on open */}
                <div
                  className="rounded-xl overflow-hidden transition-all duration-300"
                  style={{
                    backgroundColor: "#1e2d3d",
                    border: `1px solid ${isOpen ? "#14b8a6" : "#2d3f52"}`,
                  }}
                >
                  {/* ── Question Row (clickable) ── */}
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between gap-4 px-5 sm:px-7 py-5 sm:py-6 text-left group"
                    aria-expanded={isOpen}
                  >
                    {/* Question text in teal */}
                    <span
                      className="text-sm sm:text-base font-semibold leading-snug flex-1 transition-colors duration-200"
                      style={{ color: isOpen ? "#2dd4bf" : "#14b8a6" }}
                    >
                      {faq.question}
                    </span>

                    {/* Toggle button: teal box with +/× icon */}
                    <span
                      className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                      style={{
                        backgroundColor: isOpen ? "#0d9488" : "rgba(20,184,166,0.15)",
                        border: "1px solid #14b8a6",
                      }}
                    >
                      {isOpen ? (
                        <X className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#ffffff" }} />
                      ) : (
                        <Plus className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#14b8a6" }} />
                      )}
                    </span>
                  </button>

                  {/* ── Answer: animated expand/collapse ── */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        {/* Divider line */}
                        <div
                          className="mx-5 sm:mx-7"
                          style={{ height: "1px", backgroundColor: "#2d3f52" }}
                        />
                        <p
                          className="px-5 sm:px-7 pt-4 pb-5 sm:pb-6 text-sm sm:text-base leading-relaxed"
                          style={{ color: "#94a3b8" }}
                        >
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 sm:mt-14 text-center"
        >
          <p className="text-sm sm:text-base mb-4" style={{ color: "#64748b" }}>
            {t.noAnswerFound}
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm sm:text-base font-semibold transition-all duration-200 hover:opacity-90 hover:scale-105"
            style={{
              backgroundColor: "#0d9488",
              color: "#ffffff",
            }}
          >
            {t.contactSupport}
          </a>
        </motion.div>

      </div>
    </section>
  );
}