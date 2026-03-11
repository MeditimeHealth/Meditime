"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Hospital,
  Users,
  Calendar,
  DollarSign,
  Plus,
  Building2,
  UserPlus,
  Video,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalHospitals: 0,
    totalAppointments: 0,
    totalPatients: 0,
    pendingAppointments: 0,
    videoConsultations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch doctors count
      const doctorsRes = await fetch("/api/doctors");
      const doctorsData = await doctorsRes.json();

      // Fetch hospitals count
      const hospitalsRes = await fetch("/api/locations/hospitals");
      const hospitalsData = await hospitalsRes.json();

      // Fetch all appointments
      const appointmentsRes = await fetch("/api/appointments");
      const appointmentsData = await appointmentsRes.json();
      
      // Fetch pending appointments
      const pendingRes = await fetch("/api/appointments?status=pending");
      const pendingData = await pendingRes.json();

      // Calculate patients count (unique patient names from appointments)
      const uniquePatients = new Set(
        appointmentsData.appointments?.map((a: any) => a.mobileNumber) || []
      );

      setStats({
        totalDoctors: doctorsData.total || doctorsData.doctors?.length || 0,
        totalHospitals: hospitalsData.total || hospitalsData.hospitals?.length || 0,
        totalAppointments: appointmentsData.appointments?.length || 0,
        totalPatients: uniquePatients.size,
        pendingAppointments: pendingData.appointments?.length || 0,
        videoConsultations: 0, // Will be updated when video consultation API is ready
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the Medi Time admin panel
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* 1. Appointments */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <Link
            href="/admin/appointments"
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-600">Appointments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "..." : stats.totalAppointments}
              </p>
              {stats.pendingAppointments > 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  {stats.pendingAppointments} pending
                </p>
              )}
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </Link>
        </Card>

        {/* 2. Patients (Complete) */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <Link
            href="/admin/patients"
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-600">Patients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "..." : stats.totalPatients}
              </p>
              <p className="text-xs text-green-600 mt-1">Complete</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </Link>
        </Card>

        {/* 3. Video Consultation */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <Link
            href="/admin/video-consultation"
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-600">Video Consultation</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "..." : stats.videoConsultations}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Video className="h-6 w-6 text-blue-600" />
            </div>
          </Link>
        </Card>

        {/* 4. Doctors */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <Link
            href="/admin/doctors"
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-600">Doctors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "..." : stats.totalDoctors}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
          </Link>
        </Card>

        {/* 5. Hospitals */}
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <Link
            href="/admin/hospitals"
            className="flex items-center justify-between"
          >
            <div>
              <p className="text-sm text-gray-600">Hospitals</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "..." : stats.totalHospitals}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          </Link>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/admin/appointments"
            className="group p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">View Appointments</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage all appointment bookings
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/video-consultation"
            className="group p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Video className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Video Consultation
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage all Video Consultation
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/doctors/create"
            className="group p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Create New Doctor</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Add a new doctor profile to the system
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/hospitals/create"
            className="group p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Hospital className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Add Hospital </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Add a new Hospital to the system
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/doctors"
            className="group p-4 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Manage Doctors</h3>
                <p className="text-sm text-gray-600 mt-1">
                  View and edit existing doctor profiles
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/hospitals"
            className="group p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Building2 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Manage Hospitals</h3>
                <p className="text-sm text-gray-600 mt-1">
                  View and manage all hospitals
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/departments"
            className="group p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Building2 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Manage Departments
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  View and manage medical departments
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/doctor-hospitals"
            className="group p-4 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">
                  Doctor-Hospital Overview
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  View doctors by hospital
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/affiliate-withdrawals"
            className="group p-4 border border-gray-200 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all hover:shadow-md"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Manage Affiliate</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Process affiliate withdrawal requests
                </p>
              </div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  );
}
