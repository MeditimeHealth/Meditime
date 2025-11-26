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
import { showToast } from "@/lib/toast";

const signinSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SigninFormValues = z.infer<typeof signinSchema>;

export default function AffiliateSigninForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
  });

  const onSubmit = async (data: SigninFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/affiliate/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        // Store affiliate data in localStorage
        localStorage.setItem("affiliate", JSON.stringify(result.affiliate));
        
        showToast.success("Successfully signed in!");
        
        // Redirect to affiliate dashboard
        window.location.href = "/affiliate-program/dashboard";
      } else {
        showToast.error(result.error || "Sign in failed");
      }
    } catch (error) {
      showToast.error("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h3
        className="text-2xl font-bold text-gray-900 mb-2"
        style={{
          fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
        }}
      >
        অ্যাফিলিয়েট লগইন
      </h3>
      <p
        className="text-gray-600 mb-6"
        style={{
          fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
        }}
      >
        আপনার অ্যাকাউন্টে প্রবেশ করুন
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="emailOrPhone">
            ইমেইল অথবা ফোন নম্বর <span className="text-red-500">*</span>
          </Label>
          <Input
            id="emailOrPhone"
            type="text"
            placeholder="ইমেইল বা ফোন নম্বর লিখুন"
            {...register("emailOrPhone")}
            className="mt-1"
          />
          {errors.emailOrPhone && (
            <p className="text-sm text-red-500 mt-1">
              {errors.emailOrPhone.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="password">
            পাসওয়ার্ড <span className="text-red-500">*</span>
          </Label>
          <div className="relative mt-1">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="পাসওয়ার্ড লিখুন"
              {...register("password")}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-primary hover:underline"
            style={{
              fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
            }}
          >
            পাসওয়ার্ড ভুলে গেছেন?
          </Link>
        </div>

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-primary-light to-primary hover:from-primary hover:to-primary-dark text-white py-3"
          disabled={isLoading}
          style={{
            fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
          }}
        >
          {isLoading ? "লগইন হচ্ছে..." : "লগইন করুন"}
        </Button>
      </form>
    </div>
  );
}
