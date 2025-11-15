"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Clock, Users } from "lucide-react";

export default function DoctorDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [stats, setStats] = useState({
    totalSlots: 0,
    availableSlots: 0,
    bookedSlots: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, []);

  useEffect(() => {
    if (user?.phoneNumber) {
      fetchDoctorData();
    }
  }, [user]);

  const fetchDoctorData = async () => {
    try {
      // Find doctor by phone number
      const doctorsResponse = await fetch("/api/doctors");
      const doctorsData = await doctorsResponse.json();
      
      if (doctorsData.doctors) {
        const foundDoctor = doctorsData.doctors.find(
          (d: any) => d.phoneNumber === user.phoneNumber
        );
        
        if (foundDoctor) {
          setDoctor(foundDoctor);
          
          // Fetch statistics
          const statsResponse = await fetch(
            `/api/doctor/stats?doctorId=${foundDoctor._id}`
          );
          const statsData = await statsResponse.json();
          
          if (statsResponse.ok && statsData.stats) {
            setStats(statsData.stats);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching doctor data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome, {user?.fullName}</p>
        </div>
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">Doctor profile not found. Please contact admin.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome, {doctor.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Slots</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.totalSlots}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Slots</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.availableSlots}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Booked Slots</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stats.bookedSlots}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/doctor/time-slots">
              <Button className="w-full" variant="default">
                Manage Time Slots
              </Button>
            </Link>
            <Link href="/doctor/patients">
              <Button className="w-full" variant="outline">
                View All Patients
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Info</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Specialty: </span>
              <span className="text-gray-900 font-medium">{doctor.specialty}</span>
            </div>
            <div>
              <span className="text-gray-600">Qualification: </span>
              <span className="text-gray-900 font-medium">{doctor.qualification}</span>
            </div>
            {doctor.slotDuration && (
              <div>
                <span className="text-gray-600">Slot Duration: </span>
                <span className="text-gray-900 font-medium">{doctor.slotDuration} minutes</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
