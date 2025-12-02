"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Hospital, Users, Calendar, DollarSign, Plus, Building2, UserPlus } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalHospitals: 0,
    totalAppointments: 0,
    totalPatients: 0,
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
      const hospitalsRes = await fetch("/api/locations/hospitals?limit=1");
      const hospitalsData = await hospitalsRes.json();
      
      // Fetch appointments count
      const appointmentsRes = await fetch("/api/appointments");
      const appointmentsData = await appointmentsRes.json();

      setStats({
        totalDoctors: doctorsData.doctors?.length || 0,
        totalHospitals: hospitalsData.total || 0,
        totalAppointments: appointmentsData.appointments?.length || 0,
        totalPatients: 0, // You can add patient API later
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
        <p className="text-gray-600 mt-2">Welcome to the Medi Time admin panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "..." : stats.totalDoctors}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Hospitals</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "..." : stats.totalHospitals}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Appointments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "..." : stats.totalAppointments}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Patients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? "..." : stats.totalPatients}
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <p className="text-sm text-gray-600 mt-1">Add a new doctor profile to the system</p>
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
                <p className="text-sm text-gray-600 mt-1">View and edit existing doctor profiles</p>
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
                <p className="text-sm text-gray-600 mt-1">View and manage all hospitals</p>
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
                <h3 className="font-medium text-gray-900">Doctor-Hospital Overview</h3>
                <p className="text-sm text-gray-600 mt-1">View doctors by hospital</p>
              </div>
            </div>
          </Link>

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
                <p className="text-sm text-gray-600 mt-1">Manage all appointment bookings</p>
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
                <h3 className="font-medium text-gray-900">Manage Departments</h3>
                <p className="text-sm text-gray-600 mt-1">View and manage medical departments</p>
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
                <h3 className="font-medium text-gray-900">Affiliate Withdrawals</h3>
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

