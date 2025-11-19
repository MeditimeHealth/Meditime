"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { showToast } from "@/lib/toast";

const loginSchema = z.object({
  userType: z.enum(["user", "bloodDonor", "ambulance"], {
    message: "Please select a user type",
  }),
  phoneOrEmail: z.string().min(1, "Phone number or email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

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
        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(result.user));
        // Dispatch event to update navbar
        window.dispatchEvent(new Event("userLogin"));
        
        // Redirect based on user type
        const userType = result.user.userType || result.user.role;
        if (userType === 'bloodDonor') {
          router.push("/blood-donor/profile");
        } else if (userType === 'ambulance') {
          router.push("/ambulance/profile");
        } else {
          router.push("/");
        }
        router.refresh();
      } else {
        showToast.error(result.error || "Login failed");
      }
    } catch (error) {
      showToast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{
      backgroundImage: "url('/slide2.jpg')",
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
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-6 0h6" />
                      </svg>
                    </div>
                    <h1 className="text-3xl font-bold">MEDI TIME</h1>
                  </div>
                  <h2 className="text-5xl font-bold leading-tight">
                    Your Health,
                    <br />
                    Our Priority
                  </h2>
                  <p className="text-lg text-white/90 leading-relaxed">
                    Access your medical records, book appointments, and manage your health journey with ease.
                  </p>
                  <p className="text-base text-white/80">
                    Where your health becomes our mission.
                  </p>
                </div>
              </div>

              {/* Right Section - Login Form */}
              <div className="md:col-span-3 bg-white/95 backdrop-blur-sm p-12">
                <div className="max-w-md mx-auto">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h3>
                  <p className="text-gray-600 mb-8">Sign in to your account</p>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                      <Label htmlFor="userType">Sign in as <span className="text-red-500">*</span></Label>
                      <select
                        id="userType"
                        {...register("userType")}
                        className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-1"
                      >
                        <option value="">Select user type</option>
                        <option value="user">User</option>
                        <option value="bloodDonor">Blood Donor</option>
                        <option value="ambulance">Ambulance</option>
                      </select>
                      {errors.userType && (
                        <p className="text-sm text-red-500 mt-1">{errors.userType.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phoneOrEmail">Phone Number or Email</Label>
                      <Input
                        id="phoneOrEmail"
                        type="text"
                        placeholder="Enter your phone or email"
                        {...register("phoneOrEmail")}
                        className="mt-1"
                      />
                      {errors.phoneOrEmail && (
                        <p className="text-sm text-red-500 mt-1">{errors.phoneOrEmail.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="password">Password</Label>
                      <div className="relative mt-1">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
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
                      <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "SIGN IN"}
                    </Button>
                  </form>

                  <div className="mt-8">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white/95 text-gray-500">or</span>
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full mt-6"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign in with Google
                    </Button>
                  </div>

                  <p className="mt-6 text-center text-sm text-gray-600">
                    Are you new?{" "}
                    <Link href="/signup" className="text-primary font-medium hover:underline">
                      Create an Account
                    </Link>
                  </p>
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
