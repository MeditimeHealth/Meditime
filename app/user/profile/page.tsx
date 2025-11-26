"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Activity,
  Clock,
} from "lucide-react";

interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt?: string;
}

export default function UserProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/");
      return;
    }

    try {
      const parsedData = JSON.parse(userData);
      setUser(parsedData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-1 pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your account information</p>
          </div>

          {/* Profile Card */}
          <Card className="p-8 mb-8">
            <div className="flex items-center gap-6 mb-8 pb-6 border-b">
              <div className="h-24 w-24 rounded-full bg-gradient-to-r from-primary to-primary-dark flex items-center justify-center text-white text-3xl font-bold">
                {user.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <User className="h-5 w-5 text-gray-500" />
                    Full Name
                  </Label>
                  <p className="text-lg font-medium text-gray-900">{user.fullName}</p>
                </div>

                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Mail className="h-5 w-5 text-gray-500" />
                    Email Address
                  </Label>
                  <p className="text-lg font-medium text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="flex items-center gap-2 text-gray-700 mb-2">
                    <Phone className="h-5 w-5 text-gray-500" />
                    Phone Number
                  </Label>
                  <p className="text-lg font-medium text-gray-900">{user.phoneNumber || "Not provided"}</p>
                </div>

                {user.createdAt && (
                  <div>
                    <Label className="flex items-center gap-2 text-gray-700 mb-2">
                      <Calendar className="h-5 w-5 text-gray-500" />
                      Member Since
                    </Label>
                    <p className="text-lg font-medium text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 text-center bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">0</p>
              <p className="text-sm text-gray-600">Total Appointments</p>
            </Card>

            <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">0</p>
              <p className="text-sm text-gray-600">Completed</p>
            </Card>

            <Card className="p-6 text-center bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
              <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">0</p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </Card>
          </div>

          {/* Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/doctors')}
                className="w-full justify-start"
                variant="outline"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book New Appointment
              </Button>
              <Button
                onClick={() => router.push('/appointments')}
                className="w-full justify-start"
                variant="outline"
              >
                <Activity className="h-4 w-4 mr-2" />
                View My Appointments
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Label({ className, children, ...props }: React.HTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={className} {...props}>
      {children}
    </label>
  );
}
