"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/navbar";
import { ArrowLeft, Calendar, Clock, MapPin, User, Phone, Loader2 } from "lucide-react";
import Link from "next/link";

interface Doctor {
  _id: string;
  name: string;
  qualification: string;
  hospital?: string;
  availability: Array<{
    days: string[];
    startTime: string;
    endTime: string;
    chamber?: string;
  }>;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const banglaDays = ["সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার", "রবিবার"];
const banglaMonths = [
  "জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন",
  "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"
];

// Convert English number to Bengali
const toBengaliNumber = (num: number): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().split("").map(digit => bengaliDigits[parseInt(digit)]).join("");
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
  const [selectedChamber, setSelectedChamber] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [existingAppointments, setExistingAppointments] = useState<string[]>([]);

  // Form data
  const [patientName, setPatientName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [patientType, setPatientType] = useState<"old" | "new" | "report">("new");

  useEffect(() => {
    if (doctorId) {
      fetchDoctor();
      fetchAppointments();
    }
  }, [doctorId]);

  const fetchDoctor = async () => {
    try {
      const response = await fetch(`/api/doctors/${doctorId}`);
      const data = await response.json();
      if (response.ok && data.doctor) {
        setDoctor(data.doctor);
        // Set first chamber as default
        const availabilityArray = Array.isArray(data.doctor.availability)
          ? data.doctor.availability
          : [data.doctor.availability];
        if (availabilityArray.length > 0 && availabilityArray[0].chamber) {
          setSelectedChamber(availabilityArray[0].chamber);
        }
      }
    } catch (error) {
      console.error("Error fetching doctor:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
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
  };

  // Get available chambers from doctor's availability
  const getAvailableChambers = () => {
    if (!doctor) return [];
    const availabilityArray = Array.isArray(doctor.availability)
      ? doctor.availability
      : [doctor.availability];
    const chambers = availabilityArray
      .map((slot) => slot.chamber)
      .filter((chamber): chamber is string => !!chamber);
    return Array.from(new Set(chambers));
  };

  // Get available days for selected chamber
  const getAvailableDays = (): string[] => {
    if (!doctor || !selectedChamber) return [];
    const availabilityArray = Array.isArray(doctor.availability)
      ? doctor.availability
      : [doctor.availability];
    const slot = availabilityArray.find((s) => s.chamber === selectedChamber);
    return slot ? slot.days : [];
  };

  // Check if date is available
  const isDateAvailable = (date: Date): boolean => {
    const dayName = getDayName(date);
    const availableDays = getAvailableDays();
    if (!availableDays.includes(dayName)) return false;

    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;

    // Check if date is already booked
    const dateStr = date.toISOString().split('T')[0];
    if (existingAppointments.includes(dateStr)) return false;

    return true;
  };

  // Generate calendar days
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

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
    if (isDateAvailable(date)) {
      setSelectedDate(date);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChamber || !selectedDate) {
      alert("Please select a chamber and date");
      return;
    }

    setSubmitting(true);
    try {
      const userData = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const user = userData ? JSON.parse(userData) : null;

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId,
          patientName,
          mobileNumber,
          gender: gender || undefined,
          age: age ? parseInt(age) : undefined,
          patientType,
          chamberName: selectedChamber,
          appointmentDate: selectedDate.toISOString(),
          userId: user?._id || user?.id || undefined,
        }),
      });

      const data = await response.json();
      if (response.ok && data.appointment) {
        // Save appointment to localStorage as backup
        if (typeof window !== "undefined") {
          localStorage.setItem("lastAppointment", JSON.stringify(data.appointment));
        }
        // Redirect to success page with appointment ID
        router.push(`/doctor/${doctorId}/book/success?appointmentId=${data.appointment._id}`);
      } else {
        alert(data.error || "Failed to book appointment");
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  const changeMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
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

  const availableChambers = getAvailableChambers();
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
                <span style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                  ফিরে যান
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Calendar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chamber Selection */}
            <Card className="p-6 bg-gradient-to-br from-white to-blue-50 border-2 border-primary/20 shadow-xl">
              <h2
                className="text-2xl font-bold text-gray-900 mb-5"
                style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
              >
                চেম্বার নির্বাচন করুন
              </h2>
              <div className="space-y-3">
                {availableChambers.length > 0 ? (
                  availableChambers.map((chamber, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedChamber(chamber)}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        selectedChamber === chamber
                          ? "bg-primary text-white border-primary shadow-lg"
                          : "bg-white border-primary/20 hover:border-primary/50"
                      }`}
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-5 w-5" />
                        <span className="font-semibold text-lg">{chamber}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                    কোন চেম্বার পাওয়া যায়নি
                  </p>
                )}
              </div>
            </Card>

            {/* Calendar */}
            {selectedChamber && (
              <Card className="p-6 bg-gradient-to-br from-white to-green-50 border-2 border-primary/20 shadow-xl">
                <h2
                  className="text-2xl font-bold text-gray-900 mb-5"
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                >
                  তারিখ নির্বাচন করুন
                </h2>

                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => changeMonth(-1)}
                    className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-primary" />
                  </button>
                  <h3
                    className="text-xl font-bold text-gray-900"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    {banglaMonths[currentMonthIndex]} {toBengaliNumber(currentYear)}
                  </h3>
                  <button
                    onClick={() => changeMonth(1)}
                    className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-primary rotate-180" />
                  </button>
                </div>

                {/* Calendar Days Header */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {banglaDays.map((day, index) => (
                    <div
                      key={index}
                      className="text-center font-semibold text-gray-700 py-2"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={index} className="aspect-square" />;
                    }

                    const isAvailable = isDateAvailable(date);
                    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                    const isToday = date.toDateString() === new Date().toDateString();

                    return (
                      <button
                        key={index}
                        onClick={() => handleDateSelect(date)}
                        disabled={!isAvailable}
                        className={`aspect-square rounded-lg transition-all font-semibold ${
                          isSelected
                            ? "bg-primary text-white shadow-lg scale-105"
                            : isAvailable
                            ? "bg-white hover:bg-primary/10 text-gray-900 border-2 border-primary/20 hover:border-primary/50"
                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        } ${isToday ? "ring-2 ring-primary/50" : ""}`}
                        style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                      >
                        {toBengaliNumber(date.getDate())}
                      </button>
                    );
                  })}
                </div>

                {selectedDate && (
                  <div className="mt-6 p-4 bg-primary/10 rounded-xl border-2 border-primary/20">
                    <p
                      className="text-lg font-semibold text-gray-900"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                    >
                      নির্বাচিত তারিখ: {getBengaliDay(getDayName(selectedDate))}, {toBengaliNumber(selectedDate.getDate())} {banglaMonths[selectedDate.getMonth()]}, {toBengaliNumber(selectedDate.getFullYear())}
                    </p>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Right Column - Form */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-white to-amber-50 border-2 border-primary/20 shadow-xl">
              <h2
                className="text-2xl font-bold text-gray-900 mb-5"
                style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
              >
                রোগীর তথ্য
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="patientName" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                    রোগীর নাম *
                  </Label>
                  <Input
                    id="patientName"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    required
                    placeholder="রোগীর নাম লিখুন"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="mobileNumber" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                    মোবাইল নম্বর *
                  </Label>
                  <Input
                    id="mobileNumber"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    required
                    placeholder="মোবাইল নম্বর লিখুন"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="gender" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                    লিঙ্গ
                  </Label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                  >
                    <option value="">লিঙ্গ নির্বাচন করুন</option>
                    <option value="male">পুরুষ</option>
                    <option value="female">মহিলা</option>
                    <option value="other">অন্যান্য</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="age" style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                    বয়স
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="বয়স লিখুন"
                    className="mt-1"
                    min="0"
                  />
                </div>

                <div>
                  <Label style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                    রোগীর ধরন *
                  </Label>
                  <div className="mt-2 space-y-2">
                    {[
                      { value: "new", label: "নতুন রোগী" },
                      { value: "old", label: "পুরাতন রোগী" },
                      { value: "report", label: "রিপোর্ট দেখানো" },
                    ].map((type) => (
                      <label
                        key={type.value}
                        className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all hover:bg-primary/5"
                        style={{
                          borderColor: patientType === type.value ? "rgb(239 68 68)" : "rgb(229 231 235)",
                          backgroundColor: patientType === type.value ? "rgb(254 242 242)" : "white",
                        }}
                      >
                        <input
                          type="radio"
                          name="patientType"
                          value={type.value}
                          checked={patientType === type.value}
                          onChange={(e) => setPatientType(e.target.value as "old" | "new" | "report")}
                          className="w-4 h-4 text-primary"
                        />
                        <span style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}>
                          {type.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!selectedChamber || !selectedDate || submitting}
                  className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-3 shadow-lg hover:shadow-xl transition-all"
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      বুক করা হচ্ছে...
                    </>
                  ) : (
                    "অ্যাপয়েন্টমেন্ট বুক করুন"
                  )}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

