"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

export default function MembershipSection() {
  const [playing, setPlaying] = useState(false);
  const { language } = useLanguage();
  const t = homepageTranslations[language].membership;

  return (
    <div className="w-full py-10 sm:py-16 bg-[#F5F6F8]">
      <div className="max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-[16px] shadow-sm overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 p-4 sm:p-6 gap-[10px]">

            {/* LEFT — Video/Image with play button overlay */}
            <div className="relative h-52 sm:h-80 lg:h-[544px] rounded-[12px] sm:rounded-[16px] overflow-hidden order-2 lg:order-1">
              {!playing ? (
                <>
                  {/* Thumbnail image */}
                  <img
                    src="https://img.youtube.com/vi/45XDv8gH5x4/maxresdefault.jpg"
                    alt="Meditime Health Discount Card"
                    onError={(e) => {
                      // fallback to a solid bg if image missing
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Fallback bg color in case image is missing */}
                  <div className="absolute inset-0 bg-sky-200 -z-10" />

                  {/* Play button */}
                  <button
                    onClick={() => setPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center group"
                    aria-label="Play video"
                  >
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:bg-white group-hover:scale-110 transition-all duration-200">
                      {/* Triangle play icon */}
                      <svg className="w-5 h-5 text-slate-800 ml-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </button>
                </>
              ) : (
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/45XDv8gH5x4?autoplay=1&rel=0&modestbranding=1"
                  title="Meditime Health Discount Cards"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* RIGHT — Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="p-4 sm:p-8 lg:pl-16 lg:pr-12 flex flex-col justify-center items-center lg:items-start text-center lg:text-left order-1 lg:order-2"
            >
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-bold text-slate-900 leading-tight mb-3 sm:mb-5">
                {t.title}
              </h2>

              <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-6 sm:mb-10">
                {t.desc}
              </p>

              <Link href="/membership" className="w-fit mx-auto lg:mx-0">
                <button className="bg-primary hover:bg-primary/90 text-white font-semibold text-sm py-3 px-7 rounded-full shadow-sm transition-all inline-flex items-center gap-2">
                  {t.availBtn}
                </button>
              </Link>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
}