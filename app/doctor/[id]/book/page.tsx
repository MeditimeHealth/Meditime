"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ArrowLeft, MapPin, Loader2, RotateCcw, Ticket, Building2 } from "lucide-react";
import Link from "next/link";
import { showToast } from "@/lib/toast";

interface Doctor {
  _id: string;
  name: string;
  nameBn?: string;
  specialty?: string;
  specialtyBn?: string;
  qualification: string;
  qualificationBn?: string;
  designation?: string;
  designationBn?: string;
  hospital?: string;
  image?: string;
  availability: Array<{
    days: string[];
    startTime: string;
    endTime: string;
  }>;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const banglaDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const banglaMonths = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Convert English number to Bengali
// Convert English number to Bengali (Now returns English)
const toBengaliNumber = (num: number): string => {
  return num.toString();
};

// Get Bengali day name
const getBengaliDay = (day: string): string => {
  const dayIndex = daysOfWeek.indexOf(day);
  return dayIndex >= 0 ? banglaDays[dayIndex] : day;
};

// Get day name from date
const getDayName = (date: Date): string => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return days[date.getDay()];
};

export default function BookAppointmentPage() {
  const params = useParams();
  const router = useRouter();
  const doctorId = params?.id as string;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [existingAppointments, setExistingAppointments] = useState<string[]>([]);
  const [latestAvailableDates, setLatestAvailableDates] = useState<Date[]>([]);

  // Form data
  const [patientName, setPatientName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [patientType, setPatientType] = useState<"old" | "new" | "report">("new");
  const [affiliateCode, setAffiliateCode] = useState("");

  const fetchDoctor = useCallback(async () => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}`);
      const data = await response.json();
      if (response.ok && data.doctor) {
        setDoctor(data.doctor);
      }
    } catch (error) {
      console.error("Error fetching doctor:", error);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  const fetchAppointments = useCallback(async () => {
    try {
      const response = await fetch(`/api/appointments?doctorId=${doctorId}`);
      const data = await response.json();
      if (response.ok && data.appointments) {
        // Store booked dates
        const bookedDates = data.appointments
          .filter((apt: any) => apt.status !== 'cancelled')
          .map((apt: any) => {
            const date = new Date(apt.appointmentDate);
            return date.toISOString().split('T')[0];
          });
        setExistingAppointments(bookedDates);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  }, [doctorId]);

  // Get available days from doctor's availability (all slots combined)
  const getAvailableDays = useCallback((): string[] => {
    if (!doctor) return [];
    const availabilityArray = Array.isArray(doctor.availability)
      ? doctor.availability
      : [doctor.availability];

    // Combine all days from all availability slots
    const allDays = new Set<string>();
    availabilityArray.forEach((slot) => {
      if (slot?.days) {
        slot.days.forEach((day: string) => allDays.add(day));
      }
    });
    return Array.from(allDays);
  }, [doctor]);

  // Helper function to get date string in YYYY-MM-DD format
  const getDateString = (date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get all available dates and update latest 2
  const updateLatestAvailableDates = useCallback(() => {
    if (!doctor) {
      setLatestAvailableDates([]);
      return;
    }

    const availableDays = getAvailableDays();
    if (availableDays.length === 0) {
      setLatestAvailableDates([]);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate available dates for the next 30 days
    const allAvailableDates: Date[] = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      date.setHours(0, 0, 0, 0);
      const dayName = getDayName(date);

      // Check if date is not in the past and matches available days
      if (date >= today && availableDays.includes(dayName)) {
        const dateStr = getDateString(date);
        // Check if date is not already booked
        if (!existingAppointments.includes(dateStr)) {
          allAvailableDates.push(date);
        }
      }
    }

    // Sort dates and take only the latest 2 (first 2 available dates)
    const sortedDates = allAvailableDates.sort((a, b) => a.getTime() - b.getTime());
    const latestTwo = sortedDates.slice(0, 2);
    // Ensure we only set maximum 2 dates
    setLatestAvailableDates(latestTwo.length > 2 ? latestTwo.slice(0, 2) : latestTwo);
  }, [doctor, existingAppointments, getAvailableDays]);

  useEffect(() => {
    if (doctorId) {
      fetchDoctor();
      fetchAppointments();
    }
  }, [doctorId, fetchDoctor, fetchAppointments]);

  // Auto-populate user data from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.fullName) {
            setPatientName(user.fullName);
          }
          if (user.phoneNumber) {
            setMobileNumber(user.phoneNumber);
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  // Update latest available dates when doctor or appointments change
  useEffect(() => {
    if (doctor) {
      updateLatestAvailableDates();
    }
  }, [doctor, existingAppointments, updateLatestAvailableDates]);

  // Check if date is in the first 2 available dates (can be booked)
  const isDateAvailable = useCallback((date: Date): boolean => {
    if (latestAvailableDates.length === 0) return false;

    const dateStr = getDateString(date);

    // Only return true if date is in the latestAvailableDates array (first 2)
    return latestAvailableDates.some((availableDate) => {
      return getDateString(availableDate) === dateStr;
    });
  }, [latestAvailableDates]);

  // Check if date matches doctor's schedule and is not booked (to show all available dates)
  const isDateInSchedule = useCallback((date: Date): boolean => {
    if (!doctor) return false;

    const availableDays = getAvailableDays();
    if (availableDays.length === 0) return false;

    const dayName = getDayName(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);

    // Check if date matches schedule and is not booked
    if (dateToCheck >= today && availableDays.includes(dayName)) {
      const dateStr = getDateString(date);
      const isBooked = existingAppointments.includes(dateStr);
      return !isBooked;
    }

    return false;
  }, [doctor, existingAppointments, getAvailableDays]);

  // Check if date matches doctor's schedule but is not in first 2 available dates
  const isDateInScheduleButNotAvailable = useCallback((date: Date): boolean => {
    const isInSchedule = isDateInSchedule(date);
    const isAvailable = isDateAvailable(date);
    // It's in schedule but not in the first 2 available dates
    return isInSchedule && !isAvailable;
  }, [isDateInSchedule, isDateAvailable]);

  // Generate calendar days
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7;

    const days: (Date | null)[] = [];
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = getDateString(date);

    const isInLatestTwo = latestAvailableDates.some((availableDate) => {
      return getDateString(availableDate) === dateStr;
    });

    if (isInLatestTwo) {
      setSelectedDate(date);
    } else {
      // Show toast notification if trying to select a date that's not in the latest 2
      showToast.error("You can only book the latest 2 available dates");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor?.hospital || !selectedDate) {
      alert("Please select a date");
      return;
    }

    setSubmitting(true);
    try {
      const userData = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const user = userData ? JSON.parse(userData) : null;

      // Save booking data to localStorage and go to checkout page
      const checkoutData = {
        doctorId: doctor?._id || doctorId,
        doctorSlug: doctorId,
        doctor: {
          _id: doctor._id,
          name: doctor.name,
          nameBn: doctor.nameBn,
          specialty: doctor.specialty,
          specialtyBn: doctor.specialtyBn,
          qualification: doctor.qualification,
          qualificationBn: doctor.qualificationBn,
          designation: doctor.designation,
          designationBn: doctor.designationBn,
          hospital: doctor.hospital,
          image: doctor.image,
          availability: doctor.availability,
        },
        patientName,
        mobileNumber,
        gender: gender || undefined,
        age: age ? parseInt(age) : undefined,
        patientType,
        hospitalName: doctor.hospital,
        appointmentDate: selectedDate.toISOString(),
        userId: user?._id || user?.id || undefined,
        affiliateCode: affiliateCode || undefined,
      };

      if (typeof window !== "undefined") {
        localStorage.setItem("pendingBooking", JSON.stringify(checkoutData));
      }

      router.push(`/doctor/${doctorId}/book/checkout`);
    } catch (error) {
      console.error("Error preparing checkout:", error);
      alert("Something went wrong, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const changeMonth = (direction: number) => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    const proposed = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
    // Only allow current month and next month
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    if (proposed >= currentMonthStart && proposed <= nextMonth) {
      setCurrentMonth(proposed);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Doctor not found</p>
            <Link href="/doctor">
              <Button>Back to Doctors</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const calendarDays = getCalendarDays();
  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="bg-gradient-to-r from-gray-50 to-white border-b-2 border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href={`/doctor/${doctorId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span >
                  ফিরে যান
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Hospital Info & Calendar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hospital Info Display */}
            <Card className="p-6 bg-gradient-to-br from-white to-blue-50 border-2 border-primary/20 shadow-xl">
              <h2
                className="text-2xl font-bold text-gray-900 mb-5"

              >
                হাসপাতাল
              </h2>
              <div className="relative">
                {doctor.hospital ? (
                  <div className="p-4 bg-primary text-white rounded-xl border-2 border-primary shadow-lg">
                    <p className="text-lg font-semibold flex items-center gap-2" >
                      <Building2 className="h-5 w-5" />
                      {doctor.hospital}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500 p-4 bg-gray-50 rounded-xl" >
                    কোন হাসপাতাল নির্ধারিত নেই
                  </p>
                )}
              </div>
              {/* {doctor.hospital && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-green-700 font-medium flex items-center gap-2" >
                    <MapPin className="h-4 w-4" />
                    অ্যাপয়েন্টমেন্ট হবে: {doctor.hospital}
                  </p>
                </div>
              )} */}
            </Card>

            {/* Calendar */}
            {doctor.hospital && (
              <Card className="p-6 bg-gradient-to-br from-white to-green-50 border-2 border-primary/20 shadow-xl">
                <h2
                  className="text-2xl font-bold text-gray-900 mb-5"

                >
                  Select Date
                </h2>

                {/* Calendar - smaller on desktop, larger text */}
                <div className="max-w-md mx-auto lg:max-w-full">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => changeMonth(-1)}
                      className="p-2 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-30"
                      disabled={currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()}
                    >
                      <ArrowLeft className="h-5 w-5 text-primary" />
                    </button>
                    <h3
                      className="text-lg lg:text-xl font-bold text-gray-900"

                    >
                      {banglaMonths[currentMonthIndex]} {toBengaliNumber(currentYear)}
                    </h3>
                    <button
                      onClick={() => changeMonth(1)}
                      className="p-2 rounded-lg hover:bg-primary/10 transition-colors disabled:opacity-30"
                      disabled={(() => { const n = new Date(); return currentMonth.getMonth() === n.getMonth() + 1 || (currentMonth.getMonth() === 11 && n.getMonth() === 10); })()}
                    >
                      <ArrowLeft className="h-5 w-5 text-primary rotate-180" />
                    </button>
                  </div>

                  {/* Unselect Date Button */}
                  {selectedDate && (
                    <div className="mb-3 flex justify-end">
                      <button
                        onClick={() => setSelectedDate(null)}
                        className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 transition-colors"

                      >
                        ✕ তারিখ বাতিল করুন
                      </button>
                    </div>
                  )}

                  {/* Calendar Days Header */}
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {banglaDays.map((day, index) => (
                      <div
                        key={index}
                        className="text-center font-semibold text-gray-700 py-1 text-sm lg:text-base"

                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((date, index) => {
                      if (!date) {
                        return <div key={index} className="aspect-square" />;
                      }

                      const isAvailable = isDateAvailable(date);
                      const isInScheduleButNotAvailable = isDateInScheduleButNotAvailable(date);
                      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                      const isToday = date.toDateString() === new Date().toDateString();

                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (isAvailable) {
                              handleDateSelect(date);
                            } else if (isInScheduleButNotAvailable) {
                              showToast.error("Please select from the first 2 available dates");
                            }
                          }}
                          disabled={!isAvailable}
                          className={`aspect-square rounded-full transition-all font-semibold flex items-center justify-center text-sm lg:text-base ${isSelected
                              ? "text-white shadow-lg scale-110 ring-4 ring-orange-300"
                              : isAvailable
                                ? "bg-primary text-white border-2 border-primary hover:bg-primary/90 hover:shadow-md hover:scale-105"
                                : isInScheduleButNotAvailable
                                  ? "bg-blue-100 text-blue-700 border-2 border-blue-300 cursor-not-allowed opacity-75"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            } ${isToday && !isSelected && !isAvailable ? "ring-2 ring-gray-400" : ""}`}
                          style={{
                            backgroundColor: isSelected ? "#ff5e29" : undefined
                          }}
                        >
                          {toBengaliNumber(date.getDate())}
                        </button>
                      );
                    })}
                  </div>

                  {selectedDate && (
                    <div className="mt-5 p-4 bg-primary/10 rounded-xl border-2 border-primary/20">
                      <p
                        className="text-base font-semibold text-gray-900"

                      >
                        Selected Date: {getDayName(selectedDate)}, {selectedDate.getDate()} {banglaMonths[selectedDate.getMonth()]}, {selectedDate.getFullYear()}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Form */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-white to-amber-50 border-2 border-primary/20 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2
                  className="text-2xl font-bold text-gray-900"

                >
                  রোগীর তথ্য
                </h2>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPatientName("");
                    setMobileNumber("");
                    setGender("");
                    setAge("");
                    setPatientType("new");
                    setAffiliateCode("");
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-primary hover:border-primary"

                >
                  <RotateCcw className="h-4 w-4" />
                  মুছুন
                </Button>
              </div>

              {/* Required fields notice */}
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 flex items-center gap-2" >
                  <span className="text-red-500 font-bold">*</span>
                  চিহ্নিত ঘরগুলো অবশ্যই পূরণ করতে হবে
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Patient Name - Required */}
                <div>
                  <Label htmlFor="patientName" className="flex items-center gap-1" >
                    রোগীর নাম <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                    placeholder="রোগীর নাম লিখুন"
                    className={`mt-1 border-2 ${!patientName ? 'border-red-300 bg-red-50/50' : 'border-green-300 bg-green-50/30'}`}
                  />
                </div>

                {/* Mobile Number - Required */}
                <div>
                  <Label htmlFor="mobileNumber" className="flex items-center gap-1" >
                    মোবাইল নম্বর <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                    placeholder="মোবাইল নম্বর লিখুন"
                    className={`mt-1 border-2 ${!mobileNumber ? 'border-red-300 bg-red-50/50' : 'border-green-300 bg-green-50/30'}`}
                  />
                </div>

                {/* Gender - Optional */}
                <div>
                  <Label htmlFor="gender" >
                    লিঙ্গ
                  </Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white"

                  >
                    <option value="">লিঙ্গ নির্বাচন করুন</option>
                    <option value="male">পুরুষ</option>
                    <option value="female">মহিলা</option>

                  </select>
                </div>

                {/* Age - Optional */}
                <div>
                  <Label htmlFor="age" >
                    বয়স
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="বয়স লিখুন"
                    className="mt-1 border-2 border-gray-200"
                    min="0"
                  />
                </div>

                {/* Affiliate Code - with Serial Input Option */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200">
                  <Label htmlFor="affiliateCode" className="flex items-center gap-2 text-purple-700" >
                    <Ticket className="h-4 w-4" />
                    সিরিয়াল/অ্যাফিলিয়েট কোড (ঐচ্ছিক)
                  </Label>
                  <Input
                    id="affiliateCode"
                    value={affiliateCode}
                    onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
                    placeholder="সিরিয়াল বা অ্যাফিলিয়েট কোড লিখুন"
                    className="mt-2 border-2 border-purple-300 focus:border-purple-500 bg-white"
                  />
                  <p className="mt-2 text-xs text-purple-600" >
                    রেফারেল কোড থাকলে এখানে লিখুন
                  </p>
                </div>

                {/* Patient Type - Required */}
                <div>
                  <Label className="flex items-center gap-1" >
                    রোগীর ধরন <span className="text-red-500 font-bold">*</span>
                  </Label>
                  <div className="mt-2 space-y-2">
                    {[
                      { value: "new", label: "নতুন রোগী" },
                      { value: "old", label: "পুরাতন রোগী" },
                      { value: "report", label: "রিপোর্ট দেখানো" },
                    ].map((type) => (
                      <label
                        key={type.value}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-primary/5 ${patientType === type.value
                            ? "border-primary bg-primary/10 shadow-sm"
                            : "border-gray-200 bg-white"
                          }`}
                      >
                        <input
                          type="radio"
                          name="patientType"
                          value={type.value}
                          checked={patientType === type.value}
                          onChange={(e) => setPatientType(e.target.value as "old" | "new" | "report")}
                          className="w-4 h-4 text-primary accent-primary"
                        />
                        <span >
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Validation Warning */}
                {(!doctor.hospital || !selectedDate) && (
                  <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                    <p className="text-sm text-yellow-700" >
                      {!doctor.hospital && "⚠️ হাসপাতাল নির্ধারিত নেই"}
                      {!doctor.hospital && !selectedDate && " এবং "}
                      {!selectedDate && "⚠️ তারিখ নির্বাচন করুন"}
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={!doctor.hospital || !selectedDate || !patientName || !mobileNumber || submitting}
                  className="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-orange-600 hover:to-primary text-white font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"

                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      অপেক্ষা করুন...
                    </>
                  ) : (
                    "পরবর্তী ধাপ →"
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
