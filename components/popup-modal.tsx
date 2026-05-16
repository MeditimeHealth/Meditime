"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

import { useLanguage } from "@/contexts/LanguageContext";
import { usePathname } from "next/navigation";

interface PopupData {
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  imageUrl: string;
  buttonText: string;
  buttonTextBn: string;
  buttonLink: string;
  isActive: boolean;
}

export default function PopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [popupData, setPopupData] = useState<PopupData | null>(null);
  const pathname = usePathname();
  const { language } = useLanguage();

  useEffect(() => {
    // Only show popup on the home page
    if (pathname !== "/") return;

    // Only show once per browser session
    const hasSeen = sessionStorage.getItem("hasSeenPopup");
    if (hasSeen) return;

    const fetchPopup = async () => {
      try {
        const response = await fetch("/api/popup");
        const data = await response.json();

        if (data.success && data.popup && data.popup.isActive) {
          setPopupData(data.popup);
          setTimeout(() => setIsOpen(true), 1500);
        }
      } catch (error) {
        console.error("Error fetching popup:", error);
      }
    };

    fetchPopup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // empty array: runs once on mount only, not on every route change

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("hasSeenPopup", "true");
  };

  if (!popupData) return null;

  const currentTitle = language === 'bn' ? (popupData.titleBn || popupData.title) : popupData.title;
  const currentDesc = language === 'bn' ? (popupData.descriptionBn || popupData.description) : popupData.description;
  const currentBtnText = language === 'bn' ? (popupData.buttonTextBn || popupData.buttonText) : popupData.buttonText;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-6 right-6 z-20 p-2 bg-white/20 backdrop-blur-md hover:bg-white text-slate-800 rounded-full transition-all shadow-lg border border-white/30"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Section */}
            <div className="w-full md:w-5/12 relative min-h-[250px] md:min-h-[450px]">
              <Image
                src={popupData.imageUrl}
                alt={currentTitle}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Content Section */}
            <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center bg-white">
              <div className="mb-2">
                <span className="text-[#3DB5A0] font-bold text-xs uppercase tracking-[0.2em]">Latest Update</span>
              </div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight"
              >
                {currentTitle}
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-slate-500 mb-10 text-lg leading-relaxed"
              >
                {currentDesc}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link href={popupData.buttonLink} onClick={handleClose} className="inline-block w-full sm:w-auto">
                  <button 
                    className="bg-[#3DB5A0] hover:bg-[#34a38f] text-white rounded-2xl px-10 h-14 text-base font-bold transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-3 w-full"
                  >
                    {currentBtnText}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}