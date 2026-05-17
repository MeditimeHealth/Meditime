"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function PageLoader() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{ backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", backgroundColor: "rgba(255,255,255,0.7)" }}
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative mb-6"
        >
          <Image
            src="/logo.png"
            alt="Meditime"
            width={120}
            height={120}
            className="object-contain drop-shadow-lg"
            priority
          />
        </motion.div>

        {/* Spinner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-[3px] border-primary/20 border-t-primary"
        />

        {/* Subtle loading text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-sm font-medium text-gray-500 tracking-wide"
        >
          লোড হচ্ছে...
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}
