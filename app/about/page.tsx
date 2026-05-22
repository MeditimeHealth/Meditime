"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { Info, Target, Eye, Stethoscope, FlaskConical, Building2, CreditCard, Car, Droplet } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";

export default function AboutPage() {
  const { language } = useLanguage() as { language: 'en' | 'bn' };
  const t = homepageTranslations[language].aboutPage;

  const services = [
    { icon: Stethoscope, name: t.services.doctor },
    { icon: FlaskConical, name: t.services.diagnostic },
    { icon: Building2, name: t.services.hospital },
    { icon: CreditCard, name: t.services.membership },
    { icon: Car, name: t.services.ambulance },
    { icon: Droplet, name: t.services.blood },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative  h-[300px] md:h-[350px] w-full overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/50 to-primary-dark/60 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=1920&q=80')",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="relative z-20 h-full flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Info className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                {t.heroTitle}
              </h1>
              <p className="text-xl text-white/90 drop-shadow-lg">
                {t.heroSubtitle}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8"
        >
          <h2 className="text-3xl font-bold text-[#009A98] mb-6">{t.aboutTitle}</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>{t.aboutContent1}</p>
            <p>{t.aboutContent2}</p>
            <p>{t.aboutContent3}</p>
            <p>{t.aboutContent4}</p>
            <p>{t.aboutContent5}</p>
          </div>
        </motion.div>

        {/* Mission Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl shadow-lg p-8 md:p-12 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center">
              <Target className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-3xl font-bold text-[#009A98]">{t.missionTitle}</h2>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {t.missionSubtitle}
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {t.missionContent}
          </p>
        </motion.div>

        {/* Vision Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg p-8 md:p-12 mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
              <Eye className="h-7 w-7 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold text-[#009A98]">{t.visionTitle}</h2>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            {t.visionSubtitle}
          </h3>
          <p className="text-gray-700 leading-relaxed">
            {t.visionContent}
          </p>
        </motion.div>

        {/* Services Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-8"
        >
          <h2 className="text-3xl font-bold text-[#009A98] mb-8">{t.servicesTitle}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((service, index) => {
              const IconComponent = service.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex flex-col items-center text-center p-4 rounded-xl bg-gray-50 hover:bg-primary/5 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                    <IconComponent className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{service.name}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Trade License Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
        >
          <h2 className="text-3xl font-bold text-[#009A98] mb-6">{t.tradeLicenseTitle}</h2>
          <div className="bg-gray-50 rounded-xl p-6">
            <p className="text-gray-700">
              <strong>{t.registeredAddress}:</strong><br />
              {t.addressValue}
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
