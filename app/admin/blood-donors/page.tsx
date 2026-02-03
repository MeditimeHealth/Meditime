"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Image from "next/image";

interface BloodDonor {
  _id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  bloodGroup: string;
  division?: string;
  district?: string;
  thana?: string;
  photo?: string;
  availabilityStatus: string;
  lastDonationDate?: string;
}

export default function BloodDonorsPage() {
  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBloodDonors();
  }, []);

  const fetchBloodDonors = async () => {
    try {
      const response = await fetch("/api/blood-donors");
      const data = await response.json();
      if (response.ok) {
        setBloodDonors(data.bloodDonors);
      }
    } catch (error) {
      console.error("Error fetching blood donors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blood donor?")) return;

    try {
      const response = await fetch(`/api/blood-donors/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBloodDonors(bloodDonors.filter((donor) => donor._id !== id));
        alert("Blood donor deleted successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete blood donor");
      }
    } catch (error) {
      console.error("Error deleting blood donor:", error);
      alert("Failed to delete blood donor");
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
          <h1 className="text-3xl font-bold text-gray-900">All Blood Donors</h1>
          <p className="text-gray-600 mt-2">Manage blood donor profiles</p>
        </div>
        <Link href="/admin/blood-donors/create">
          <Button className="cursor-pointer">
            <Plus className="h-4 w-4 mr-2" />
            Create Blood Donor
          </Button>
        </Link>
      </div>

      {bloodDonors.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No blood donors found</p>
          <Link href="/admin/blood-donors/create">
            <Button>Create First Blood Donor</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bloodDonors.map((donor) => (
            <Card key={donor._id} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-gray-200">
                    {donor.photo ? (
                      <Image
                        src={donor.photo}
                        alt={donor.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold text-lg">
                        {donor.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-gray-900 truncate">
                      {donor.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Blood Group:{" "}
                      <span className="font-semibold text-primary">
                        {donor.bloodGroup}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Phone: </span>
                    <span className="text-gray-900">{donor.phoneNumber}</span>
                  </div>
                  {donor.email && (
                    <div>
                      <span className="text-gray-600">Email: </span>
                      <span className="text-gray-900">{donor.email}</span>
                    </div>
                  )}
                  {(donor.division || donor.district || donor.thana) && (
                    <div>
                      <span className="text-gray-600">Location: </span>
                      <span className="text-gray-900">
                        {[donor.division, donor.district, donor.thana]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Status: </span>
                    <span
                      className={`font-medium ${
                        donor.availabilityStatus === "Available"
                          ? "text-green-600"
                          : donor.availabilityStatus === "Recently Donated"
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {donor.availabilityStatus}
                    </span>
                  </div>
                  {donor.lastDonationDate && (
                    <div>
                      <span className="text-gray-600">Last Donation: </span>
                      <span className="text-gray-900">
                        {new Date(donor.lastDonationDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Link href={`/admin/blood-donors/edit/${donor._id}`} className="flex-1">
                    <Button variant="outline" className="w-full cursor-pointer">
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="flex-1 cursor-pointer"
                    onClick={() => handleDelete(donor._id)}
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
