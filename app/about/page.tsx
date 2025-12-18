"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { motion } from "framer-motion";
import { Info, Target, Eye, Stethoscope, FlaskConical, Building2, CreditCard, Car, Droplet } from "lucide-react";

export default function AboutPage() {
  const services = [
    { icon: Stethoscope, name: "Doctors Appointment" },
    { icon: FlaskConical, name: "Diagnostic test information" },
    { icon: Building2, name: "Hospital Information" },
    { icon: CreditCard, name: "Privilege membership cards" },
    { icon: Car, name: "Ambulance Service" },
    { icon: Droplet, name: "Blood donor directory" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative mt-20 h-[300px] md:h-[350px] w-full overflow-hidden"
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
                About Meditime
              </h1>
              <p className="text-xl text-white/90 drop-shadow-lg">
                Your trusted health information and service platform
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
          <h2 className="text-3xl font-bold text-[#009A98] mb-6">About Meditime</h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Meditime is a health information and service platform based in Savar, Dhaka, which is operated by Meditime Limited. This platform is used by patients, doctors, hospitals, and clinics. This platform is closely related to medicarebd.net by the origin of founders and key professionals and enables its users to book online doctor appointments, book doctor appointments online for in-person visits, to see and compare the pricing of diagnostic tests in 40+ different hospitals.
            </p>
            <p>
              Earlier in 2015, founder Shamim Sheshir was moved by a reality that while many similar platforms are serving in Bangladesh, the majority of them have prioritised their services within the Dhaka metro area, leaving a vast population of surrounding areas like Gazipur, Savar, Ashulia, and Kaliyakoir deprived of access to minimal medical service information about doctors practicing in such localities and nearby hospitals.
            </p>
            <p>
              He found the core challenge in focusing on a specific demographic was the limited number of users and a great chance of remaining not profitable. Still, with a great spirit of serving and empathy for patients, he looked ahead and took his entrepreneurial dream one step further by starting his first health information and service website, medicarebd.net, and a free app available on the Google Play Store with the same name.
            </p>
            <p>
              His 5+ years of effort connecting patients with the best doctors near them became irresistibly successful, with thousands of downloads of the app and visitors to the website. Today, medicare and meditime have become the first choice for users in Savar and nearby areas to find medical information like doctor names, doctors from different hospitals and departments, hospital locations, and doctor lists of the same, making the platform an area-specific platform with a goal of gradually increasing its reach to the entire Bangladesh, helping millions of patients with more accessible and affordable healthcare services.
            </p>
            <p>
              Using the Meditime app, you can book doctors from any corner of Bangladesh, bringing this broader approach into action for a broader audience across the country.
            </p>
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
            <h2 className="text-3xl font-bold text-[#009A98]">Mission of Meditime</h2>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Connecting Patients with Affordable Medical Services through Updated Information
          </h3>
          <p className="text-gray-700 leading-relaxed">
            The most important characteristics of information is its freshness and real life connectivity. With a mission to ensure smoothest accessibility to latest medical information for its users, Meditime team is relentlessly working on keeping the information provided on the website and application always easily understandable, verified, and freshly updated.
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
            <h2 className="text-3xl font-bold text-[#009A98]">Vision of Meditime</h2>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Making a Real Quick Book for Its Users
          </h3>
          <p className="text-gray-700 leading-relaxed">
            With a mission to serve its users with updated medical information, the core goal of Meditime is bringing millions of users under one platform that will help them with better accessibility to standard medical services at a fraction of the cost. Our goal is seeing happy patients recovering from their sickness and suffering. Our goal is to help a person with limited accessibility to medical services and make the entire system work for him or her and their wellness.
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
          <h2 className="text-3xl font-bold text-[#009A98] mb-8">Our Services</h2>
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
          <h2 className="text-3xl font-bold text-[#009A98] mb-6">Trade License</h2>
          <div className="bg-gray-50 rounded-xl p-6">
            <p className="text-gray-700">
              <strong>Registered Address:</strong><br />
              Savar, Dhaka, Bangladesh
            </p>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
