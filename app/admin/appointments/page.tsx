"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ticket,
  X,
  Stethoscope,
  ExternalLink,
} from "lucide-react";

interface Appointment {
  _id: string;
  doctorId: {
    _id: string;
    name: string;
    nameBn?: string;
    qualification?: string;
    qualificationBn?: string;
    department?: string;
    availability?: Array<{
      days: string[];
      daysBn?: string[];
      time?: string;
      timeBn?: string;
      hospital: string;
    }>;
  };
  serialNumber?: string;
  patientName: string;
  mobileNumber: string;
  gender?: string;
  age?: number;
  patientType: "old" | "new" | "report";
  hospitalName: string;
  appointmentDate: string;
  appointmentTime?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  userId?: {
    _id: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
  };
  affiliateCode?: string;
  createdAt: string;
  updatedAt: string;
}

const banglaMonths = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];

const banglaDays = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];

// Convert English number to Bengali
const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => bengaliDigits[parseInt(digit)])
    .join("");
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
  const [showSerialModal, setShowSerialModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [serialNumber, setSerialNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const url =
        filter !== "all"
          ? `/api/appointments?status=${filter}`
          : "/api/appointments";
      const response = await fetch(url);
      const data = await response.json();
      if (response.ok && data.appointments) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const updateStatus = async (
    appointmentId: string,
    newStatus: string,
    serial?: string,
  ) => {
    try {
      const body: any = { status: newStatus };
      if (serial) {
        body.serialNumber = serial;
      }

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        fetchAppointments(false);
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || "Failed to update status",
        };
      }
    } catch (error) {
      console.error("Error updating status:", error);
      return { success: false, error: "Failed to update status" };
    }
  };

  // Clear completed appointments (history)
  const handleClearHistory = async () => {
    setClearing(true);
    try {
      // Get all completed appointments and delete them one by one
      // Use the existing bulk delete endpoint with clearAll=false, but for 'completed' only
      // We'll delete all completed appointments
      const completedIds = appointments
        .filter(a => a.status === 'completed')
        .map(a => a._id);
      
      await Promise.all(
        completedIds.map(id =>
          fetch(`/api/appointments/${id}`, { method: 'DELETE' })
        )
      );

      setAppointments(prev => prev.filter(a => a.status !== 'completed'));
      setShowClearConfirm(false);
    } catch {
      alert('সম্পন্ন অ্যাপয়েন্টমেন্ট মুছতে সমস্যা হয়েছে।');
    } finally {
      setClearing(false);
    }
  };

  // Open serial modal for confirmation
  const handleConfirmClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSerialNumber("");
    setError("");
    setShowSerialModal(true);
  };

  // Submit confirmation with serial number
  const handleConfirmWithSerial = async () => {
    if (!selectedAppointment) return;

    if (!serialNumber.trim()) {
      setError("সিরিয়াল নম্বর দিন");
      return;
    }

    setSubmitting(true);
    setError("");

    const result = await updateStatus(
      selectedAppointment._id,
      "confirmed",
      serialNumber.trim(),
    );

    if (result.success) {
      setShowSerialModal(false);
      setSelectedAppointment(null);
      setSerialNumber("");
    } else {
      setError(result.error || "Failed to confirm appointment");
    }

    setSubmitting(false);
  };

  // Cancel appointment (no serial needed)
  const handleCancelAppointment = async (appointmentId: string) => {
    const result = await updateStatus(appointmentId, "cancelled");
    if (!result.success) {
      alert(result.error || "Failed to cancel appointment");
    }
  };

  // Complete appointment
  const handleCompleteAppointment = async (appointmentId: string) => {
    const result = await updateStatus(appointmentId, "completed");
    if (!result.success) {
      alert(result.error || "Failed to complete appointment");
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
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1
            className="text-3xl font-bold text-gray-900"

          >
            অ্যাপয়েন্টমেন্ট
          </h1>
          <p
            className="text-gray-600 mt-2"

          >
            রোগীর অ্যাপয়েন্টমেন্ট পরিচালনা করুন
          </p>
        </div>
        <Button
          onClick={() => setShowClearConfirm(true)}
          variant="outline"
          className="border-red-300 text-red-600 hover:bg-red-50 flex items-center gap-2 self-start mt-1"
        >
          <XCircle className="h-4 w-4" />
          সম্পন্ন হিস্ট্রি মুছুন
        </Button>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: "pending", label: "অপেক্ষমান" },
          { value: "confirmed", label: "নিশ্চিত" },
          { value: "completed", label: "সম্পন্ন" },
          { value: "all", label: "সব" },
        ].map((filterOption) => (
          <Button
            key={filterOption.value}
            onClick={() => setFilter(filterOption.value)}
            variant={filter === filterOption.value ? "default" : "outline"}
            className={
              filter === filterOption.value ? "bg-primary text-white" : ""
            }

          >
            {filterOption.label}
          </Button>
        ))}
      </div>

      {appointments.length === 0 ? (
        <Card className="p-12 text-center">
          <p
            className="text-gray-500 text-lg"

          >
            কোন অ্যাপয়েন্টমেন্ট পাওয়া যায়নি
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {appointments.map((appointment) => (
            <Card
              key={appointment._id}
              className="overflow-hidden hover:shadow-lg transition-shadow border-gray-200"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
                {/* Patient Section */}
                <div className="p-6 bg-white">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                    <User className="h-5 w-5 text-primary" />
                    <h4
                      className="font-bold text-lg text-gray-800"

                    >
                      রোগীর তথ্য
                    </h4>
                  </div>

                  <div className="space-y-4">
                    <div>
                      {/* <div className="flex justify-between">
                        <p className="text-sm text-gray-500 mb-1">রোগীর নাম</p>
                        {appointment.affiliateCode && (
                          <div className="flex items-center gap-2 text-purple-600 bg-purple-50 p-2 rounded border border-purple-100">
                            <Ticket className="h-4 w-4" />
                            <span className="text-xs">
                              রেফারেল:{" "}
                              <strong>{appointment.affiliateCode}</strong>
                            </span>
                          </div>
                        )}
                      </div> */}

                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-500 mb-1">রোগীর নাম</p>

                        {appointment.affiliateCode ? (
                          <Link
                            href={`/admin/affiliate-management?code=${appointment.affiliateCode}`}
                            className="flex items-center gap-2 text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100 hover:bg-purple-100 transition-colors"
                          >
                            <Ticket className="h-4 w-4" />
                            <span className="text-xs">
                              Affiliate:{" "}
                              <strong>{appointment.affiliateCode}</strong>
                            </span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/patients?phone=${appointment.mobileNumber}`}
                            className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100 hover:bg-green-100 transition-colors flex items-center gap-1"
                          >
                            Self
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>

                      <h3
                        className="text-xl font-bold text-gray-900"

                      >
                        {appointment.patientName}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">মোবাইল</p>
                          <a
                            href={`tel:${appointment.mobileNumber}`}
                            className="font-medium text-gray-900 hover:underline"
                          >
                            {appointment.mobileNumber}
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">রোগীর ধরন</p>
                          <p
                            className="font-medium text-gray-900"

                          >
                            {getPatientTypeLabel(appointment.patientType)}
                          </p>
                        </div>
                      </div>

                      {(appointment.age || appointment.gender) && (
                        <div className="col-span-2 flex items-start gap-2">
                          <User className="h-4 w-4 text-gray-400 mt-1" />
                          <div>
                            <p className="text-xs text-gray-500">
                              বয়স ও লিঙ্গ
                            </p>
                            <p
                              className="font-medium text-gray-900"

                            >
                              {appointment.age
                                ? `${toBengaliNumber(appointment.age)} বছর`
                                : ""}
                              {appointment.age && appointment.gender
                                ? " • "
                                : ""}
                              {appointment.gender === "male"
                                ? "পুরুষ"
                                : appointment.gender === "female"
                                  ? "মহিলা"
                                  : appointment.gender === "other"
                                    ? "অন্যান্য"
                                    : ""}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Doctor & Appointment Section */}
                <div className="p-6 bg-gray-50/50">
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-5 w-5 text-primary" />
                      <h4
                        className="font-bold text-lg text-gray-800"

                      >
                        ডাক্তার ও অ্যাপয়েন্টমেন্ট
                      </h4>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>

                  <div className="space-y-4">
                    {/* Serial Number Display - At Top */}
                    {appointment.serialNumber && (
                      <div className="flex items-center gap-2 bg-green-50 p-3 rounded-lg border border-green-200">
                        <Ticket className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-800 font-medium">
                          সিরিয়াল:
                        </span>
                        <span className="font-bold text-green-700 font-mono text-xl">
                          {appointment.serialNumber}
                        </span>
                      </div>
                    )}

                    {/* Doctor Info */}
                    <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className="font-bold text-gray-900"

                          >
                            {appointment.doctorId?.name || appointment.doctorId?.nameBn || "Unknown Doctor"}
                          </p>
                          <p
                            className="text-xs text-gray-600 mt-1"

                          >
                            {(appointment.doctorId?.qualification || appointment.doctorId?.qualificationBn) &&
                              `${appointment.doctorId.qualification || appointment.doctorId.qualificationBn}`}
                          </p>
                        </div>
                        {appointment.doctorId?._id && (
                          <Link
                            href={`/doctor/${appointment.doctorId._id}`}
                            target="_blank"
                            className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-3 py-1.5 rounded-full hover:bg-primary/20 transition-colors"
                          >
                            View Profile
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* Hospital */}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-xs text-gray-500">হাসপাতাল</p>
                        <p
                          className="font-medium text-gray-900"

                        >
                          {appointment.hospitalName}
                        </p>
                      </div>
                    </div>

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-4 w-4 text-gray-400 mt-1" />
                        <div>
                          <p className="text-xs text-gray-500">তারিখ</p>
                          <p
                            className="font-medium text-gray-900"

                          >
                            {formatDate(appointment.appointmentDate)}
                          </p>
                        </div>
                      </div>
                      {/* Appointment Time */}
                      {appointment.appointmentTime && (
                        <div className="flex items-start gap-2">
                          <Clock className="h-4 w-4 text-gray-400 mt-1" />
                          <div>
                            <p className="text-xs text-gray-500">চেম্বার সময়</p>
                            <p className="font-medium text-gray-900">
                              {appointment.appointmentTime}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Affiliate Code */}
                    {/* {appointment.affiliateCode && (
                      <div className="flex items-center gap-2 text-purple-600 bg-purple-50 p-2 rounded border border-purple-100">
                        <Ticket className="h-4 w-4" />
                        <span className="text-xs">
                          রেফারেল: <strong>{appointment.affiliateCode}</strong>
                        </span>
                      </div>
                    )} */}

                    {/* Action Buttons */}
                    <div className="pt-2 flex gap-2">
                      {appointment.status === "pending" && (
                        <>
                          <Button
                            onClick={() => handleConfirmClick(appointment)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white h-9 text-sm"

                          >
                            নিশ্চিত করুন
                          </Button>
                          <Button
                            onClick={() =>
                              handleCancelAppointment(appointment._id)
                            }
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 h-9 text-sm"

                          >
                            বাতিল করুন
                          </Button>
                        </>
                      )}
                      {appointment.status === "confirmed" && (
                        <>
                          <Button
                            onClick={() =>
                              handleCompleteAppointment(appointment._id)
                            }
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm"

                          >
                            সম্পন্ন করুন
                          </Button>
                          <Button
                            onClick={() =>
                              handleCancelAppointment(appointment._id)
                            }
                            variant="outline"
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-50 h-9 text-sm"

                          >
                            বাতিল করুন
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Serial Number Modal */}
      {showSerialModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3
                className="text-xl font-bold text-gray-900"

              >
                সিরিয়াল নম্বর দিন
              </h3>
              <button
                onClick={() => {
                  setShowSerialModal(false);
                  setSelectedAppointment(null);
                  setSerialNumber("");
                  setError("");
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Patient Info */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-500 mb-1">রোগী</p>
              <p
                className="font-bold text-gray-900"

              >
                {selectedAppointment.patientName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                মোবাইল: {selectedAppointment.mobileNumber}
              </p>
              <p className="text-sm text-gray-600">
                ডাক্তার: {selectedAppointment.doctorId?.name}
              </p>
            </div>

            {/* Serial Input */}
            <div className="mb-6">
              <Label
                htmlFor="serialNumber"
                className="text-gray-700 mb-2 block"

              >
                সিরিয়াল নম্বর <span className="text-red-500">*</span>
              </Label>
              <Input
                id="serialNumber"
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                placeholder="যেমন: MT2411300001"
                className="text-lg font-mono uppercase"
                autoFocus
              />
              {error && (
                <p
                  className="text-red-500 text-sm mt-2"

                >
                  {error}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowSerialModal(false);
                  setSelectedAppointment(null);
                  setSerialNumber("");
                  setError("");
                }}
                variant="outline"
                className="flex-1"
                disabled={submitting}

              >
                বাতিল
              </Button>
              <Button
                onClick={handleConfirmWithSerial}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={submitting}

              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    অপেক্ষা করুন...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    নিশ্চিত করুন
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Clear Completed Appointments Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md p-6 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                সম্পন্ন হিস্ট্রি মুছুন
              </h3>
            </div>
            <p className="text-gray-600 mb-2">
              সকল <span className="font-bold text-blue-600">সম্পন্ন</span> অ্যাপয়েন্টমেন্ট স্থায়ীভাবে মুছে যাবে।
            </p>
            <p className="text-sm text-gray-400 mb-6">
              All <strong>completed</strong> appointments will be permanently deleted. Pending and confirmed appointments will remain.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowClearConfirm(false)}
                variant="outline"
                className="flex-1"
                disabled={clearing}
              >
                বাতিল
              </Button>
              <Button
                onClick={handleClearHistory}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={clearing}
              >
                {clearing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    মুছছে...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    হ্যাঁ, মুছুন
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
