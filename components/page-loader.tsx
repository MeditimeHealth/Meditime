"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mosaic } from "react-loading-indicators";

export default function PageLoader() {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          backgroundColor: "rgba(255,255,255,0.7)",
        }}
      >
        <Mosaic
          color="#017991"
          size="small"
          text=""
          textColor=""
        />
      </motion.div>
    </AnimatePresence>
  );
}