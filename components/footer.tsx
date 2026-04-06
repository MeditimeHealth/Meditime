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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center py-8 sm:py-12 border-b border-white/5">
          {/* Tagline / Get Started */}
          <div>
            <h3 className="text-xl sm:text-3xl font-bold text-white leading-tight">
              {t.getStarted}
            </h3>
          </div>

          {/* Email pill */}
          <div
            className="flex items-center bg-white rounded-full border border-white/10 p-1 w-full max-w-md lg:ml-auto"
          >
            <input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm px-5 py-2.5 text-slate-900"
            />
            <button
              className="shrink-0 bg-[#3DB5A0] hover:bg-[#34a38f] text-sm font-bold text-white px-6 py-2.5 rounded-full transition-all"
            >
              {t.sendEmail}
            </button>
          </div>
        </div>

        {/* ── 4-COLUMN BOTTOM SECTION ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-12">
          
          {/* Column 1: Logo, Slogan, Get In Touch, Social Icons */}
          <div className="flex flex-col gap-6">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Meditime"
                width={180}
                height={32}
                className="h-8 w-auto object-contain brightness-0 invert"
              />
            </Link>
            
            <p className="text-sm leading-relaxed text-slate-400">
              {t.slogan}
            </p>

            <div className="flex flex-col gap-4">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                {t.getInTouch}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t.tagline}
              </p>
              <div className="flex items-center gap-3">
                {socialLinks.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="w-9 h-9 rounded-full flex items-center justify-center border border-white/10 text-slate-400 hover:bg-[#3DB5A0] hover:border-[#3DB5A0] hover:text-white transition-all"
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
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