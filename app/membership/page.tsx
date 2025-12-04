"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles, Star, Building2, Check, Phone, User, Users, MapPin } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const membershipPlans = [
  {
    id: "silver",
    title: "Silver",
    icon: Star,
    color: "#9CA3AF",
    gradient: "from-gray-300 to-gray-500",
    price: "৳ 1,000",
    period: "/year",
    features: [
      "5% discount on consultations",
      "Free health checkup (annual)",
      "Priority appointment booking",
      "24/7 helpline support",
      "Access to health articles",
      "Medicine discount: 5%",
    ],
  },
  {
    id: "gold",
    title: "Gold",
    icon: Sparkles,
    color: "#F59E0B",
    gradient: "from-yellow-300 to-yellow-600",
    price: "৳ 2,500",
    period: "/year",
    popular: true,
    features: [
      "10% discount on consultations",
      "Free health checkup (bi-annual)",
      "VIP appointment booking",
      "24/7 priority helpline",
      "Access to wellness programs",
      "Medicine discount: 10%",
      "Free home sample collection",
      "Diagnostic test discount: 15%",
    ],
  },
  {
    id: "platinum",
    title: "Platinum",
    icon: Crown,
    color: "#9333EA",
    gradient: "from-purple-300 to-purple-600",
    price: "৳ 5,000",
    period: "/year",
    features: [
      "15% discount on consultations",
      "Free comprehensive checkup (quarterly)",
      "VIP+ appointment booking",
      "Dedicated health manager",
      "Premium wellness programs",
      "Medicine discount: 15%",
      "Free home sample collection",
      "Diagnostic test discount: 20%",
      "Ambulance service discount: 25%",
      "Free telemedicine consultations",
    ],
  },
  {
    id: "corporate",
    title: "Corporate",
    icon: Building2,
    color: "#3B82F6",
    gradient: "from-blue-400 to-blue-700",
    price: "Custom",
    period: "",
    features: [
      "Customized group packages",
      "Employee health screenings",
      "On-site health camps",
      "Dedicated account manager",
      "Flexible coverage options",
      "Up to 20% discounts",
      "Wellness workshops",
      "Monthly health reports",
      "Emergency support 24/7",
      "Custom benefits package",
    ],
  },
];

export default function MembershipPage() {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    cardPackage: "",
    membersCovered: 0,
    deliveryAddress: "",
    company: "",
    companyIdNumber: "",
  });

  const CARD_FEE = 500;
  const DELIVERY_CHARGE = 150;

  const getMembersCovered = (packageType: string) => {
    switch (packageType) {
      case "silver":
        return 2;
      case "gold":
        return 3;
      case "platinum":
        return 5;
      case "corporate":
        return 0; // Will be custom
      default:
        return 0;
    }
  };

  const getMembershipPrice = (packageType: string) => {
    switch (packageType) {
      case "silver":
        return 1000;
      case "gold":
        return 2500;
      case "platinum":
        return 5000;
      case "corporate":
        return 0; // Custom pricing
      default:
        return 0;
    }
  };

  const calculateTotal = (packageType: string) => {
    const membershipPrice = getMembershipPrice(packageType);
    if (packageType === "corporate") {
      return null; // Custom pricing for corporate
    }
    return membershipPrice + CARD_FEE + DELIVERY_CHARGE;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === "cardPackage") {
      const membersCovered = getMembersCovered(value);
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        membersCovered: membersCovered
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectPlan = (planId: string) => {
    // Navigate to detail page
    window.location.href = `/membership/${planId}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create membership application
      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Initiate payment
        const paymentResponse = await fetch("/api/memberships/payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ membershipId: data.membershipId }),
        });

        const paymentData = await paymentResponse.json();

        if (paymentResponse.ok && paymentData.gatewayUrl) {
          // Redirect to payment gateway
          window.location.href = paymentData.gatewayUrl;
        } else {
          alert("Failed to initiate payment. Please try again.");
        }
      } else {
        alert(data.error || "Failed to submit membership application");
      }
    } catch (error) {
      console.error("Error submitting membership:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark text-white py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Choose Your Membership Plan
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl max-w-3xl mx-auto"
          >
            Invest in your health with exclusive benefits, discounts, and priority access to quality healthcare services
          </motion.p>
        </div>
      </div>

      {/* Membership Plans */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {membershipPlans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 flex flex-col h-full ${
                  selectedPlan === plan.id ? "border-primary scale-105" : "border-gray-100"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                    Most Popular
                  </div>
                )}

                <div className="p-8 flex flex-col flex-grow">
                  {/* Icon and Title */}
                  <div className="flex items-center mb-6">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mr-4"
                      style={{ backgroundColor: `${plan.color}20` }}
                    >
                      <IconComponent className="w-8 h-8" style={{ color: plan.color }} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold" style={{ color: plan.color }}>
                        {plan.title}
                      </h2>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                        <span className="text-gray-600 ml-1">{plan.period}</span>
                      </div>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" style={{ color: plan.color }} />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    className="w-full py-4 px-6 rounded-lg font-bold text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mt-auto"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)`,
                    }}
                  >
                    Select {plan.title} Plan
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
}