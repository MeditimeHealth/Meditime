"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  Users,
  ArrowRight
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
// Import the form components
import AffiliateSignupForm from "@/components/affiliate-signup-form";
import AffiliateSigninForm from "@/components/affiliate-signin-form";
export default function AffiliateProgramPage() {
  const [showSignup, setShowSignup] = useState(false);

  const features = [
    {
      icon: CheckCircle,
      title: "Scannable",
      description:
        "আমাদের সহজ এবং স্বচ্ছ সিস্টেম দিয়ে আপনার কর্মক্ষমতা ট্র্যাক করুন। রিয়েল-টাইম ড্যাশবোর্ডে সব তথ্য দেখুন।",
    },
    {
      icon: DollarSign,
      title: "Instant Income",
      description:
        "প্রতিটি সফল রেফারেলের জন্য তাৎক্ষণিক কমিশন পান। দ্রুত এবং নিরাপদ পেমেন্ট প্রক্রিয়া।",
    },
    {
      icon: TrendingUp,
      title: "Clear Payment Process",
      description:
        "কোন লুকানো ফি নেই। স্বচ্ছ এবং সহজ পেমেন্ট সিস্টেম যা আপনি বিশ্বাস করতে পারেন।",
    },
    {
      icon: Users,
      title: "Affiliate Support",
      description:
        "ডেডিকেটেড অ্যাফিলিয়েট সাপোর্ট টিম সবসময় আপনার সাফল্যের জন্য প্রস্তুত।",
    },
  ];

  const handleScrollToSignup = () => {
    const signupSection = document.getElementById("signup-section");
    signupSection?.scrollIntoView({ behavior: "smooth" });
    setShowSignup(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div 
        className="relative mt-16 px-4 sm:px-6 lg:px-8 py-20 sm:py-32"
        style={{
          backgroundImage: "url('/slide3.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        
        <div className="relative z-10 container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              style={{
                fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              মেডিটাইম অ্যাফিলিয়েট পার্টনার হন
            </h1>
            <p 
              className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed"
              style={{
                fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              বাংলাদেশের সবচেয়ে বিশ্বস্ত হেলথকেয়ার প্ল্যাটফর্মের সাথে কাজ করুন এবং
              অসীম আয়ের সুযোগ পান
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleScrollToSignup}
                className="bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white text-lg px-8 py-6 rounded-xl shadow-2xl"
                style={{
                  fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                }}
              >
                এখনই যোগদান করুন
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Title & Description Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{
              color: "#009A98",
              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            একটি বিশ্বস্ত পার্টনারশিপ
          </h2>
          <p
            className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
            style={{
              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            মেডিটাইম অ্যাফিলিয়েট প্রোগ্রাম আপনাকে স্বাস্থ্যসেবা শিল্পে একটি সফল ব্যবসা গড়ে তুলতে সাহায্য করে। 
            আপনার নেটওয়ার্ক ব্যবহার করে মানুষকে মানসম্মত স্বাস্থ্যসেবায় পৌঁছাতে সাহায্য করুন এবং 
            প্রতিটি রেফারেলে আকর্ষণীয় কমিশন অর্জন করুন।
          </p>
        </motion.div>

        {/* Why Work With Us - Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2
            className="text-3xl md:text-4xl font-bold mb-8 text-center"
            style={{
              color: "#009A98",
              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            কেন আমাদের সাথে কাজ করবেন?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 bg-white border border-gray-200 shadow-md hover:shadow-xl hover:border-primary/30 transition-all duration-300 h-full flex flex-col group">
                    {/* Icon */}
                    <div className="mb-4">
                      <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                          <IconComponent 
                            className="w-6 h-6 text-primary" 
                            strokeWidth={2} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-xl font-bold text-gray-900 mb-3"
                      style={{
                        fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-gray-600 leading-relaxed grow"
                      style={{
                        fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                      }}
                    >
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Get Started Now Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={handleScrollToSignup}
              className="bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white text-lg px-12 py-6 rounded-xl shadow-2xl"
              style={{
                fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
              }}
            >
              এখনই শুরু করুন
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Signup/Signin Section */}
      <div id="signup-section" className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AffiliateAuthForms showSignupByDefault={showSignup} />
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Affiliate Auth Forms Component
function AffiliateAuthForms({ showSignupByDefault }: { showSignupByDefault: boolean }) {
  const [isSignup, setIsSignup] = useState(showSignupByDefault);

  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Tab Switcher */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setIsSignup(true)}
          className={`flex-1 py-4 text-lg font-semibold transition-all ${
            isSignup
              ? "bg-primary text-white"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
          style={{
            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
          }}
        >
          নতুন নিবন্ধন
        </button>
        <button
          onClick={() => setIsSignup(false)}
          className={`flex-1 py-4 text-lg font-semibold transition-all ${
            !isSignup
              ? "bg-primary text-white"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
          style={{
            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
          }}
        >
          লগইন
        </button>
      </div>

      {/* Forms */}
      <div className="p-8">
        {isSignup ? <AffiliateSignupForm /> : <AffiliateSigninForm />}
      </div>
    </div>
  );
}


