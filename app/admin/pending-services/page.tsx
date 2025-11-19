"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Droplet, Car } from "lucide-react";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

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
  isApproved: boolean;
  userId?: string;
  createdAt: string;
}

interface Ambulance {
  _id: string;
  name: string;
  phoneNumber: string;
  division?: string;
  district?: string;
  thana?: string;
  availabilityStatus: string;
  vehicleType: string;
  isApproved: boolean;
  userId?: string;
  createdAt: string;
}

export default function PendingServicesPage() {
  const [bloodDonors, setBloodDonors] = useState<BloodDonor[]>([]);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPendingServices();
  }, []);

  const fetchPendingServices = async () => {
    try {
      setLoading(true);
      const [donorsRes, ambulancesRes] = await Promise.all([
        fetch("/api/blood-donors?admin=true"),
        fetch("/api/ambulances?admin=true"),
      ]);

      const [donorsData, ambulancesData] = await Promise.all([
        donorsRes.json(),
        ambulancesRes.json(),
      ]);

      // Filter only pending (not approved) services
      const pendingDonors = donorsData.bloodDonors?.filter((d: BloodDonor) => !d.isApproved) || [];
      const pendingAmbulances = ambulancesData.ambulances?.filter((a: Ambulance) => !a.isApproved) || [];

      setBloodDonors(pendingDonors);
      setAmbulances(pendingAmbulances);
    } catch (error) {
      console.error("Error fetching pending services:", error);
      showToast.error("Failed to load pending services");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (type: "bloodDonor" | "ambulance", id: string) => {
    try {
      setProcessing(id);
      const endpoint = type === "bloodDonor" ? `/api/blood-donors/${id}` : `/api/ambulances/${id}`;
      
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved: true }),
      });

      if (response.ok) {
        showToast.success(`${type === "bloodDonor" ? "Blood donor" : "Ambulance"} approved successfully!`);
        fetchPendingServices();
      } else {
        const result = await response.json();
        showToast.error(result.error || "Failed to approve");
      }
    } catch (error) {
      showToast.error("An error occurred. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (type: "bloodDonor" | "ambulance", id: string) => {
    if (!confirm(`Are you sure you want to reject this ${type === "bloodDonor" ? "blood donor" : "ambulance"}?`)) {
      return;
    }

    try {
      setProcessing(id);
      const endpoint = type === "bloodDonor" ? `/api/blood-donors/${id}` : `/api/ambulances/${id}`;
      
      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast.success(`${type === "bloodDonor" ? "Blood donor" : "Ambulance"} rejected and removed.`);
        fetchPendingServices();
      } else {
        const result = await response.json();
        showToast.error(result.error || "Failed to reject");
      }
    } catch (error) {
      showToast.error("An error occurred. Please try again.");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending Services</h1>
        <p className="text-gray-600 mt-2">Review and approve pending blood donor and ambulance service requests</p>
      </div>

      {/* Pending Blood Donors */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Droplet className="h-6 w-6 text-red-500" />
          Pending Blood Donors ({bloodDonors.length})
        </h2>
        {bloodDonors.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No pending blood donor requests
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bloodDonors.map((donor) => (
              <Card key={donor._id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{donor.name}</h3>
                      <p className="text-sm text-gray-600">{donor.phoneNumber}</p>
                      {donor.email && (
                        <p className="text-sm text-gray-600">{donor.email}</p>
                      )}
                    </div>
                    {donor.photo && (
                      <img
                        src={donor.photo}
                        alt={donor.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Blood Group:</span>{" "}
                      <span className="text-red-600 font-semibold">{donor.bloodGroup}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> {donor.availabilityStatus}
                    </p>
                    {donor.division && (
                      <p className="text-sm">
                        <span className="font-medium">Location:</span> {donor.division}
                        {donor.district && `, ${donor.district}`}
                        {donor.thana && `, ${donor.thana}`}
                      </p>
                    )}
                    {donor.lastDonationDate && (
                      <p className="text-sm">
                        <span className="font-medium">Last Donation:</span>{" "}
                        {new Date(donor.lastDonationDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove("bloodDonor", donor._id)}
                      disabled={processing === donor._id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processing === donor._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleReject("bloodDonor", donor._id)}
                      disabled={processing === donor._id}
                      variant="destructive"
                      className="flex-1"
                    >
                      {processing === donor._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pending Ambulances */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Car className="h-6 w-6 text-blue-500" />
          Pending Ambulance Services ({ambulances.length})
        </h2>
        {ambulances.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No pending ambulance service requests
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ambulances.map((ambulance) => (
              <Card key={ambulance._id} className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg">{ambulance.name}</h3>
                    <p className="text-sm text-gray-600">{ambulance.phoneNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">Vehicle Type:</span> {ambulance.vehicleType}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Status:</span> {ambulance.availabilityStatus}
                    </p>
                    {ambulance.division && (
                      <p className="text-sm">
                        <span className="font-medium">Location:</span> {ambulance.division}
                        {ambulance.district && `, ${ambulance.district}`}
                        {ambulance.thana && `, ${ambulance.thana}`}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove("ambulance", ambulance._id)}
                      disabled={processing === ambulance._id}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {processing === ambulance._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleReject("ambulance", ambulance._id)}
                      disabled={processing === ambulance._id}
                      variant="destructive"
                      className="flex-1"
                    >
                      {processing === ambulance._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

