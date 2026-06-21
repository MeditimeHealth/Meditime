"use client";


import { Swiper, SwiperSlide } from "swiper/react";

import { Navigation, Autoplay, Pagination } from "swiper/modules";
import { Star, ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";
import { motion, useInView, animate, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

function Counter({ value, duration = 2 }: { value: string; duration?: number }) {
  const bnToEn = (str: string) => str.replace(/[০-৯]/g, d => "০১২৩৪৫৬৭৮৯".indexOf(d).toString());
  const enToBn = (str: string) => str.replace(/[0-9]/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

  const isBengali = /[০-৯]/.test(value);
  const normalizedValue = isBengali ? bnToEn(value) : value;

  const numericValue = parseFloat(normalizedValue.replace(/[^0-9.]/g, "")) || 0;
  const suffix = normalizedValue.replace(/[0-9.]/g, "");

  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    let numStr = "";
    if (numericValue % 1 === 0) {
      numStr = Math.floor(latest).toString();
    } else {
      numStr = latest.toFixed(1);
    }

    const result = numStr + suffix;
    return isBengali ? enToBn(result) : result;
  });

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      animate(count, numericValue, { duration });
    }
  }, [isInView, numericValue, count, duration]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function PatientReviewSection() {
  const { language } = useLanguage();
  const t = homepageTranslations[language].reviews;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  const formTranslations = {
    title: language === 'bn' ? "যোগাযোগ করুন" : "Get In Touch",
    subtitle: language === 'bn'
      ? "আপনার স্বাস্থ্য বিষয়ক যেকোনো জিজ্ঞাসা বা প্রয়োজনে সহায়তা করতে আমরা আপনার পাশে আছি।"
      : "We are here to assist you with any medical concerns.",
    name: language === 'bn' ? "আপনার নাম" : "Your Name",
    email: language === 'bn' ? "ইমেইল ঠিকানা" : "Email Address",
    phone: language === 'bn' ? "ফোন নম্বর" : "Phone Number",
    message: language === 'bn' ? "আপনার বার্তা" : "Your Message",
    subject: language === 'bn' ? "বিষয়" : "Subject",
    submit: language === 'bn' ? "সাবমিট" : "Submit",
    sending: language === 'bn' ? "পাঠানো হচ্ছে..." : "Sending...",
    success: language === 'bn' ? "আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে!" : "Your message has been sent successfully!",
    invalidPhone: language === 'bn' ? "ফোন নম্বর অবশ্যই ০৮৮০ বা ০১ দিয়ে শুরু হতে হবে এবং শুধু সংখ্যা থাকতে হবে" : "Phone number must start with 880 or 01 and contain only numbers",
    selectSubject: language === 'bn' ? "নির্বাচন করুন" : "Select Subject",
  };

  const SUBJECTS = [
    { en: "Doctor & Video Consultation", bn: "ডাক্তার বুকিং ও ভিডিও কল সংক্রান্ত" },
    { en: "Hospital & Test Booking", bn: "হাসপাতাল তথ্য ও ল্যাব টেস্ট সংক্রান্ত" },
    { en: "Ambulance Emergency", bn: "জরুরি অ্যাম্বুলেন্স সেবা" },
    { en: "Blood Donor Services", bn: "রক্তের জন্য অনুরোধ বা ডোনার হতে চাইলে" },
    { en: "Health Discount Card", bn: "ডিসকাউন্ট কার্ডের সুবিধা সংক্রান্ত" },
    { en: "Payment & Refund Issues", bn: "পেমেন্ট বা টাকা ফেরত সংক্রান্ত সমস্যা" },
    { en: "Partnership Inquiry", bn: "ডাক্তার বা প্রতিষ্ঠান হিসেবে যুক্ত হতে চাইলে" },
    { en: "Account & Profile Issues", bn: "লগইন বা প্রোফাইল আপডেট সংক্রান্ত সমস্যা" },
    { en: "Feedback & Complaints", bn: "সেবার মান নিয়ে অভিযোগ বা মতামত" },
    { en: "General Inquiry", bn: "অন্যান্য যেকোনো সাধারণ তথ্যের জন্য" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone inline
    const phoneRegex = /^01[3-9]\d{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      setPhoneError(language === 'bn' ? 'মোবাইল নম্বর অবশ্যই ১১ সংখ্যার হতে হবে এবং 01 দিয়ে শুরু হতে হবে' : 'Phone number must be exactly 11 digits starting with 01');
      return;
    }
    setPhoneError("");

    if (!formData.subject) {
      toast.error(language === 'bn' ? "দয়া করে একটি বিষয় নির্বাচন করুন" : "Please select a subject");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(formTranslations.success);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        toast.error(data.error || "Failed to send message");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full mx-auto min-h-[300px] pt-16 overflow-hidden flex items-center">

      <div className="absolute inset-0 bg-[var(--background-dark)]" />

      {/* Content */}
      <div className="relative z-10 w-full container mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="grid grid-cols-1 lg:grid-cols-13 gap-13 sm:gap-20 mb-12">
          <div className="lg:col-span-7">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-2 text-white">
                {language === 'bn' ? 'আমাদের সেবা নিয়ে রোগীদের মতামত' : 'What Our Patients Say About Us'}
              </h2>
              <section className="text-lg max-w-lg leading-relaxed mb-8 text-white/90 ">
                {language === 'bn' ? 'মেডিটাইম কীভাবে রোগীদের সঠিক বিশেষজ্ঞ ডাক্তারের সাথে যুক্ত হতে সাহায্য করে, তা নিজেই দেখে নিন।' : 'See how Meditime helps patients connect with the right specialists.'}
              </section>
            </div>

            {/* CAROUSEL SECTION (FULL WIDTH CONTROL) */}
            <div className="relative group px-4 md:px-0">
              <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                slidesPerView={1}
                spaceBetween={20}
                speed={800}
                centeredSlides={true}
                loop={true}

                autoplay={{ delay: 5000, disableOnInteraction: false }}

                // pagination={{
                //   el: ".review-pagination-custom",
                //   bulletClass: "review-bullet-custom",
                //   bulletActiveClass: "review-bullet-active-custom",
                // }}
                className=""
              >
                {[...t.items, ...t.items].map((review, idx) => (
                  <SwiperSlide key={idx} className="transition-all duration-500">
                    {({ isActive }) => (
                      <div className={`
                      relative p-8 sm:p-12 rounded-[40px] transition-all duration-700 h-full
                    `}>
                        <div className="flex flex-col h-full">
                          {/* Quote mark */}
                          <div className={`text-6xl font-serif text-white leading-none mb-4`}>"</div>

                          {/* Review text */}
                          <h1 className={`text-lg sm:text-xl text-white font-bold leading-relaxed mb-10 `}>
                            {review.text}
                          </h1>

                          <div className="mt-auto pt-8 border-t border-slate-100/10 flex items-center gap-20">
                            <div className={`w-16 h-16 rounded-full overflow-hidden `}>
                              {review.avatar ? (
                                <img src={review.avatar} alt={review.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                                  {review.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div>
                              <p className={` text-lg `}>{review.name}</p>
                              <p className={`font-bold text-lg `}>{review.prof}</p>
                              <p className={`text-sm`}>
                                <span className="font-semibold text-primary">{review.time}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div>
              <h2 className="text-3xl sm:text-4xl text-white font-bold mb-2">
                {formTranslations.title}
              </h2>
              <section className="text-lg max-w-lg leading-relaxed mb-8 text-white/90 ">
                {formTranslations.subtitle}
              </section>
            </div>

            <div className="flex flex-col justify-center py-4 px-4 sm:px-8 bg-white rounded-xl" >


              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">{formTranslations.name}</label>
                    <input
                      type="text"
                      required
                      className="w-full px-6 py-2 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#3DB5A0] focus:ring-4 focus:ring-[#3DB5A0]/10 transition-all outline-none"
                      placeholder="Karim Ahmed"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">{formTranslations.email}</label>
                    <input
                      type="email"
                      required
                      className="w-full px-6 py-2 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#3DB5A0] focus:ring-4 focus:ring-[#3DB5A0]/10 transition-all outline-none"
                      placeholder="example@mail.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">{formTranslations.phone}</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 flex items-center gap-1.5 text-gray-500 text-sm border-r pr-2 h-6 border-slate-300 pointer-events-none select-none">
                        <img src="https://flagcdn.com/w40/bd.png" alt="BD" className="w-6 h-4 rounded-sm object-cover" />
                        <span>+88</span>
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={11}
                        className={`w-full pl-[5rem] pr-4 py-2 rounded-2xl bg-slate-50 border focus:ring-4 focus:ring-[#3DB5A0]/10 transition-all outline-none ${
                          phoneError
                            ? 'border-red-400 bg-red-50'
                            : 'border-slate-200 focus:border-[#3DB5A0]'
                        }`}
                        placeholder="01XXXXXXXXX"
                        value={formData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                          setFormData({ ...formData, phone: val });
                          if (phoneError) setPhoneError("");
                        }}
                      />
                    </div>
                    {phoneError && (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    {phoneError}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 ml-1">11 digits (e.g. 01XXXXXXXXX)</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">{formTranslations.subject}</label>
                    <select
                      required
                      className="w-full px-6 py-2 rounded-2xl bg-slate-50 border border-slate-200 focus:border-[#3DB5A0] focus:ring-4 focus:ring-[#3DB5A0]/10 transition-all outline-none appearance-none"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    >
                      <option value="">{formTranslations.selectSubject}</option>
                      {SUBJECTS.map((sub, idx) => (
                        <option key={idx} value={sub.en}>
                          {language === 'bn' ? sub.bn : sub.en}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">{formTranslations.message}</label>
                  <textarea
                    rows={2}
                    required
                    className="w-full px-6 py-2  bg-slate-50 border border-slate-200 focus:border-[#3DB5A0] focus:ring-4 focus:ring-[#3DB5A0]/10 transition-all outline-none resize-none"
                    placeholder={language === 'bn' ? "আপনি কী জানতে চান?" : "How can we help you?"}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-fit flex items-center gap-2 btn-slide btn-primary"
                  >
                    {loading ? formTranslations.sending : formTranslations.submit}
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* Swiper bullet styles */}
      <style jsx global>{`
        .review-bullet-custom {
          display: inline-block;
          width: 40px;
          height: 8px;
          border-radius: 4px;
          background: rgba(255,255,255,0.2);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .review-bullet-active-custom {
          background: var(--primary);
          width: 80px;
          box-shadow: 0 0 20px rgba(1, 154, 152, 0.5);
        }
      `}</style>
    </div>
  );
}
