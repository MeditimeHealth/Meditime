"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Facebook, Instagram, Youtube, Linkedin, MessageCircle } from "lucide-react";

export default function Footer() {
  const [email, setEmail] = useState("");

  const services = [
    { href: "/doctor",     label: "Doctor Appointment" },
    { href: "/service",    label: "Video Consultation" },
    { href: "/hospital",   label: "Hospital List" },
    { href: "/diagnostic", label: "Diagnostic Test" },
    { href: "/ambulance",  label: "Ambulance Directory" },
  ];

  const resources = [
    { href: "/membership",        label: "Discount Cards" },
    { href: "/blog",              label: "Health Tips" },
    { href: "/offer",             label: "Offer" },
    { href: "/affiliate-program", label: "Affiliate Programme" },
    { href: "/blood-donors",      label: "Blood Donors" },
  ];

  const socialLinks = [
    { icon: MessageCircle, href: "https://wa.me/8801610385555",             label: "WhatsApp",  active: false },
    { icon: Facebook,      href: "https://www.facebook.com/meditime.health", label: "Facebook",  active: true  },
    { icon: Instagram,     href: "#", label: "Instagram", active: false },
    { icon: Linkedin,      href: "#", label: "LinkedIn",  active: false },
    { icon: Youtube,       href: "#", label: "YouTube",   active: false },
  ];

  // Figma exact values
  // bg: #111827  |  teal: #3DB5A0  |  divider: rgba(255,255,255,0.08)
  // body-text: #9CA3AF  |  input-bg: #1F2937

  return (
    <footer className="w-full" style={{ backgroundColor: "#111827", color: "#9CA3AF" }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-14">

        {/* ── TOP ROW ─────────────────────────────────────────────────── */}
        <div
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-center py-12"
      
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
              Meditime- Right Care On Time
            </p>
          </div>

          {/* CTA */}
          <div>
            <h3
              className="text-2xl leading-snug "
              style={{ color: "#FFFFFF" }}
            >
              Get Started &amp; Book Your<br />Appointment
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
              placeholder="Enter E- Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm px-5 py-3"
              style={{ color: "black" }}
            />
            <button
              className="shrink-0 text-sm font-semibold text-white px-5 py-2.5 rounded-full whitespace-nowrap"
              style={{ backgroundColor: "#3DB5A0", border: "none" }}
            >
              Send Email
            </button>
          </div>
        </div>

        {/* ── 4-COLUMN BOTTOM SECTION ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 py-12">

          {/* Get In Touch */}
          <div className="flex flex-col gap-5">
            <h4 className="text-base font-bold" style={{ color: "#FFFFFF" }}>
              Get In Touch
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
                    className="flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      border: s.active
                        ? "1px solid #3DB5A0"
                        : "1px solid rgba(255,255,255,0.2)",
                      backgroundColor: s.active ? "#3DB5A0" : "transparent",
                      color: s.active ? "#FFFFFF" : "#9CA3AF",
                      textDecoration: "none",
                      flexShrink: 0,
                    }}
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
              Services
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
              Resources
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
              Contact
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
                Address: Domna, Savar, Dhaka 1349
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
            © 2026 All Rights Reserved By Meditime.
          </p>
          <div className="flex items-center gap-8">
            {[
              { href: "/about",   label: "About Us" },
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms",   label: "Terms and Conditions" },
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