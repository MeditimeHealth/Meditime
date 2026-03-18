"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PopupData {
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  isActive: boolean;
}

import { usePathname } from "next/navigation";

export default function PopupModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [popupData, setPopupData] = useState<PopupData | null>(null);
  const pathname = usePathname();

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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full transition-colors shadow-sm"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Image Section */}
            <div className="w-full md:w-1/2 relative min-h-[250px] md:min-h-[400px]">
              <Image
                src={popupData.imageUrl}
                alt={popupData.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Content Section */}
            <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white">
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight"
              >
                {popupData.title}
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-gray-600 mb-8 text-lg leading-relaxed"
              >
                {popupData.description}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link href={popupData.buttonLink} onClick={handleClose}>
                  <Button 
                    size="lg"
                    className="bg-[#9c1c6b] hover:bg-[#85165a] text-white rounded-md px-8 h-12 text-base font-semibold transition-all shadow-lg hover:shadow-xl w-full sm:w-auto"
                  >
                    {popupData.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}