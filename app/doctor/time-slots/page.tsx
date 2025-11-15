"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, Trash2, Plus } from "lucide-react";

const timeSlotSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  slotDuration: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(15, "Slot duration must be at least 15 minutes").optional()
  ),
});

type TimeSlotFormValues = z.infer<typeof timeSlotSchema>;

interface TimeSlot {
  _id: string;
  date: string;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isAvailable: boolean;
  isBooked: boolean;
}

export default function TimeSlotsPage() {
  const [user, setUser] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TimeSlotFormValues>({
    resolver: zodResolver(timeSlotSchema) as any,
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
      fetchDoctorAndSlots();
    }
  }, [user, selectedDate]);

  const fetchDoctorAndSlots = async () => {
    try {
      const doctorsResponse = await fetch("/api/doctors");
      const doctorsData = await doctorsResponse.json();
      
      if (doctorsData.doctors) {
        const foundDoctor = doctorsData.doctors.find(
          (d: any) => d.phoneNumber === user.phoneNumber
        );
        
        if (foundDoctor) {
          setDoctor(foundDoctor);
          
          // Fetch time slots
          const url = selectedDate
            ? `/api/doctor/time-slots?doctorId=${foundDoctor._id}&date=${selectedDate}`
            : `/api/doctor/time-slots?doctorId=${foundDoctor._id}`;
          
          const slotsResponse = await fetch(url);
          const slotsData = await slotsResponse.json();
          
          if (slotsData.timeSlots) {
            setTimeSlots(slotsData.timeSlots);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TimeSlotFormValues) => {
    if (!doctor) return;
    
    setIsCreating(true);
    try {
      const response = await fetch("/api/doctor/time-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId: doctor._id,
          startDate: data.startDate,
          endDate: data.endDate,
          startTime: data.startTime,
          endTime: data.endTime,
          slotDuration: data.slotDuration || doctor.slotDuration || 30,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(`Successfully created ${result.timeSlots?.length || 0} time slots!`);
        reset();
        fetchDoctorAndSlots();
      } else {
        alert(result.error || "Failed to create time slots");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm("Are you sure you want to delete this time slot?")) return;
    if (!doctor) return;

    try {
      const response = await fetch(
        `/api/doctor/time-slots?slotId=${slotId}&doctorId=${doctor._id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Time slot deleted successfully");
        fetchDoctorAndSlots();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete time slot");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };

  const handleDeleteDateSlots = async (date: string) => {
    if (!confirm(`Are you sure you want to delete all slots for ${date}?`)) return;
    if (!doctor) return;

    try {
      const response = await fetch(
        `/api/doctor/time-slots?doctorId=${doctor._id}&date=${date}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Time slots deleted successfully");
        fetchDoctorAndSlots();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete time slots");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
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
        <h1 className="text-3xl font-bold text-gray-900">Time Slots</h1>
        <Card className="p-12 text-center">
          <p className="text-gray-500">Doctor profile not found.</p>
        </Card>
      </div>
    );
  }

  // Group slots by date
  const slotsByDate = timeSlots.reduce((acc: any, slot: any) => {
    const date = new Date(slot.date).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Time Slots</h1>
        <p className="text-gray-600 mt-2">Create and manage your available consultation time slots</p>
      </div>

      {/* Create Time Slots Form */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Time Slots</h2>
        <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                {...register("startDate")}
                className="mt-1"
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                {...register("endDate")}
                className="mt-1"
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500 mt-1">{errors.endDate.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                {...register("startTime")}
                className="mt-1"
              />
              {errors.startTime && (
                <p className="text-sm text-red-500 mt-1">{errors.startTime.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                {...register("endTime")}
                className="mt-1"
              />
              {errors.endTime && (
                <p className="text-sm text-red-500 mt-1">{errors.endTime.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
              <Input
                id="slotDuration"
                type="number"
                {...register("slotDuration")}
                placeholder={doctor.slotDuration?.toString() || "30"}
                min="15"
                step="15"
                className="mt-1"
              />
              {errors.slotDuration && (
                <p className="text-sm text-red-500 mt-1">{errors.slotDuration.message}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Default: {doctor.slotDuration || 30} minutes. Minimum: 15 minutes
              </p>
            </div>
          </div>

          <Button type="submit" disabled={isCreating}>
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? "Creating..." : "Create Time Slots"}
          </Button>
        </form>
      </Card>

      {/* Filter by Date */}
      <div className="flex items-center gap-4">
        <Label htmlFor="filterDate">Filter by Date:</Label>
        <Input
          id="filterDate"
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-48"
        />
        {selectedDate && (
          <Button
            variant="outline"
            onClick={() => setSelectedDate("")}
          >
            Clear Filter
          </Button>
        )}
      </div>

      {/* Time Slots List */}
      <div className="space-y-4">
        {Object.keys(slotsByDate).length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No time slots found. Create some time slots to get started.</p>
          </Card>
        ) : (
          Object.entries(slotsByDate).map(([date, slots]: [string, any]) => (
            <Card key={date} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </h3>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteDateSlots(date)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete All
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {slots.map((slot: any) => (
                  <div
                    key={slot._id}
                    className={`p-3 rounded-lg border ${
                      slot.isBooked
                        ? "bg-red-50 border-red-200"
                        : slot.isAvailable
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4" />
                          <span className="font-medium">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {slot.isBooked
                            ? "Booked"
                            : slot.isAvailable
                            ? "Available"
                            : "Unavailable"}
                        </p>
                      </div>
                      {!slot.isBooked && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSlot(slot._id)}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

