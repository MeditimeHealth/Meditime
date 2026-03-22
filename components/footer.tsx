"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Facebook, Instagram, Youtube, Linkedin, MessageCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

export default function Footer() {
  const { language } = useLanguage();
  const t = homepageTranslations[language].footer;
  const [email, setEmail] = useState("");

  const services = [
    { href: "/doctor",     label: t.links.doctor },
    { href: "/service",    label: t.links.video },
    { href: "/hospital",   label: t.links.hospital },
    { href: "/diagnostic", label: t.links.diagnostic },
    { href: "/ambulance",  label: t.links.ambulance },
  ];

  const resources = [
    { href: "/membership",        label: t.links.membership },
    { href: "/blog",              label: t.links.blog },
    { href: "/offer",             label: t.links.offer },
    { href: "/affiliate-program", label: t.links.affiliate },
    { href: "/blood-donor",       label: t.links.blood },
  ];

  const socialLinks = [
    { icon: MessageCircle, href: "https://wa.me/8801610385555",             label: "WhatsApp"  },
    { icon: Facebook,      href: "https://www.facebook.com/meditime.health", label: "Facebook"  },
    { icon: Instagram,     href: "#", label: "Instagram" },
    { icon: Linkedin,      href: "#", label: "LinkedIn"  },
    { icon: Youtube,       href: "#", label: "YouTube"   },
  ];

  // Figma exact values
  // bg: #111827  |  teal: #3DB5A0  |  divider: rgba(255,255,255,0.08)
  // body-text: #9CA3AF  |  input-bg: #1F2937

  return (
    <footer className="w-full" style={{ backgroundColor: "#111827", color: "#9CA3AF" }}>
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-14">

        {/* ── TOP ROW ─────────────────────────────────────────────────── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 items-center py-8 sm:py-12"
      
        >
          {/* Logo + tagline */}
          <div className="flex flex-col gap-2">
            <Image
              src="/logo.png"
              alt="Meditime"
              width={200}
              height={36}
              className="h-9 "
              style={{ filter: "brightness(10)" }}
            />
            <p className="text-sm" style={{ color: "#6B7280" }}>
              {t.tagline}
            </p>
          </div>

          {/* CTA */}
          <div>
            <h3
              className="text-lg sm:text-2xl leading-snug "
              style={{ color: "#FFFFFF" }}
            >
              {t.getStarted}
            </h3>
          </div>

          {/* Email pill */}
          <div
            className="flex items-center overflow-hidden"
            style={{
              backgroundColor: "white",
              borderRadius: "9999px",
              border: "1px solid rgba(255,255,255,0.08)",
              paddingRight: "4px",
            }}
          >
            <input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm px-5 py-3"
              style={{ color: "black" }}
            />
            <button
              className="shrink-0 text-sm font-semibold text-white px-5 py-2.5 rounded-full whitespace-nowrap"
              style={{ backgroundColor: "#3DB5A0", border: "none" }}
            >
              {t.sendEmail}
            </button>
          </div>
        </div>

        {/* ── 4-COLUMN BOTTOM SECTION ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 py-8 sm:py-12">

          {/* Get In Touch */}
          <div className="flex flex-col gap-5">
            <h4 className="text-base font-bold" style={{ color: "#FFFFFF" }}>
              {t.getInTouch}
            </h4>
            <div className="flex items-center gap-2.5">
              {socialLinks.map((s, i) => {
                const Icon = s.icon;
                return (
                  <a
                    key={i}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-110 bg-transparent border border-white/20 text-[#9CA3AF] hover:bg-[#3DB5A0] hover:border-[#3DB5A0] hover:text-white"
                  >
                    <Icon size={14} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4
              className="text-base font-bold mb-5"
              style={{ color: "#FFFFFF" }}
            >
              {t.services}
            </h4>
            <ul className="flex flex-col gap-3">
              {services.map((s, i) => (
                <li key={i}>
                  <Link
                    href={s.href}
                    className="text-sm transition-colors hover:text-[#3DB5A0]"
                    style={{ color: "#9CA3AF", textDecoration: "none" }}
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4
              className="text-base font-bold mb-5"
              style={{ color: "#FFFFFF" }}
            >
              {t.resources}
            </h4>
            <ul className="flex flex-col gap-3">
              {resources.map((r, i) => (
                <li key={i}>
                  <Link
                    href={r.href}
                    className="text-sm transition-colors hover:text-[#3DB5A0]"
                    style={{ color: "#9CA3AF", textDecoration: "none" }}
                  >
                    {r.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-base font-bold mb-5"
              style={{ color: "#FFFFFF" }}
            >
              {t.contact}
            </h4>
            <ul className="flex flex-col gap-2.5">
              <li
                className="text-sm font-semibold"
                style={{ color: "#FFFFFF" }}
              >
                Medi Time
              </li>
              <li className="text-sm" style={{ color: "#9CA3AF" }}>
                Health Care IT Services
              </li>
              <li className="text-sm" style={{ color: "#9CA3AF" }}>
                {t.addressLabel}
              </li>
              <li>
                <a
                  href="mailto:support@meditime.com.bd"
                  className="text-sm transition-colors hover:text-[#3DB5A0]"
                  style={{ color: "#9CA3AF", textDecoration: "none" }}
                >
                  support@meditime.com.bd
                </a>
              </li>
              <li>
                <a
                  href="tel:+8801610384444"
                  className="text-sm transition-colors hover:text-[#3DB5A0]"
                  style={{ color: "#9CA3AF", textDecoration: "none" }}
                >
                  +880- 1610 38 4444
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── COPYRIGHT BAR ────────────────────────────────────────────── */}
        <div
          className="flex flex-col md:flex-row items-center justify-between gap-3 py-6"
        >
          <p className="text-sm" style={{ color: "#6B7280" }}>
            {t.copyRight}
          </p>
          <div className="flex items-center gap-4 sm:gap-8 flex-wrap">
            {[
              { href: "/about",   label: t.aboutUs },
              { href: "/privacy", label: t.privacyPolicy },
              { href: "/terms",   label: t.termsConditions },
            ].map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="text-sm transition-colors hover:text-[#3DB5A0]"
                style={{ color: "#9CA3AF", textDecoration: "none" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}