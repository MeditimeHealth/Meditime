"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";

const signupSchema = z
  .object({
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phoneNumber: z.string().min(10, "Phone number must be at least 10 digits").regex(/^[0-9]+$/, "Phone number must contain only digits"),
    fullName: z.string().min(2, "Full name is required"),
    gender: z.enum(["male", "female"]),
    bloodGroup: z.string().optional(),
    age: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(1, "Age must be greater than 0").max(150, "Age must be less than 150")),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      agreeToTerms: false,
    },
  });

  const agreeToTerms = watch("agreeToTerms");

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const { confirmPassword, agreeToTerms, ...userData } = data;
      
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok) {
        router.push("/login");
        alert("Account created successfully! Please login.");
      } else {
        alert(result.error || "Signup failed");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  return (
    <div className="min-h-screen flex items-center justify-center p-2 sm:p-4" style={{
      backgroundImage: "url('/slide.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}>
      <div className="w-full max-w-6xl">
        <div className="bg-white/20 backdrop-blur-lg rounded-lg sm:rounded-3xl shadow-2xl overflow-hidden border border-white/30">
          <div className="grid md:grid-cols-5 gap-0">
            {/* Left Section - Branding */}
            <div className="hidden md:flex md:col-span-2 bg-gradient-to-br from-primary/20 to-primary-dark/20 p-6 lg:p-12 flex-col justify-center text-white">
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center gap-3 mb-4 lg:mb-8">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-6 0h6" />
                    </svg>
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold">MEDI TIME</h1>
                </div>
                <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                  Start Your Health
                  <br />
                  Journey Today
                </h2>
                <p className="text-base lg:text-lg text-white/90 leading-relaxed">
                  Join thousands of users managing their health with our comprehensive platform.
                </p>
                <p className="text-sm lg:text-base text-white/80">
                  Your health companion for a better tomorrow.
                </p>
              </div>
            </div>

            {/* Right Section - Signup Form */}
            <div className="md:col-span-3 lg:col-span-3 bg-white/95 backdrop-blur-sm p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[95vh] sm:max-h-[90vh]">
              <div className="max-w-md mx-auto">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create Account</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Fill in your details to get started</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">


                  <div>
                    <Label htmlFor="fullName" className="text-sm sm:text-base">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      {...register("fullName")}
                      className="mt-1 text-sm sm:text-base"
                    />
                    {errors.fullName && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.fullName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber" className="text-sm sm:text-base">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phoneNumber"
                      type="tel"
                      placeholder="Enter your phone number"
                      {...register("phoneNumber")}
                      className="mt-1 text-sm sm:text-base"
                    />
                    {errors.phoneNumber && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.phoneNumber.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm sm:text-base">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...register("email")}
                      className="mt-1 text-sm sm:text-base"
                    />
                    {errors.email && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="gender" className="text-sm sm:text-base">
                        Gender <span className="text-red-500">*</span>
                      </Label>
                      <Select id="gender" {...register("gender")} className="mt-1 text-sm sm:text-base">
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Select>
                      {errors.gender && (
                        <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.gender.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="age" className="text-sm sm:text-base">
                        Age <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="age"
                        type="number"
                        placeholder="Enter your age"
                        {...register("age")}
                        className="mt-1 text-sm sm:text-base"
                      />
                      {errors.age && (
                        <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.age.message}</p>
                      )}
                    </div>
                  </div>

                  {errors.bloodGroup && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.bloodGroup.message}</p>
                  )}

                  <div>
                    <Label htmlFor="password" className="text-sm sm:text-base">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        {...register("password")}
                        className="text-sm sm:text-base pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm sm:text-base">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        {...register("confirmPassword")}
                        className="text-sm sm:text-base pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>
                    )}
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="agreeToTerms"
                      checked={agreeToTerms}
                      onChange={(e) => setValue("agreeToTerms", e.target.checked)}
                      className="mt-1"
                    />
                    <Label htmlFor="agreeToTerms" className="text-xs sm:text-sm font-normal cursor-pointer leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        terms and conditions
                      </Link>
                    </Label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-xs sm:text-sm text-red-500">{errors.agreeToTerms.message}</p>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white text-sm sm:text-base py-2 sm:py-3"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "SIGN UP"}
                  </Button>
                </form>

                <p className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-medium hover:underline">
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
