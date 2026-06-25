"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { showToast } from "@/lib/toast";

const getLoginSchema = (language: 'en' | 'bn') => z.object({
  phoneOrEmail: z.string().min(1, language === 'bn' ? "ফোন নম্বর বা ইমেইল প্রয়োজন" : "Phone number or email is required"),
  password: z.string().min(6, language === 'bn' ? "পাসওয়ার্ড কমপক্ষে ৬টি অক্ষরের হতে হবে" : "Password must be at least 6 characters"),
}).refine((data) => {
  const val = data.phoneOrEmail;
  const isPhone = /^\+?\d/.test(val);
  if (isPhone) {
    const clean = val.replace(/\D/g, '');
    let localPhone = clean;
    if (clean.startsWith('880')) {
      localPhone = clean.slice(3);
    } else if (clean.startsWith('88')) {
      localPhone = clean.slice(2);
    }
    return localPhone.length === 11 && localPhone.startsWith('01');
  }
  return true;
}, {
  message: language === 'bn' ? "অনুগ্রহ করে 11 ডিজিটের নম্বরটি দিন (01 দিয়ে শুরু করুন)। যেমন: 01XXXXXXXXX" : "Please provide 11 digits number (starting with 01). Example: 01XXXXXXXXX",
  path: ["phoneOrEmail"],
});

type LoginFormValues = {
  phoneOrEmail: string;
  password: string;
};

import { useLanguage } from "@/contexts/LanguageContext";
import { homepageTranslations } from "@/lib/homepage-translations";
import Nav_for_details from "@/components/nav_for_details";

export default function LoginPage() {
  const { language } = useLanguage() as { language: 'en' | 'bn' };
  const t = homepageTranslations[language].authPage;

  const [mode, setMode] = useState<'login' | 'forgot_email' | 'forgot_otp' | 'forgot_reset'>('login');
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(getLoginSchema(language)) as any,
  });

  const phoneOrEmailValue = watch("phoneOrEmail") || "";
  const isPhone = /^\+?\d/.test(phoneOrEmailValue);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(result.user));
        window.dispatchEvent(new Event("userLogin"));
        
        const userType = result.user.userType || result.user.role;
        if (userType === 'user') {
          router.push("/");
        }
        router.refresh();
      } else {
        showToast.error(result.error || (language === 'en' ? "Login failed" : "লগইন ব্যর্থ হয়েছে"));
      }
    } catch (error) {
      showToast.error(language === 'en' ? "An error occurred. Please try again." : "একটি সমস্যা দেখা দিয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return showToast.error("Email is required");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", email: resetEmail })
      });
      const data = await res.json();
      if (res.ok) {
        showToast.success(data.message);
        setMode('forgot_otp');
      } else {
        showToast.error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      showToast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp) return showToast.error("OTP is required");
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", email: resetEmail, otp: resetOtp })
      });
      const data = await res.json();
      if (res.ok) {
        showToast.success(data.message);
        setMode('forgot_reset');
      } else {
        showToast.error(data.error || "Invalid OTP");
      }
    } catch (error) {
      showToast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassword !== resetConfirmPassword) {
      return showToast.error("Passwords do not match");
    }
    if (resetPassword.length < 6) {
      return showToast.error("Password must be at least 6 characters");
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_password", email: resetEmail, otp: resetOtp, newPassword: resetPassword })
      });
      const data = await res.json();
      if (res.ok) {
        showToast.success(data.message);
        setMode('login');
        setResetEmail("");
        setResetOtp("");
        setResetPassword("");
        setResetConfirmPassword("");
      } else {
        showToast.error(data.error || "Failed to reset password");
      }
    } catch (error) {
      showToast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{
      backgroundImage: "url('/slide.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 pt-24 pb-16 md:pt-28 md:pb-20">
        <div className="w-full max-w-6xl">
          <div className="bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/30">
            <div className="grid md:grid-cols-5 gap-0">
              {/* Left Section - Branding */}
              <div className="md:col-span-2 bg-gradient-to-br from-primary/20 to-primary-dark/20 p-12 flex flex-col justify-center text-white">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-8">
                    <Image 
                      src="/SVG/asset-3.png" 
                      alt="Logo" 
                      width={120} 
                      height={120} 
                      className="h-12 w-auto cursor-pointer" 
                      style={{ width: "auto", height: "auto" }}
                      priority
                    />
                  </div>
                  <h2 className="text-5xl font-bold leading-tight">
                    {t.loginHeroTitle}
                  </h2>
                  <p className="text-lg text-white/90 leading-relaxed">
                    {t.loginHeroSubtitle}
                  </p>
                  <p className="text-base text-white/80">
                    {t.loginHeroMission}
                  </p>
                </div>
              </div>

              {/* Right Section - Login / Forgot Password Forms */}
              <div className="md:col-span-3 bg-white/95 backdrop-blur-sm p-12 relative">
                <div className="max-w-md mx-auto relative">
                  
                  {/* LOGIN MODE */}
                  {mode === 'login' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">{t.loginTitle}</h3>
                      <p className="text-gray-600 mb-8">{t.loginSubtitle}</p>

                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                

                        <div>
                          <Label htmlFor="phoneOrEmail">{t.phoneOrEmail}</Label>
                          <div className="relative flex items-center mt-1">
                            {isPhone && (
                              <span className="absolute left-3 flex items-center gap-1.5 text-gray-500 text-sm border-r pr-2 h-6 border-gray-300 pointer-events-none select-none">
                                <img src="https://flagcdn.com/w40/bd.png" alt="BD" className="w-6 h-4 rounded-sm object-cover" />
                                <span>+88</span>
                              </span>
                            )}
                            <Input
                              id="phoneOrEmail"
                              type="text"
                              placeholder={t.phoneOrEmailPlaceholder}
                              {...register("phoneOrEmail")}
                              className={`w-full ${isPhone ? 'pl-[5rem]' : ''}`}
                            />
                          </div>
                          {errors.phoneOrEmail && (
                            <p className="text-sm text-red-500 mt-1">{errors.phoneOrEmail.message}</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor="password">{t.password}</Label>
                          <div className="relative mt-1">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder={t.passwordPlaceholder}
                              {...register("password")}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                          {errors.password && (
                            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                          )}
                        </div>

                        <div className="flex justify-end">
                          <button 
                            type="button"
                            onClick={() => setMode('forgot_email')} 
                            className="text-sm text-primary hover:underline bg-transparent border-none p-0 cursor-pointer"
                          >
                            {t.forgotPassword}
                          </button>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? t.signingInBtn : t.signInBtn}
                        </Button>
                      </form>

                      {/* Or divider */}
                      <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="bg-white px-2 text-gray-500">
                            {language === 'bn' ? 'অথবা' : 'Or'}
                          </span>
                        </div>
                      </div>

                      {/* Google Sign-in Button */}
                      <div className="w-full flex justify-center mb-6">
                        <div id="google-login-button" className="w-full" />
                      </div>

                      <p className="mt-6 text-center text-sm text-gray-600">
                        {t.newHere}{" "}
                        <Link href="/signup" className="text-primary font-medium hover:underline">
                          {t.createAccount}
                        </Link>
                      </p>
                    </div>
                  )}

                  {/* FORGOT PASSWORD - EMAIL MODE */}
                  {mode === 'forgot_email' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <button 
                        onClick={() => setMode('login')}
                        className="flex items-center text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        {language === "bn" ? "লগইন এ ফিরে যান" : "Back to login"}
                      </button>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">{language === "bn" ? "পাসওয়ার্ড ভুলে গেছেন" : "Forgot Password"}</h3>
                      <p className="text-gray-600 mb-8">{language === "bn" ? "একটি ৬-ডিজিটের ভেরিফিকেশন কোড পেতে আপনার নিবন্ধিত ইমেইল ঠিকানা লিখুন।" : "Enter your registered email address to receive a 6-digit verification code."}</p>

                      <form onSubmit={handleSendOtp} className="space-y-6">
                        <div>
                          <Label htmlFor="resetEmail">{language === "bn" ? "ইমেইল ঠিকানা" : "Email Address"}</Label>
                          <Input
                            id="resetEmail"
                            type="email"
                            placeholder="e.g. user@example.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? language === "bn" ? "পাঠানো হচ্ছে..." : "Sending..." : language === "bn" ? "ভেরিফিকেশন কোড পাঠান" : "Send Verification Code"}
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* FORGOT PASSWORD - OTP MODE */}
                  {mode === 'forgot_otp' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <button 
                        onClick={() => setMode('forgot_email')}
                        className="flex items-center text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        {language === "bn" ? "ফিরে যান" : "Back"}
                      </button>
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">{language === "bn" ? "আপনার ইমেইল চেক করুন" : "Check Your Email"}</h3>
                      <p className="text-gray-600 mb-8">{language === "bn" ? "আমরা একটি ৬-ডিজিটের ভেরিফিকেশন কোড পাঠিয়েছি " : "We've sent a 6-digit verification code to "}<strong>{resetEmail}</strong>. {language === "bn" ? "এটি ১০ মিনিটের মধ্যে শেষ হয়ে যাবে।" : "It will expire in 10 minutes."}</p>

                      <form onSubmit={handleVerifyOtp} className="space-y-6">
                        <div>
                          <Label htmlFor="resetOtp">{language === "bn" ? "৬-ডিজিটের কোড" : "6-Digit Code"}</Label>
                          <Input
                            id="resetOtp"
                            type="text"
                            placeholder={language === "bn" ? "ওটিপি লিখুন" : "Enter OTP"}
                            value={resetOtp}
                            onChange={(e) => setResetOtp(e.target.value)}
                            required
                            className="mt-1 text-center text-2xl tracking-[0.5em] font-mono"
                            maxLength={6}
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? language === "bn" ? "যাচাই করা হচ্ছে..." : "Verifying..." : language === "bn" ? "কোড যাচাই করুন" : "Verify Code"}
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* FORGOT PASSWORD - RESET MODE */}
                  {mode === 'forgot_reset' && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">{language === "bn" ? "নতুন পাসওয়ার্ড" : "New Password"}</h3>
                      <p className="text-gray-600 mb-8">{language === "bn" ? "প্রায় শেষ! আপনার অ্যাকাউন্টের জন্য একটি নতুন নিরাপদ পাসওয়ার্ড তৈরি করুন।" : "Almost there! Create a new secure password for your account."}</p>

                      <form onSubmit={handleResetPassword} className="space-y-6">
                        <div>
                          <Label htmlFor="newPassword">{language === "bn" ? "নতুন পাসওয়ার্ড" : "New Password"}</Label>
                          <div className="relative mt-1">
                            <Input
                              id="newPassword"
                              type={showPassword ? "text" : "password"}
                              placeholder={language === "bn" ? "কমপক্ষে ৬টি অক্ষর" : "Min 6 characters"}
                              value={resetPassword}
                              onChange={(e) => setResetPassword(e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="confirmNewPassword">{language === "bn" ? "পাসওয়ার্ড নিশ্চিত করুন" : "Confirm Password"}</Label>
                          <Input
                            id="confirmNewPassword"
                            type="password"
                            placeholder={language === "bn" ? "নতুন পাসওয়ার্ড পুনরায় লিখুন" : "Re-enter new password"}
                            value={resetConfirmPassword}
                            onChange={(e) => setResetConfirmPassword(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white"
                          disabled={isLoading}
                        >
                          {isLoading ? language === "bn" ? "রিসেট করা হচ্ছে..." : "Resetting..." : language === "bn" ? "পাসওয়ার্ড রিসেট করুন" : "Reset Password"}
                        </Button>
                      </form>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
