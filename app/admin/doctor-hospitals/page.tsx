"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, MapPin, Phone, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface Doctor {
  _id: string;
  name: string;
  qualification: string;
  specialty?: string;
  phoneNumber?: string;
}

interface Hospital {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  doctors: Doctor[];
  thana?: {
    name: string;
    district?: {
      name: string;
      division?: {
        name: string;
      };
    };
  };
}

export default function DoctorHospitalPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedHospitals, setExpandedHospitals] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all doctors
      const doctorsRes = await fetch("/api/doctors");
      const doctorsData = await doctorsRes.json();
      
      if (doctorsData.doctors) {
        setDoctors(doctorsData.doctors);
        
        // Group doctors by hospital
        const hospitalMap = new Map<string, Hospital>();
        
        doctorsData.doctors.forEach((doctor: any) => {
          if (doctor.hospital) {
            const hospitalName = doctor.hospital;
            
            if (!hospitalMap.has(hospitalName)) {
              hospitalMap.set(hospitalName, {
                _id: hospitalName,
                name: hospitalName,
                doctors: [],
                address: undefined,
                thana: doctor.thana ? {
                  name: doctor.thana,
                  district: doctor.district ? {
                    name: doctor.district,
                    division: doctor.division ? {
                      name: doctor.division
                    } : undefined
                  } : undefined
                } : undefined
              });
            }
            
            hospitalMap.get(hospitalName)?.doctors.push({
              _id: doctor._id,
              name: doctor.name,
              qualification: doctor.qualification,
              specialty: doctor.specialty,
              phoneNumber: doctor.phoneNumber
            });
          }
        });
        
        setHospitals(Array.from(hospitalMap.values()));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleHospital = (hospitalId: string) => {
    setExpandedHospitals(prev => {
      const newSet = new Set(prev);
      if (newSet.has(hospitalId)) {
        newSet.delete(hospitalId);
      } else {
        newSet.add(hospitalId);
      }
      return newSet;
    });
  };

  const getFullLocation = (hospital: Hospital) => {
    const parts = [];
    if (hospital.thana?.name) parts.push(hospital.thana.name);
    if (hospital.thana?.district?.name) parts.push(hospital.thana.district.name);
    if (hospital.thana?.district?.division?.name) parts.push(hospital.thana.district.division.name);
    return parts.join(", ");
  };

  const doctorsWithoutHospital = doctors.filter(d => !d.hospital);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor-Hospital Overview</h1>
          <p className="text-gray-600 mt-2">
            View which doctors work at which hospitals
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/hospitals/create">
            <Button variant="outline">
              <Building2 className="h-4 w-4 mr-2" />
              Add Hospital
            </Button>
          </Link>
          <Link href="/admin/doctors/create">
            <Button>
              <Users className="h-4 w-4 mr-2" />
              Add Doctor
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Hospitals</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{hospitals.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Doctors</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{doctors.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Without Hospital</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{doctorsWithoutHospital.length}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Hospitals with Doctors */}
          {hospitals.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Hospitals & Their Doctors</h2>
              <div className="space-y-4">
                {hospitals.map((hospital) => (
                  <Card key={hospital._id} className="overflow-hidden">
                    <div
                      className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleHospital(hospital._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Building2 className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
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
                            {hospital.address && (
                              <p className="text-sm text-gray-600 mt-1">
                                {hospital.address}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm text-gray-500">
                                {hospital.doctors.length} {hospital.doctors.length === 1 ? 'doctor' : 'doctors'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          {expandedHospitals.has(hospital._id) ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {expandedHospitals.has(hospital._id) && (
                      <div className="border-t border-gray-200 bg-gray-50 p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {hospital.doctors.map((doctor) => (
                            <div
                              key={doctor._id}
                              className="p-4 bg-white border border-gray-200 rounded-lg"
                            >
                              <h4 className="font-medium text-gray-900">{doctor.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{doctor.qualification}</p>
                              {doctor.specialty && (
                                <p className="text-sm text-gray-500 mt-1">{doctor.specialty}</p>
                              )}
                              {doctor.phoneNumber && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  <p className="text-xs text-gray-600">{doctor.phoneNumber}</p>
                                </div>
                              )}
                              <Link href={`/admin/doctors/edit/${doctor._id}`}>
                                <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Doctors without Hospital */}
          {doctorsWithoutHospital.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Doctors Without Hospital Assignment
              </h2>
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {doctorsWithoutHospital.map((doctor) => (
                    <div
                      key={doctor._id}
                      className="p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                    >
                      <h4 className="font-medium text-gray-900">{doctor.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{doctor.qualification}</p>
                      {doctor.specialty && (
                        <p className="text-sm text-gray-500 mt-1">{doctor.specialty}</p>
                      )}
                      <Link href={`/admin/doctors/edit/${doctor._id}`}>
                        <Button variant="outline" size="sm" className="mt-3 w-full">
                          Assign Hospital
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {hospitals.length === 0 && doctors.length === 0 && (
            <Card className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No hospitals or doctors found</p>
              <div className="flex gap-3 justify-center">
                <Link href="/admin/hospitals/create">
                  <Button variant="outline">Add Hospital</Button>
                </Link>
                <Link href="/admin/doctors/create">
                  <Button>Add Doctor</Button>
                </Link>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
