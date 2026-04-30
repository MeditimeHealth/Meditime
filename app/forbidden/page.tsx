"use client";

import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 p-10 bg-white rounded-3xl shadow-xl border border-gray-100">
        <div className="flex justify-center">
          <div className="bg-red-50 p-4 rounded-full">
            <ShieldAlert className="h-16 w-16 text-red-500" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            403 - Forbidden
          </h1>
          <p className="text-lg text-gray-600">
            Access Denied. You do not have the required administrative permissions to view this page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link 
            href="/" 
            className={cn(buttonVariants({ variant: "outline" }), "flex-1 rounded-xl")}
          >
            <Home className="mr-2 h-4 w-4" />
            Go Home
          </Link>
          <Link 
            href="/login" 
            className={cn(buttonVariants({ variant: "default" }), "flex-1 rounded-xl")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Switch Account
          </Link>
        </div>

        
        <p className="text-sm text-gray-400 pt-6">
          If you believe this is an error, please contact your system administrator.
        </p>
      </div>
    </div>
  );
}
