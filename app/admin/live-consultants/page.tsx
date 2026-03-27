"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Video, Plus, Trash2, ToggleLeft, ToggleRight, Users, Clock, DollarSign, UserCheck, PhoneOff, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

interface Doctor {
  _id: string;
  name: string;
  nameBn?: string;
  specialty?: string;
  specialtyBn?: string;
  image?: string;
}

interface QueueEntry {
  _id: string;
  patientName: string;
  patientPhone: string;
  status: string;
  joinedAt: string;
  startedAt?: string;
}

interface LiveConsultant {
  _id: string;
  doctorId: Doctor;
  isLive: boolean;
  consultationFee: number;
  estimatedWaitTime: number;
  maxQueueSize: number;
  currentQueue: QueueEntry[];
  roomId: string;
  specialization?: string;
}

export default function AdminLiveConsultantsPage() {
  const { language } = useLanguage();
  const [consultants, setConsultants] = useState<LiveConsultant[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    doctorId: "",
    consultationFee: 500,
    estimatedWaitTime: 15,
    maxQueueSize: 10,
  });

  const fetchConsultants = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/live-consultants");
      const data = await res.json();
      if (res.ok) setConsultants(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await fetch("/api/doctors");
      const data = await res.json();
      if (res.ok) setDoctors(Array.isArray(data) ? data : data.doctors || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    fetchConsultants();
    fetchDoctors();
  }, [fetchConsultants, fetchDoctors]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchConsultants, 10000);
    return () => clearInterval(interval);
  }, [fetchConsultants]);

  const handleAdd = async () => {
    if (!formData.doctorId) {
      toast.error("Please select a doctor");
      return;
    }
    try {
      const res = await fetch("/api/admin/live-consultants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Live consultant added!");
        setShowAddForm(false);
        setFormData({ doctorId: "", consultationFee: 500, estimatedWaitTime: 15, maxQueueSize: 10 });
        fetchConsultants();
      } else {
        toast.error(data.error || "Failed to add");
      }
    } catch (err) {
      toast.error("Failed to add consultant");
    }
  };

  const handleToggleLive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/live-consultants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggleLive" }),
      });
      if (res.ok) {
        toast.success("Status toggled!");
        fetchConsultants();
      }
    } catch (err) {
      toast.error("Failed to toggle");
    }
  };

  const handleAcceptNext = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/live-consultants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acceptNext" }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Patient accepted!");
        fetchConsultants();
      } else {
        toast.error(data.error || "No waiting patients");
      }
    } catch (err) {
      toast.error("Failed");
    }
  };

  const handleCompleteCall = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/live-consultants/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "completeCall" }),
      });
      if (res.ok) {
        toast.success("Call completed!");
        fetchConsultants();
      }
    } catch (err) {
      toast.error("Failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this live consultant?")) return;
    try {
      const res = await fetch(`/api/admin/live-consultants/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Deleted!");
        fetchConsultants();
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const handleJoinMeeting = (roomId: string) => {
    window.open(`https://meet.jit.si/${roomId}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === "bn" ? "লাইভ কনসালটেন্ট ম্যানেজমেন্ট" : "Live Consultant Management"}
          </h1>
          <p className="text-gray-500 mt-1">
            {language === "bn" ? "ডাক্তারদের লাইভ কনসালটেশনের জন্য পরিচালনা করুন" : "Manage doctors for live video consultations"}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchConsultants} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> {language === "bn" ? "রিফ্রেশ" : "Refresh"}
          </button>
          <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition flex items-center gap-2">
            <Plus className="h-4 w-4" /> {language === "bn" ? "ডাক্তার যোগ করুন" : "Add Doctor"}
          </button>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="font-semibold text-lg">{language === "bn" ? "নতুন লাইভ কনসালটেন্ট যোগ করুন" : "Add New Live Consultant"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "ডাক্তার নির্বাচন করুন" : "Select Doctor"}</label>
              <select
                value={formData.doctorId}
                onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">{language === "bn" ? "ডাক্তার বেছে নিন..." : "Choose a doctor..."}</option>
                {doctors.map((d) => (
                  <option key={d._id} value={d._id}>
                    {language === "bn" && d.nameBn ? d.nameBn : d.name} - {language === "bn" && d.specialtyBn ? d.specialtyBn : d.specialty}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "ফি (৳)" : "Fee (৳)"}</label>
              <input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => setFormData({ ...formData, consultationFee: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "আনুমানিক অপেক্ষা (মিনিট)" : "Est. Wait (min)"}</label>
              <input
                type="number"
                value={formData.estimatedWaitTime}
                onChange={(e) => setFormData({ ...formData, estimatedWaitTime: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "সর্বোচ্চ কিউ সাইজ" : "Max Queue Size"}</label>
              <input
                type="number"
                value={formData.maxQueueSize}
                onChange={(e) => setFormData({ ...formData, maxQueueSize: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600">
              {language === "bn" ? "যোগ করুন" : "Add"}
            </button>
            <button onClick={() => setShowAddForm(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
              {language === "bn" ? "বাতিল" : "Cancel"}
            </button>
          </div>
        </div>
      )}

      {/* Consultants List */}
      {consultants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
          <Video className="h-16 w-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-600">{language === "bn" ? "কোনো লাইভ কনসালটেন্ট নেই" : "No Live Consultants Yet"}</h3>
          <p className="text-gray-400 mt-1">{language === "bn" ? "উপরের বোতাম ক্লিক করে ডাক্তার যোগ করুন" : "Click the button above to add a doctor"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {consultants.map((c) => {
            const waitingCount = c.currentQueue.filter((e) => e.status === "waiting").length;
            const inCallPatient = c.currentQueue.find((e) => e.status === "in-call");

            return (
              <div key={c._id} className="bg-white rounded-xl shadow-sm border overflow-hidden">
                {/* Doctor Header */}
                <div className={`p-4 flex items-center gap-4 ${c.isLive ? "bg-green-50 border-b border-green-100" : "bg-gray-50 border-b"}`}>
                  <div className="relative">
                    {c.doctorId?.image ? (
                      <img src={c.doctorId.image} alt={c.doctorId.name} className="w-14 h-14 rounded-full object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-xl">
                        {c.doctorId?.name?.charAt(0) || "D"}
                      </div>
                    )}
                    <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${c.isLive ? "bg-green-500" : "bg-gray-400"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {language === "bn" && c.doctorId?.nameBn ? c.doctorId.nameBn : c.doctorId?.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {language === "bn" && c.doctorId?.specialtyBn ? c.doctorId.specialtyBn : c.doctorId?.specialty}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleLive(c._id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
                      c.isLive ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {c.isLive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                    {c.isLive ? "LIVE" : "OFFLINE"}
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-0 divide-x border-b">
                  <div className="p-3 text-center">
                    <DollarSign className="h-4 w-4 mx-auto text-gray-400 mb-1" />
                    <p className="text-lg font-bold text-gray-900">৳{c.consultationFee}</p>
                    <p className="text-xs text-gray-500">{language === "bn" ? "ফি" : "Fee"}</p>
                  </div>
                  <div className="p-3 text-center">
                    <Users className="h-4 w-4 mx-auto text-gray-400 mb-1" />
                    <p className="text-lg font-bold text-gray-900">{waitingCount}/{c.maxQueueSize}</p>
                    <p className="text-xs text-gray-500">{language === "bn" ? "কিউতে" : "In Queue"}</p>
                  </div>
                  <div className="p-3 text-center">
                    <Clock className="h-4 w-4 mx-auto text-gray-400 mb-1" />
                    <p className="text-lg font-bold text-gray-900">{c.estimatedWaitTime}m</p>
                    <p className="text-xs text-gray-500">{language === "bn" ? "অপেক্ষা" : "Wait"}</p>
                  </div>
                </div>

                {/* Current Call */}
                {inCallPatient && (
                  <div className="p-3 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-blue-600">{language === "bn" ? "বর্তমান কলে:" : "Currently in Call:"}</p>
                      <p className="text-sm font-medium text-blue-900">{inCallPatient.patientName} ({inCallPatient.patientPhone})</p>
                    </div>
                    <button onClick={() => handleCompleteCall(c._id)} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs hover:bg-red-600 flex items-center gap-1">
                      <PhoneOff className="h-3 w-3" /> {language === "bn" ? "শেষ" : "End"}
                    </button>
                  </div>
                )}

                {/* Queue List */}
                {waitingCount > 0 && (
                  <div className="p-3 border-b">
                    <p className="text-xs font-medium text-gray-500 mb-2">{language === "bn" ? "অপেক্ষমাণ রোগীরা:" : "Waiting Patients:"}</p>
                    <div className="space-y-1">
                      {c.currentQueue.filter(e => e.status === 'waiting').map((entry, idx) => (
                        <div key={entry._id} className="flex justify-between items-center text-sm bg-yellow-50 rounded px-3 py-1.5">
                          <span>#{idx + 1} {entry.patientName}</span>
                          <span className="text-gray-500">{entry.patientPhone}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="p-3 flex gap-2 flex-wrap">
                  {c.isLive && (
                    <>
                      <button onClick={() => handleAcceptNext(c._id)} className="px-3 py-1.5 bg-teal-500 text-white rounded-lg text-sm hover:bg-teal-600 flex items-center gap-1">
                        <UserCheck className="h-4 w-4" /> {language === "bn" ? "পরবর্তী গ্রহণ" : "Accept Next"}
                      </button>
                      <button onClick={() => handleJoinMeeting(c.roomId)} className="px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 flex items-center gap-1">
                        <Video className="h-4 w-4" /> {language === "bn" ? "মিটিং যোগ দিন" : "Join Meeting"}
                      </button>
                    </>
                  )}
                  <button onClick={() => handleDelete(c._id)} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 flex items-center gap-1 ml-auto">
                    <Trash2 className="h-4 w-4" /> {language === "bn" ? "মুছুন" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
