"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronRight, Phone, Plus, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

export default function FaqSection() {
  const { language } = useLanguage();
  const t = homepageTranslations[language].faq;
  const faqs = t.questions;

  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  return (
    <section className="w-full py-20 sm:py-32 bg-slate-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* LEFT: HEADER & CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-5 lg:sticky lg:top-32"
          >
          
            
            <h2 className="text-4xl sm:text-5xl lg:text-[64px] font-bold text-[#193252] leading-[1.1] mb-8 tracking-tight">
              {t.title}
            </h2>
            
            <section className="text-lg text-slate-500 leading-relaxed mb-10 max-w-lg">
              {t.subtitle} {language === 'bn' ? "আমরা আপনাকে সাহায্য করতে এখানে আছি।" : "We're here to help you navigate your healthcare journey."}
            </section>

            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-slate-100">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-slate-400 font-medium">{t.callUsPrefix}</p>
                  <p className="text-xl font-bold text-slate-900">{t.callUsNumber}</p>
                </div>
              </div>
              
              <div className="pt-4">
                <a
                  href="/contact"
                  className="btn-slide group/btn btn-primary  font-bold text-base py-4 px-10 shadow-lg transition-all inline-flex items-center gap-3 active:scale-95 overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-3">
                    {t.contactSupport}
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: ACCORDION */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`
                    group rounded-[32px] transition-all duration-500 border
                    ${isOpen ? 'bg-white border-primary shadow-[0_20px_50px_-20px_rgba(1,154,152,0.15)]' : 'bg-white/50 border-slate-200 hover:border-primary/40'}
                  `}
                >
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-center justify-between gap-6 px-8 py-8 text-left"
                  >
                    <span className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${isOpen ? 'text-primary' : 'text-slate-800'}`}>
                      {faq.question}
                    </span>

                    <span className={`
                      flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                      ${isOpen ? 'bg-primary text-white rotate-45' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}
                    `}>
                      <Plus className="w-6 h-6" />
                    </span>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-8">
                          <div className="w-full h-px bg-slate-100 mb-6" />
                          <section className="text-lg text-slate-500 leading-relaxed">
                            {faq.answer}
                          </section>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}