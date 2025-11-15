"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Users, Calendar, Download, BarChart3 } from "lucide-react";
import { formatBDTDate } from "@/lib/time-utils";

export default function DoctorReportsPage() {
  const [user, setUser] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

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
      fetchDoctorAndStats();
    }
  }, [user, dateRange]);

  const fetchDoctorAndStats = async () => {
    try {
      const doctorsResponse = await fetch("/api/doctors");
      const doctorsData = await doctorsResponse.json();
      
      if (doctorsData.doctors) {
        const foundDoctor = doctorsData.doctors.find(
          (d: any) => d.phoneNumber === user.phoneNumber
        );
        
        if (foundDoctor) {
          setDoctor(foundDoctor);
          
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
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    // Create a simple text report
    const report = `
DOCTOR CONSULTATION REPORT
==========================
Doctor: ${doctor?.name || 'N/A'}
Specialty: ${doctor?.specialty || 'N/A'}
Report Date: ${new Date().toLocaleDateString()}

FINANCIAL SUMMARY
-----------------
Total Revenue: ৳${stats?.totalRevenue.toFixed(2) || '0.00'}
Revenue (Last 30 days): ৳${stats?.recentRevenue.toFixed(2) || '0.00'}
Completed Revenue: ৳${stats?.completedRevenue.toFixed(2) || '0.00'}

CONSULTATION STATISTICS
-----------------------
Total Consultations: ${stats?.totalConsultations || 0}
Completed: ${stats?.completedConsultations || 0}
Waiting: ${stats?.waitingConsultations || 0}
Booked: ${stats?.bookedConsultations || 0}
Pending Payment: ${stats?.pendingConsultations || 0}
Cancelled: ${stats?.cancelledConsultations || 0}
Recent (30 days): ${stats?.recentConsultations || 0}

TIME SLOT STATISTICS
--------------------
Total Slots: ${stats?.totalSlots || 0}
Available Slots: ${stats?.availableSlots || 0}
Booked Slots: ${stats?.bookedSlots || 0}
    `.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doctor-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!doctor || !stats) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        <Card className="p-12 text-center">
          <p className="text-gray-500">Doctor profile not found.</p>
        </Card>
      </div>
    );
  }

  const completionRate = stats.totalConsultations > 0 
    ? ((stats.completedConsultations / stats.totalConsultations) * 100).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">View detailed statistics and reports</p>
        </div>
        <Button onClick={handleExportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Financial Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Financial Summary</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              ৳{stats.totalRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">All time</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600">Last 30 Days</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              ৳{stats.recentRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">{stats.recentConsultations} consultations</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600">Completed Revenue</p>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              ৳{stats.completedRevenue.toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">From completed consultations</p>
          </div>
        </div>
      </Card>

      {/* Consultation Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Consultation Statistics</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Total Consultations</span>
              <span className="font-bold text-gray-900">{stats.totalConsultations}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <span className="text-gray-600">Completed</span>
              <span className="font-bold text-green-600">{stats.completedConsultations}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
              <span className="text-gray-600">Waiting</span>
              <span className="font-bold text-yellow-600">{stats.waitingConsultations}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
              <span className="text-gray-600">Booked</span>
              <span className="font-bold text-blue-600">{stats.bookedConsultations}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
              <span className="text-gray-600">Pending Payment</span>
              <span className="font-bold text-orange-600">{stats.pendingConsultations}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded">
              <span className="text-gray-600">Cancelled</span>
              <span className="font-bold text-red-600">{stats.cancelledConsultations}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-bold text-primary">{completionRate}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold text-gray-900">Time Slot Statistics</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <span className="text-gray-600">Total Slots</span>
              <span className="font-bold text-gray-900">{stats.totalSlots}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
              <span className="text-gray-600">Available</span>
              <span className="font-bold text-blue-600">{stats.availableSlots}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <span className="text-gray-600">Booked</span>
              <span className="font-bold text-green-600">{stats.bookedSlots}</span>
            </div>
            <div className="p-4 bg-primary/5 rounded-lg mt-4">
              <p className="text-sm text-gray-600">Booking Rate</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {stats.totalSlots > 0 
                  ? ((stats.bookedSlots / stats.totalSlots) * 100).toFixed(1)
                  : '0'}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-gray-900">Recent Activity (Last 30 Days)</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-primary/5 rounded-lg">
            <p className="text-sm text-gray-600">Consultations</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {stats.recentConsultations}
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600">Revenue</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              ৳{stats.recentRevenue.toFixed(2)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

