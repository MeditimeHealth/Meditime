"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Doctor {
  _id: string;
  name: string;
  specialty?: string;
  qualification: string;
  currentPosition?: string;
  experience: number;
  phoneNumber?: string;
  consultationFee: number;
  slotDuration?: number;
  availability: Array<{
    days: string[];
    startTime: string;
    endTime: string;
    chamber?: string;
  }> | {
    days: string[];
    startTime: string;
    endTime: string;
  };
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors");
      const data = await response.json();
      if (response.ok) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const response = await fetch(`/api/doctors/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Remove doctor from list
        setDoctors(doctors.filter((doctor) => doctor._id !== id));
        alert("Doctor deleted successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete doctor");
      }
    } catch (error) {
      console.error("Error deleting doctor:", error);
      alert("Failed to delete doctor");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Doctors</h1>
          <p className="text-gray-600 mt-2">Manage doctor profiles</p>
        </div>
        <Link href="/admin/doctors/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Doctor
          </Button>
        </Link>
      </div>

      {doctors.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No doctors found</p>
          <Link href="/admin/doctors/create">
            <Button>Create First Doctor</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor._id} className="p-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                  </div>
                  {doctor.specialty && (
                    <p className="text-sm text-gray-600">{doctor.specialty}</p>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Qualification: </span>
                    <span className="text-gray-900">
                      {doctor.currentPosition 
                        ? `${doctor.currentPosition}, ${doctor.qualification}`
                        : doctor.qualification}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Experience: </span>
                    <span className="text-gray-900">{doctor.experience} years</span>
                  </div>
                  {doctor.phoneNumber && (
                    <div>
                      <span className="text-gray-600">Phone: </span>
                      <span className="text-gray-900">{doctor.phoneNumber}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Consultation Fee: </span>
                    <span className="text-gray-900">৳{doctor.consultationFee}</span>
                  </div>
                  {doctor.slotDuration && (
                    <div>
                      <span className="text-gray-600">Slot Duration: </span>
                      <span className="text-gray-900">{doctor.slotDuration} minutes</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Availability: </span>
                    <span className="text-gray-900">
                      {Array.isArray(doctor.availability)
                        ? doctor.availability.map((slot, idx) => {
                            const slots = doctor.availability as Array<{days: string[]; startTime: string; endTime: string}>;
                            return (
                              <span key={idx}>
                                {slot.days.join(", ")} ({slot.startTime} - {slot.endTime})
                                {idx < slots.length - 1 ? "; " : ""}
                              </span>
                            );
                          })
                        : `${doctor.availability.days.join(", ")} (${doctor.availability.startTime} - ${doctor.availability.endTime})`}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Link href={`/admin/doctors/edit/${doctor._id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      Edit
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleDelete(doctor._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

