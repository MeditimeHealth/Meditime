"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2, MapPin, Phone, Trash2, Edit } from "lucide-react";
import { showToast } from "@/lib/toast";

interface Hospital {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  thana?: {
    _id: string;
    name: string;
    district?: {
      _id: string;
      name: string;
      division?: {
        _id: string;
        name: string;
      };
    };
  };
}

export default function HospitalsListPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchHospitals();
  }, [page]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/locations/hospitals?page=${page}&limit=20`);
      const data = await response.json();
      
      if (response.ok) {
        if (page === 1) {
          setHospitals(data.hospitals || []);
        } else {
          setHospitals(prev => [...prev, ...(data.hospitals || [])]);
        }
        setHasMore(data.hasMore || false);
        setTotal(data.total || 0);
      } else {
        showToast.error(data.error || "Failed to fetch hospitals");
      }
    } catch (error) {
      console.error("Error fetching hospitals:", error);
      showToast.error("Failed to fetch hospitals");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const response = await fetch(`/api/locations/hospitals/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setHospitals(hospitals.filter((hospital) => hospital._id !== id));
        setTotal(prev => prev - 1);
        showToast.success("Hospital deleted successfully");
      } else {
        const data = await response.json();
        showToast.error(data.error || "Failed to delete hospital");
      }
    } catch (error) {
      console.error("Error deleting hospital:", error);
      showToast.error("Failed to delete hospital");
    }
  };

  const getFullLocation = (hospital: Hospital) => {
    const parts = [];
    if (hospital.thana?.name) parts.push(hospital.thana.name);
    if (hospital.thana?.district?.name) parts.push(hospital.thana.district.name);
    if (hospital.thana?.district?.division?.name) parts.push(hospital.thana.district.division.name);
    return parts.join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Hospitals</h1>
          <p className="text-gray-600 mt-2">
            Manage hospital information ({total} total)
          </p>
        </div>
        <Link href="/admin/hospitals/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Hospital
          </Button>
        </Link>
      </div>

      {loading && page === 1 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading hospitals...</div>
        </div>
      ) : hospitals.length === 0 ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No hospitals found</p>
          <Link href="/admin/hospitals/create">
            <Button>Add First Hospital</Button>
          </Link>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hospitals.map((hospital) => (
              <Card key={hospital._id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Building2 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {hospital.name}
                        </h3>
                        {getFullLocation(hospital) && (
                          <div className="flex items-start gap-1 mt-1">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-600">
                              {getFullLocation(hospital)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {hospital.address && (
                    <div className="flex items-start gap-2">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Address:</span> {hospital.address}
                      </div>
                    </div>
                  )}

                  {hospital.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-600">{hospital.phone}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-gray-100">
                    <Link href={`/admin/hospitals/${hospital._id}/edit`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleDelete(hospital._id, hospital.name)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => setPage(prev => prev + 1)}
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
