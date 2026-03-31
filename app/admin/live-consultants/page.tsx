"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Video, Plus, Trash2, ToggleLeft, ToggleRight, Users, Clock, DollarSign, UserCheck, RefreshCw, Edit2, Search } from "lucide-react";
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
  language?: string;
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
    language: "Bengali",
    email: "",
    password: "",
  });

  const [showCreateDoctorForm, setShowCreateDoctorForm] = useState(false);
  const [newDoctorData, setNewDoctorData] = useState({
    name: "",
    nameBn: "",
    email: "",
    phone: "",
    password: "",
    specialty: "",
    specialtyBn: "",
    language: "Bengali",
    consultationFee: 500,
    autoLiveConsultant: true,
  });

  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState<LiveConsultant | null>(null);
  const [editFormData, setEditFormData] = useState({
    consultationFee: 0,
    estimatedWaitTime: 0,
    maxQueueSize: 0,
    language: "Bengali",
  });
  const [searchQuery, setSearchQuery] = useState("");

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
        setFormData({ doctorId: "", consultationFee: 500, estimatedWaitTime: 15, maxQueueSize: 10, language: "Bengali", email: "", password: "" });
        fetchConsultants();
      } else {
        toast.error(data.error || "Failed to add");
      }
    } catch (err) {
      toast.error("Failed to add consultant");
    }
  };

  const handleCreateDoctor = async () => {
    if (!newDoctorData.name || !newDoctorData.email || !newDoctorData.password) {
      toast.error("Please fill in all required fields (Name, Email, Password)");
      return;
    }
    try {
      const res = await fetch("/api/admin/doctors/create-with-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDoctorData),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Doctor account created successfully!");
        setShowCreateDoctorForm(false);
        setNewDoctorData({ name: "", nameBn: "", email: "", phone: "", password: "", specialty: "", specialtyBn: "", language: "Bengali", consultationFee: 500, autoLiveConsultant: true });
        fetchDoctors();
        if (newDoctorData.autoLiveConsultant) {
          fetchConsultants();
        }
      } else {
        toast.error(data.error || "Failed to create doctor");
      }
    } catch (err) {
      toast.error("An error occurred while creating doctor account.");
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

  const handleUpdate = async () => {
    if (!editingConsultant) return;
    try {
      const res = await fetch(`/api/admin/live-consultants/${editingConsultant._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) {
        toast.success("Consultant updated!");
        setShowEditModal(false);
        fetchConsultants();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
      }
    } catch (err) {
      toast.error("Failed to update consultant");
    }
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
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text"
              placeholder={language === "bn" ? "ডাক্তার বা বিশেষজ্ঞ খুঁজুন..." : "Search doctor or specialty..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={fetchConsultants} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> {language === "bn" ? "রিফ্রেশ" : "Refresh"}
            </button>
            <button onClick={() => { setShowCreateDoctorForm(true); setShowAddForm(false); }} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2">
              <Plus className="h-4 w-4" /> {language === "bn" ? "নতুন ডাক্তার" : "Create"}
            </button>
            <button onClick={() => { setShowAddForm(true); setShowCreateDoctorForm(false); }} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition flex items-center gap-2">
              <UserCheck className="h-4 w-4" /> {language === "bn" ? "যোগ করুন" : "Add"}
            </button>
          </div>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && !showCreateDoctorForm && (
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "ভাষা" : "Language"}</label>
              <select
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
              >
                <option value="Bengali">Bengali</option>
                <option value="English">English</option>
              </select>
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

      {/* Create Doctor Form */}
      {showCreateDoctorForm && !showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h3 className="font-semibold text-lg">{language === "bn" ? "নতুন ডাক্তার তৈরি করুন" : "Create New Doctor Account"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "ডাক্তারের নাম" : "Doctor Name"} *</label>
              <input
                type="text"
                placeholder="Dr. John Doe"
                value={newDoctorData.name}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "নাম (বাংলা)" : "Name (BN)"}</label>
              <input
                type="text"
                placeholder="ডাঃ জন ডো"
                value={newDoctorData.nameBn}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, nameBn: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "ইমেইল" : "Email"} *</label>
              <input
                type="email"
                placeholder="doctor@example.com"
                value={newDoctorData.email}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, email: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "ফোন নম্বর (ঐচ্ছিক)" : "Phone Number (Optional)"}</label>
              <input
                type="tel"
                placeholder="+8801XXXXXXXXX"
                value={newDoctorData.phone}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "পাসওয়ার্ড" : "Password"} *</label>
              <input
                type="text"
                placeholder="Password"
                value={newDoctorData.password}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, password: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "বিশেষজ্ঞ" : "Specialty"}</label>
              <input
                type="text"
                placeholder="Medicine"
                value={newDoctorData.specialty}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, specialty: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "বিশেষজ্ঞ (বাংলা)" : "Specialty (BN)"}</label>
              <input
                type="text"
                placeholder="মেডিসিন"
                value={newDoctorData.specialtyBn}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, specialtyBn: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "ভাষা" : "Language"}</label>
              <select
                value={newDoctorData.language}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, language: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="Bengali">Bengali</option>
                <option value="English">English</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "ফি (৳)" : "Fee (৳)"}</label>
              <input
                type="number"
                value={newDoctorData.consultationFee}
                onChange={(e) => setNewDoctorData({ ...newDoctorData, consultationFee: Number(e.target.value) })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="autoLive" 
              checked={newDoctorData.autoLiveConsultant}
              onChange={(e) => setNewDoctorData({ ...newDoctorData, autoLiveConsultant: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" 
            />
            <label htmlFor="autoLive" className="text-sm text-gray-700 font-medium">
              {language === "bn" ? "সাথে সাথে লাইভ কনসালটেন্ট প্রোফাইল তৈরি করুন" : "Automatically create Live Consultant profile"}
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleCreateDoctor} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
              {language === "bn" ? "তৈরি করুন" : "Create Account"}
            </button>
            <button onClick={() => setShowCreateDoctorForm(false)} className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
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
          {consultants
            .filter(c => {
              const query = searchQuery.toLowerCase();
              return (
                c.doctorId?.name?.toLowerCase().includes(query) ||
                c.doctorId?.nameBn?.toLowerCase().includes(query) ||
                c.doctorId?.specialty?.toLowerCase().includes(query) ||
                c.doctorId?.specialtyBn?.toLowerCase().includes(query)
              );
            })
            .map((c) => {
            const waitingCount = c.currentQueue.filter((e) => e.status === "waiting").length;

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

                {/* Actions */}
                <div className="p-3 flex gap-2 flex-wrap">
                  <button 
                    onClick={() => {
                      setEditingConsultant(c);
                      setEditFormData({
                        consultationFee: c.consultationFee,
                        estimatedWaitTime: c.estimatedWaitTime,
                        maxQueueSize: c.maxQueueSize,
                        language: c.language || "Bengali",
                      });
                      setShowEditModal(true);
                    }} 
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm hover:bg-blue-100 flex items-center gap-1"
                  >
                    <Edit2 className="h-4 w-4" /> {language === "bn" ? "এডিট" : "Edit"}
                  </button>
                  <button onClick={() => handleDelete(c._id)} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-sm hover:bg-red-100 flex items-center gap-1 ml-auto">
                    <Trash2 className="h-4 w-4" /> {language === "bn" ? "মুছুন" : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingConsultant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-xl font-bold">{language === "bn" ? "কনসালটেন্ট এডিট করুন" : "Edit Consultant"}</h3>
            <p className="text-sm text-gray-500">
              {language === "bn" && editingConsultant.doctorId?.nameBn ? editingConsultant.doctorId.nameBn : editingConsultant.doctorId?.name}
            </p>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "ফি (৳)" : "Fee (৳)"}</label>
                <input
                  type="number"
                  value={editFormData.consultationFee}
                  onChange={(e) => setEditFormData({ ...editFormData, consultationFee: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "আনুমানিক অপেক্ষা (মিনিট)" : "Est. Wait (min)"}</label>
                <input
                  type="number"
                  value={editFormData.estimatedWaitTime}
                  onChange={(e) => setEditFormData({ ...editFormData, estimatedWaitTime: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "সর্বোচ্চ কিউ সাইজ" : "Max Queue Size"}</label>
                <input
                  type="number"
                  value={editFormData.maxQueueSize}
                  onChange={(e) => setEditFormData({ ...editFormData, maxQueueSize: Number(e.target.value) })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{language === "bn" ? "ভাষা" : "Language"}</label>
                <select
                  value={editFormData.language}
                  onChange={(e) => setEditFormData({ ...editFormData, language: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Bengali">Bengali</option>
                  <option value="English">English</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button onClick={handleUpdate} className="flex-1 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-semibold">
                {language === "bn" ? "আপডেট করুন" : "Update"}
              </button>
              <button onClick={() => setShowEditModal(false)} className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold">
                {language === "bn" ? "বাতিল" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
