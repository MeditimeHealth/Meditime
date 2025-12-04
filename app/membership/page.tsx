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
    setSelectedPlan(planId);
    const membersCovered = getMembersCovered(planId);
    setFormData(prev => ({ 
      ...prev, 
      cardPackage: planId,
      membersCovered: membersCovered
    }));
    // Scroll to form
    document.getElementById("membership-form")?.scrollIntoView({ behavior: "smooth" });
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

        {/* Registration Form */}
        <motion.div
          id="membership-form"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: "#1e3a8a" }}>
              Register for Membership
            </h2>
            <p className="text-gray-600 mb-4">
              Fill in your details to proceed with payment and membership activation
            </p>
            
            {formData.cardPackage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 inline-block">
                <div className="space-y-2">
                  <div className="flex justify-between items-center gap-8 text-gray-700">
                    <span className="capitalize font-medium">{formData.cardPackage} Membership:</span>
                    <span className="font-semibold">
                      {formData.cardPackage === "corporate" ? "Custom" : `৳${getMembershipPrice(formData.cardPackage).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-8 text-gray-700">
                    <span>Card Fee:</span>
                    <span className="font-semibold">৳{CARD_FEE}</span>
                  </div>
                  <div className="flex justify-between items-center gap-8 text-gray-700">
                    <span>Delivery Charge:</span>
                    <span className="font-semibold">৳{DELIVERY_CHARGE}</span>
                  </div>
                  <div className="border-t border-blue-300 pt-2 mt-2">
                    <div className="flex justify-between items-center gap-8">
                      <span className="text-lg font-bold text-gray-800">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary">
                        {formData.cardPackage === "corporate" 
                          ? "Custom Price" 
                          : `৳${calculateTotal(formData.cardPackage)?.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!formData.cardPackage && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 inline-block">
                <p className="text-gray-600">
                  Please select a membership package below to see pricing details
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Name (As per NID/Birth Certificate) *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Enter your full name as per NID"
                />
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="+880 1XXX-XXXXXX"
                />
              </div>

              {/* Card Package */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Crown className="w-4 h-4 inline mr-2" />
                  Card Package *
                </label>
                <select
                  name="cardPackage"
                  value={formData.cardPackage}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Select a package</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                  <option value="platinum">Platinum</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>

              {/* Members Covered */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-2" />
                  Members Covered
                </label>
                <input
                  type="number"
                  name="membersCovered"
                  value={formData.membersCovered || ""}
                  onChange={handleInputChange}
                  min="0"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-gray-50"
                  placeholder="Auto-filled based on package"
                  disabled={formData.cardPackage !== "corporate"}
                />
                {formData.cardPackage && formData.cardPackage !== "corporate" && (
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.cardPackage === "silver" && "2 members for Silver"}
                    {formData.cardPackage === "gold" && "3 members for Gold"}
                    {formData.cardPackage === "platinum" && "5 members for Platinum"}
                  </p>
                )}
              </div>

              {/* Company Name (for corporate) */}
              {formData.cardPackage === "corporate" && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Company *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required={formData.cardPackage === "corporate"}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 inline mr-2" />
                      Company ID Number *
                    </label>
                    <input
                      type="text"
                      name="companyIdNumber"
                      value={formData.companyIdNumber}
                      onChange={handleInputChange}
                      required={formData.cardPackage === "corporate"}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      placeholder="Enter company ID/registration number"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Delivery Address (We will deliver your card to this address) *
              </label>
              <textarea
                name="deliveryAddress"
                value={formData.deliveryAddress}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Enter complete delivery address with area, city, and postal code"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting || !formData.cardPackage}
                className="bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 px-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting 
                  ? "Processing..." 
                  : formData.cardPackage === "corporate"
                    ? "Submit Request"
                    : formData.cardPackage
                      ? `Proceed to Payment (৳${calculateTotal(formData.cardPackage)?.toLocaleString()})`
                      : "Select a Package First"
                }
              </button>
              <p className="text-sm text-gray-500 mt-4">
                {formData.cardPackage === "corporate" 
                  ? "Our team will contact you for custom pricing and payment details"
                  : "You will be redirected to payment gateway to complete your membership registration"
                }
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
