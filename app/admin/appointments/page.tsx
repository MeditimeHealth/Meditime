"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Phone, MapPin, Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    qualification?: string;
    department?: string;
    hospital?: string;
  };
  patientName: string;
  mobileNumber: string;
  gender?: string;
  age?: number;
  patientType: 'old' | 'new' | 'report';
  chamberName: string;
  appointmentDate: string;
  appointmentTime?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  userId?: {
    _id: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const banglaMonths = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

const banglaDays = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];

// Convert English number to Bengali
const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().split("").map(digit => bengaliDigits[parseInt(digit)]).join("");
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDay();
  const dayNum = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  return `${banglaDays[day]}, ${toBengaliNumber(dayNum)} ${banglaMonths[month]}, ${toBengaliNumber(year)}`;
};

const getStatusBadge = (status: string) => {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    confirmed: "bg-green-100 text-green-800 border-green-300",
    cancelled: "bg-red-100 text-red-800 border-red-300",
    completed: "bg-blue-100 text-blue-800 border-blue-300",
  };

  const labels = {
    pending: "অপেক্ষমান",
    confirmed: "নিশ্চিত",
    cancelled: "বাতিল",
    completed: "সম্পন্ন",
  };

  const icons = {
    pending: AlertCircle,
    confirmed: CheckCircle,
    cancelled: XCircle,
    completed: CheckCircle,
  };

  const Icon = icons[status as keyof typeof icons] || AlertCircle;

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border-2 ${styles[status as keyof typeof styles] || styles.pending}`}
      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
    >
      <Icon className="h-4 w-4" />
      {labels[status as keyof typeof labels] || status}
    </span>
  );
};

const getPatientTypeLabel = (type: string) => {
  const labels = {
    old: "পুরাতন রোগী",
    new: "নতুন রোগী",
    report: "রিপোর্ট দেখানো",
  };
  return labels[type as keyof typeof labels] || type;
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const url = filter !== "all" ? `/api/appointments?status=${filter}` : "/api/appointments";
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok && data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchAppointments();
      } else {
        alert("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">Manage patient appointments</p>
        </div>
        <Card className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1
          className="text-3xl font-bold text-gray-900"
          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
        >
          অ্যাপয়েন্টমেন্ট
        </h1>
        <p
          className="text-gray-600 mt-2"
          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
        >
          রোগীর অ্যাপয়েন্টমেন্ট পরিচালনা করুন
        </p>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "all", label: "সব" },
          { value: "pending", label: "অপেক্ষমান" },
          { value: "confirmed", label: "নিশ্চিত" },
          { value: "cancelled", label: "বাতিল" },
          { value: "completed", label: "সম্পন্ন" },
        ].map((filterOption) => (
          <Button
            key={filterOption.value}
            onClick={() => setFilter(filterOption.value)}
            variant={filter === filterOption.value ? "default" : "outline"}
            className={filter === filterOption.value ? "bg-primary text-white" : ""}
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            {filterOption.label}
          </Button>
        ))}
      </div>

      {appointments.length === 0 ? (
        <Card className="p-12 text-center">
          <p
            className="text-gray-500 text-lg"
            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
          >
            কোন অ্যাপয়েন্টমেন্ট পাওয়া যায়নি
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {appointments.map((appointment) => (
            <Card key={appointment._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className="text-xl font-bold text-gray-900 mb-1"
                        style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                      >
                        {appointment.patientName}
                      </h3>
                      <p
                        className="text-gray-600"
                        style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                      >
                        {appointment.doctorId?.name || "Unknown Doctor"}
                      </p>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">মোবাইল নম্বর</p>
                        <p
                          className="font-semibold text-gray-900"
                          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                        >
                          {appointment.mobileNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">তারিখ</p>
                        <p
                          className="font-semibold text-gray-900"
                          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                        >
                          {formatDate(appointment.appointmentDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">চেম্বার</p>
                        <p
                          className="font-semibold text-gray-900"
                          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                        >
                          {appointment.chamberName}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-primary shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">রোগীর ধরন</p>
                        <p
                          className="font-semibold text-gray-900"
                          style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                        >
                          {getPatientTypeLabel(appointment.patientType)}
                        </p>
                      </div>
                    </div>

                    {appointment.age && (
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-primary shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">বয়স</p>
                          <p
                            className="font-semibold text-gray-900"
                            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                          >
                            {toBengaliNumber(appointment.age)} বছর
                          </p>
                        </div>
                      </div>
                    )}

                    {appointment.gender && (
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-primary shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">লিঙ্গ</p>
                          <p
                            className="font-semibold text-gray-900"
                            style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                          >
                            {appointment.gender === "male" ? "পুরুষ" : appointment.gender === "female" ? "মহিলা" : "অন্যান্য"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Doctor Info */}
                  {appointment.doctorId && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-500 mb-1">ডাক্তার তথ্য</p>
                      <p
                        className="font-semibold text-gray-900"
                        style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                      >
                        {appointment.doctorId.qualification && `${appointment.doctorId.qualification}, `}
                        {appointment.doctorId.department && `${appointment.doctorId.department}, `}
                        {appointment.doctorId.hospital && appointment.doctorId.hospital}
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {appointment.status === "pending" && (
                  <div className="flex flex-col gap-2 md:min-w-[200px]">
                    <Button
                      onClick={() => updateStatus(appointment._id, "confirmed")}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      নিশ্চিত করুন
                    </Button>
                    <Button
                      onClick={() => updateStatus(appointment._id, "cancelled")}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      বাতিল করুন
                    </Button>
                  </div>
                )}
                {appointment.status === "confirmed" && (
                  <div className="flex flex-col gap-2 md:min-w-[200px]">
                    <Button
                      onClick={() => updateStatus(appointment._id, "completed")}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      সম্পন্ন করুন
                    </Button>
                    <Button
                      onClick={() => updateStatus(appointment._id, "cancelled")}
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      বাতিল করুন
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
