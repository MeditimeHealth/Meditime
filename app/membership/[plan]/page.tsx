"use client";

import { useState, use } from "react";
import { motion } from "framer-motion";
import { Crown, Sparkles, Star, Building2, Check, Phone, User, Users, MapPin, Shield, Heart, Clock, Award, Package, ArrowRight } from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Image from "next/image";
import { useRouter } from "next/navigation";

const membershipPlans = {
  silver: {
    id: "silver",
    title: "Silver Membership",
    icon: Star,
    color: "#9CA3AF",
    gradient: "from-gray-300 to-gray-500",
    price: 1000,
    cardFee: 500,
    deliveryCharge: 150,
    yearlyPrice: 1000,
    period: "/year",
    membersCovered: 2,
    image: "/membership-silver.jpg",
    description: "Perfect for individuals seeking quality healthcare with basic benefits and discounts on consultations.",
    features: [
      { icon: Check, text: "5% discount on consultations" },
      { icon: Check, text: "Free health checkup (annual)" },
      { icon: Check, text: "Priority appointment booking" },
      { icon: Check, text: "24/7 helpline support" },
      { icon: Check, text: "Access to health articles" },
      { icon: Check, text: "Medicine discount: 5%" },
    ],
    benefits: [
      "Valid for 1 year from activation",
      "Covers 2 family members",
      "Emergency consultation support",
      "Health tips and wellness content",
      "Exclusive member events access",
    ],
  },
  gold: {
    id: "gold",
    title: "Gold Membership",
    icon: Sparkles,
    color: "#F59E0B",
    gradient: "from-yellow-300 to-yellow-600",
    price: 2500,
    cardFee: 500,
    deliveryCharge: 150,
    yearlyPrice: 2500,
    period: "/year",
    membersCovered: 3,
    popular: true,
    image: "/membership-gold.jpg",
    description: "Enhanced benefits with priority booking, extended discounts, and access to premium healthcare services.",
    features: [
      { icon: Check, text: "10% discount on consultations" },
      { icon: Check, text: "Free health checkup (bi-annual)" },
      { icon: Check, text: "VIP appointment booking" },
      { icon: Check, text: "24/7 priority helpline" },
      { icon: Check, text: "Access to wellness programs" },
      { icon: Check, text: "Medicine discount: 10%" },
      { icon: Check, text: "Free home sample collection" },
      { icon: Check, text: "Diagnostic test discount: 15%" },
    ],
    benefits: [
      "Valid for 1 year from activation",
      "Covers 3 family members",
      "Priority emergency services",
      "Quarterly health reports",
      "Free nutritionist consultation",
      "Yoga & fitness class access",
    ],
  },
  platinum: {
    id: "platinum",
    title: "Platinum Membership",
    icon: Crown,
    color: "#9333EA",
    gradient: "from-purple-300 to-purple-600",
    price: 5000,
    cardFee: 500,
    deliveryCharge: 150,
    yearlyPrice: 5000,
    period: "/year",
    membersCovered: 5,
    image: "/membership-platinum.jpg",
    description: "Premium healthcare experience with VIP access, maximum discounts, and exclusive wellness programs.",
    features: [
      { icon: Check, text: "15% discount on consultations" },
      { icon: Check, text: "Free comprehensive checkup (quarterly)" },
      { icon: Check, text: "VIP+ appointment booking" },
      { icon: Check, text: "Dedicated health manager" },
      { icon: Check, text: "Premium wellness programs" },
      { icon: Check, text: "Medicine discount: 15%" },
      { icon: Check, text: "Free home sample collection" },
      { icon: Check, text: "Diagnostic test discount: 20%" },
      { icon: Check, text: "Ambulance service discount: 25%" },
      { icon: Check, text: "Free telemedicine consultations" },
    ],
    benefits: [
      "Valid for 1 year from activation",
      "Covers 5 family members",
      "Dedicated health concierge",
      "Monthly health monitoring",
      "Free annual vaccination",
      "Exclusive wellness retreats",
      "Priority surgery bookings",
    ],
  },
  corporate: {
    id: "corporate",
    title: "Corporate Membership",
    icon: Building2,
    color: "#3B82F6",
    gradient: "from-blue-400 to-blue-700",
    price: 0,
    cardFee: 500,
    deliveryCharge: 150,
    yearlyPrice: 0,
    period: "",
    membersCovered: 0,
    image: "/membership-corporate.jpg",
    description: "Comprehensive healthcare solutions for organizations, offering employee wellness and group benefits.",
    features: [
      { icon: Check, text: "Customized group packages" },
      { icon: Check, text: "Employee health screenings" },
      { icon: Check, text: "On-site health camps" },
      { icon: Check, text: "Dedicated account manager" },
      { icon: Check, text: "Flexible coverage options" },
      { icon: Check, text: "Up to 20% discounts" },
      { icon: Check, text: "Wellness workshops" },
      { icon: Check, text: "Monthly health reports" },
      { icon: Check, text: "Emergency support 24/7" },
      { icon: Check, text: "Custom benefits package" },
    ],
    benefits: [
      "Customizable validity period",
      "Flexible member coverage",
      "Company-wide health analytics",
      "Employee engagement programs",
      "Preventive health initiatives",
      "Mental wellness support",
    ],
  },
};

export default function MembershipDetailPage({ params }: { params: Promise<{ plan: string }> }) {
  const resolvedParams = use(params);
  const planId = resolvedParams.plan as keyof typeof membershipPlans;
  const plan = membershipPlans[planId];
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    mobileNumber: "",
    cardPackage: planId,
    membersCovered: plan?.membersCovered || 0,
    deliveryAddress: "",
    company: "",
    companyIdNumber: "",
  });

  if (!plan) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan not found</h1>
          <button
            onClick={() => router.push("/membership")}
            className="text-primary hover:underline"
          >
            ← Back to memberships
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const IconComponent = plan.icon;
  const totalAmount = plan.price + plan.cardFee + plan.deliveryCharge;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/memberships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (plan.id === "corporate") {
          alert("Thank you! Our team will contact you shortly for corporate membership.");
          router.push("/");
        } else {
          const paymentResponse = await fetch("/api/memberships/payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ membershipId: data.membershipId }),
          });

          const paymentData = await paymentResponse.json();

          if (paymentResponse.ok && paymentData.gatewayUrl) {
            window.location.href = paymentData.gatewayUrl;
          } else {
            alert("Failed to initiate payment. Please try again.");
          }
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
      
      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <button onClick={() => router.push("/")} className="hover:text-primary">Home</button>
            <span>/</span>
            <button onClick={() => router.push("/membership")} className="hover:text-primary">Memberships</button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{plan.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!showForm ? (
          <>
            {/* Product Detail Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              {/* Left Side - Image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-4"
              >
                <div className="relative h-[500px] bg-gradient-to-br rounded-2xl overflow-hidden shadow-2xl" style={{ background: `linear-gradient(135deg, ${plan.color}20, ${plan.color}40)` }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconComponent className="w-64 h-64 opacity-20" style={{ color: plan.color }} />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <IconComponent className="w-32 h-32" style={{ color: plan.color }} />
                  </div>
                  {'popular' in plan && plan.popular && (
                    <div className="absolute top-4 right-4 bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </div>
                  )}
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-700">Secure Payment</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Heart className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-700">Health Assured</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-700">Premium Quality</p>
                  </div>
                </div>
              </motion.div>

              {/* Right Side - Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Title and Icon */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${plan.color}20` }}>
                    <IconComponent className="w-8 h-8" style={{ color: plan.color }} />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: plan.color }}>
                      {plan.title}
                    </h1>
                    <p className="text-gray-600">{plan.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-bold text-gray-900">
                      {plan.id === "corporate" ? "Custom" : `৳${plan.yearlyPrice.toLocaleString()}`}
                    </span>
                    {plan.period && <span className="text-gray-600 text-lg">{plan.period}</span>}
                  </div>
                  {plan.id !== "corporate" && (
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Membership Fee:</span>
                        <span className="font-semibold">৳{plan.yearlyPrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Card Fee:</span>
                        <span className="font-semibold">৳{plan.cardFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Charge:</span>
                        <span className="font-semibold">৳{plan.deliveryCharge}</span>
                      </div>
                      <div className="border-t border-gray-300 pt-2 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-primary">৳{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Members Covered */}
                <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-4">
                  <Users className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {plan.id === "corporate" ? "Custom Coverage" : `Covers ${plan.membersCovered} Members`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {plan.id === "corporate" ? "Flexible for your organization" : "Perfect for your family"}
                    </p>
                  </div>
                </div>

                {/* Buy Now Button */}
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 text-lg"
                >
                  {plan.id === "corporate" ? "Request Quote" : "Buy Now"}
                  <ArrowRight className="w-6 h-6" />
                </button>

                {/* Quick Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Valid for 1 year</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">5-7 days delivery</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Features Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What's Included</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-gray-50 rounded-lg p-4">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: plan.color }} />
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Benefits Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Benefits</h2>
              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-8 border border-gray-200">
                <ul className="space-y-3">
                  {plan.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: plan.color }}></span>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* About Card Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 md:p-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">About Your Membership Card</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Award className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Premium Design</h3>
                  <p className="text-sm text-gray-600">High-quality PVC card with elegant design and your details</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Unique ID</h3>
                  <p className="text-sm text-gray-600">Each card has a unique ID for easy verification and access</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <Package className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Secure Delivery</h3>
                  <p className="text-sm text-gray-600">Delivered to your doorstep within 5-7 business days</p>
                </div>
              </div>
            </motion.div>
          </>
        ) : (
          /* Registration Form */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <button
              onClick={() => setShowForm(false)}
              className="mb-6 text-primary hover:underline flex items-center gap-2"
            >
              ← Back to details
            </button>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2" style={{ color: plan.color }}>
                  Complete Your Purchase
                </h2>
                <p className="text-gray-600 mb-4">
                  Fill in your details to proceed with payment
                </p>
                {plan.id !== "corporate" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between gap-8">
                        <span className="text-gray-700">Total Amount:</span>
                        <span className="font-bold text-primary text-xl">৳{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      placeholder="Enter your full name"
                    />
                  </div>

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

                  {plan.id === "corporate" && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Building2 className="w-4 h-4 inline mr-2" />
                          Company Name *
                        </label>
                        <input
                          type="text"
                          name="company"
                          value={formData.company}
                          onChange={handleInputChange}
                          required
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
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="Company registration number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <Users className="w-4 h-4 inline mr-2" />
                          Number of Employees
                        </label>
                        <input
                          type="number"
                          name="membersCovered"
                          value={formData.membersCovered}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          placeholder="Number of employees to cover"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Delivery Address *
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

                <div className="text-center pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-primary to-primary-dark text-white font-bold py-4 px-12 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundImage: plan.id === "corporate" ? `linear-gradient(135deg, ${plan.color}, ${plan.color}dd)` : undefined,
                    }}
                  >
                    {isSubmitting 
                      ? "Processing..." 
                      : plan.id === "corporate"
                        ? "Submit Request"
                        : `Proceed to Payment (৳${totalAmount.toLocaleString()})`
                    }
                  </button>
                  <p className="text-sm text-gray-500 mt-4">
                    {plan.id === "corporate" 
                      ? "Our team will contact you for custom pricing"
                      : "Secure payment powered by SSLCommerz"
                    }
                  </p>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
