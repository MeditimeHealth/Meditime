"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, User, Clock, Calendar, Phone, PhoneOff, Play, Pause, Users, Circle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { formatBDTDate, formatBDTTime, getTimeUntil } from "@/lib/time-utils";

interface Patient {
  _id: string;
  patientId: {
    _id: string;
    fullName: string;
    phoneNumber: string;
    email?: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  paymentStatus: string;
  fee: number;
  timeSlotId: {
    startTime: string;
    endTime: string;
  };
}

export default function AllPatientsPage() {
  const [user, setUser] = useState<any>(null);
  const [doctor, setDoctor] = useState<any>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [timeUntil, setTimeUntil] = useState<{ [key: string]: any }>({});
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

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
      fetchDoctorAndPatients();
    }
  }, [user]);

  useEffect(() => {
    // Update countdown every second
    const interval = setInterval(() => {
      const newTimeUntil: { [key: string]: any } = {};
      patients.forEach((patient) => {
        if (patient.status === 'paid' || patient.status === 'confirmed') {
          // Parse time string and combine with date properly
          const timeStr = patient.scheduledTime.trim().toUpperCase();
          const isPM = timeStr.includes('PM');
          const isAM = timeStr.includes('AM');
          const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
          
          if (timeMatch) {
            let hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            
            if (isPM && hours !== 12) hours += 12;
            else if (isAM && hours === 12) hours = 0;
            
            const dateStr = new Date(patient.scheduledDate).toISOString().split('T')[0];
            const scheduledDateTime = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
            newTimeUntil[patient._id] = getTimeUntil(scheduledDateTime);
          }
        }
      });
      setTimeUntil(newTimeUntil);
    }, 1000);

    return () => clearInterval(interval);
  }, [patients]);

  const fetchDoctorAndPatients = async () => {
    try {
      const doctorsResponse = await fetch("/api/doctors");
      const doctorsData = await doctorsResponse.json();
      
      if (doctorsData.doctors) {
        const foundDoctor = doctorsData.doctors.find(
          (d: any) => d.phoneNumber === user.phoneNumber
        );
        
        if (foundDoctor) {
          setDoctor(foundDoctor);
          
          // Fetch only paid/confirmed consultations
          const consultationsResponse = await fetch(
            `/api/doctor/consultations?doctorId=${foundDoctor._id}`
          );
          const consultationsData = await consultationsResponse.json();
          
          if (consultationsResponse.ok && consultationsData.consultations) {
            // Filter only paid/confirmed consultations
            const paidPatients = consultationsData.consultations.filter(
              (c: Patient) => c.paymentStatus === 'paid' && (c.status === 'paid' || c.status === 'confirmed')
            );
            setPatients(paidPatients);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getPatientStatus = (patient: Patient) => {
    const timeStr = patient.scheduledTime.trim().toUpperCase();
    const isPM = timeStr.includes('PM');
    const isAM = timeStr.includes('AM');
    const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
    
    if (!timeMatch) return 'unknown';
    
    let hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    
    if (isPM && hours !== 12) hours += 12;
    else if (isAM && hours === 12) hours = 0;
    
    const dateStr = new Date(patient.scheduledDate).toISOString().split('T')[0];
    const scheduledDateTime = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
    const now = new Date();
    const tenMinutesBefore = new Date(scheduledDateTime.getTime() - 10 * 60 * 1000);
    
    if (now >= scheduledDateTime) {
      return 'live';
    } else if (now >= tenMinutesBefore) {
      return 'waiting';
    } else {
      return 'upcoming';
    }
  };

  const formatCountdown = (time: any) => {
    if (!time || time.total <= 0) {
      return "Starting now";
    }
    if (time.days > 0) {
      return `${time.days}d ${time.hours}h`;
    }
    if (time.hours > 0) {
      return `${time.hours}h ${time.minutes}m`;
    }
    return `${time.minutes}m ${time.seconds}s`;
  };

  const handleAcceptConsultation = async (consultationId: string) => {
    setAcceptingId(consultationId);
    try {
      const response = await fetch(`/api/consultation/${consultationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept' }),
      });

      const data = await response.json();
      if (response.ok) {
        // Update the patient status in the local state
        setPatients(prevPatients => 
          prevPatients.map(p => 
            p._id === consultationId 
              ? { ...p, status: 'confirmed' }
              : p
          )
        );
        // Redirect to consultation room
        window.location.href = `/consultation/${consultationId}`;
      } else {
        console.error('Failed to accept consultation:', data);
        alert(data.error || `Failed to accept consultation. ${data.id ? `ID: ${data.id}` : ''}`);
      }
    } catch (error) {
      console.error('Error accepting consultation:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setAcceptingId(null);
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
        <h1 className="text-3xl font-bold text-gray-900">All Patients</h1>
        <Card className="p-12 text-center">
          <p className="text-gray-500">Doctor profile not found.</p>
        </Card>
      </div>
    );
  }

  // Sort patients: live first, then waiting, then upcoming
  const sortedPatients = [...patients].sort((a, b) => {
    const statusA = getPatientStatus(a);
    const statusB = getPatientStatus(b);
    
    const priority: { [key: string]: number } = {
      'live': 1,
      'waiting': 2,
      'upcoming': 3,
      'unknown': 4,
    };
    
    return (priority[statusA] || 99) - (priority[statusB] || 99);
  });

  const livePatients = sortedPatients.filter(p => getPatientStatus(p) === 'live');
  const waitingPatients = sortedPatients.filter(p => getPatientStatus(p) === 'waiting');
  const upcomingPatients = sortedPatients.filter(p => getPatientStatus(p) === 'upcoming');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Patients</h1>
          <p className="text-gray-600 mt-2">Manage your paid customers and consultations</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Total Patients</p>
            <p className="text-2xl font-bold text-gray-900">{patients.length}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Live Now</p>
              <p className="text-2xl font-bold text-red-600">{livePatients.length}</p>
            </div>
            <Circle className="h-8 w-8 text-red-600 animate-pulse fill-red-600" />
          </div>
        </Card>
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Waiting</p>
              <p className="text-2xl font-bold text-yellow-600">{waitingPatients.length}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-blue-600">{upcomingPatients.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Live Patients */}
      {livePatients.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Circle className="h-5 w-5 text-red-600 animate-pulse fill-red-600" />
            Live Consultations ({livePatients.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {livePatients.map((patient) => {
              const status = getPatientStatus(patient);
              const countdown = timeUntil[patient._id];
              
              return (
                <Card 
                  key={patient._id} 
                  className={`p-4 border-2 ${
                    selectedPatient === patient._id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-primary/50'
                  } transition-all cursor-pointer`}
                  onClick={() => setSelectedPatient(patient._id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {patient.patientId.fullName}
                          </h3>
                          <p className="text-xs text-gray-500">{patient.patientId.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                        <Circle className="h-3 w-3 animate-pulse fill-red-800" />
                        LIVE
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatBDTDate(patient.scheduledDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatBDTTime(patient.scheduledTime)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="h-3 w-3" />
                        Fee: ৳{patient.fee}
                      </div>
                    </div>
                    
                    <Link href={`/consultation/${patient._id}`}>
                      <Button className="w-full" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Join Consultation
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Waiting Patients */}
      {waitingPatients.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Waiting Room ({waitingPatients.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waitingPatients.map((patient) => {
              const status = getPatientStatus(patient);
              const countdown = timeUntil[patient._id];
              
              return (
                <Card 
                  key={patient._id} 
                  className={`p-4 border-2 ${
                    selectedPatient === patient._id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-primary/50'
                  } transition-all cursor-pointer`}
                  onClick={() => setSelectedPatient(patient._id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {patient.patientId.fullName}
                          </h3>
                          <p className="text-xs text-gray-500">{patient.patientId.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                        <Clock className="h-3 w-3" />
                        WAITING
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatBDTDate(patient.scheduledDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatBDTTime(patient.scheduledTime)}
                      </div>
                      <div className="bg-yellow-50 px-2 py-1 rounded text-xs">
                        Starts in: <span className="font-semibold text-yellow-700">{formatCountdown(countdown)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptConsultation(patient._id);
                        }}
                        disabled={acceptingId === patient._id}
                      >
                        {acceptingId === patient._id ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Now
                          </>
                        )}
                      </Button>
                      <Link href={`/consultation/${patient._id}`} className="flex-1">
                        <Button className="w-full" size="sm" variant="outline">
                          <Video className="h-4 w-4 mr-2" />
                          Join
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Upcoming Patients */}
      {upcomingPatients.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Upcoming Consultations ({upcomingPatients.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingPatients.map((patient) => {
              const countdown = timeUntil[patient._id];
              
              return (
                <Card 
                  key={patient._id} 
                  className={`p-4 border-2 ${
                    selectedPatient === patient._id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-gray-200 hover:border-primary/50'
                  } transition-all cursor-pointer`}
                  onClick={() => setSelectedPatient(patient._id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {patient.patientId.fullName}
                          </h3>
                          <p className="text-xs text-gray-500">{patient.patientId.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        <Calendar className="h-3 w-3" />
                        UPCOMING
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatBDTDate(patient.scheduledDate)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatBDTTime(patient.scheduledTime)}
                      </div>
                      <div className="bg-blue-50 px-2 py-1 rounded text-xs">
                        Starts in: <span className="font-semibold text-blue-700">{formatCountdown(countdown)}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        size="sm"
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptConsultation(patient._id);
                        }}
                        disabled={acceptingId === patient._id}
                      >
                        {acceptingId === patient._id ? (
                          <>
                            <Clock className="h-4 w-4 mr-2 animate-spin" />
                            Accepting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Accept Now
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 italic text-center">
                      Or wait for scheduled time
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {patients.length === 0 && (
        <Card className="p-12 text-center">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No patients found</p>
          <p className="text-gray-400 text-sm">Paid consultations will appear here</p>
        </Card>
      )}
    </div>
  );
}

