"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Trash2, Edit } from "lucide-react";

interface DiagnosticCenter {
  _id: string;
  name: string;
  division?: string;
  district?: string;
  thana?: string;
  address?: string;
  phone?: string;
  email?: string;
  packageDiscount?: number;
  minTestsForPackage?: number;
}

export default function DiagnosticCentersPage() {
  const [centers, setCenters] = useState<DiagnosticCenter[]>([]);
  const [divisions, setDivisions] = useState<Array<{_id: string; name: string}>>([]);
  const [districts, setDistricts] = useState<Array<{_id: string; name: string}>>([]);
  const [thanas, setThanas] = useState<Array<{_id: string; name: string}>>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    division: "",
    district: "",
    thana: "",
    address: "",
    phone: "",
    email: "",
    packageDiscount: "",
    minTestsForPackage: "3",
  });

  useEffect(() => {
    fetchCenters();
    fetchDivisions();
  }, []);

  useEffect(() => {
    if (formData.division) {
      const division = divisions.find(d => d.name === formData.division);
      if (division) {
        fetch(`/api/locations/districts?division=${division._id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.districts) setDistricts(data.districts);
          });
      }
    } else {
      setDistricts([]);
      setThanas([]);
    }
  }, [formData.division, divisions]);

  useEffect(() => {
    if (formData.district) {
      const district = districts.find(d => d.name === formData.district);
      if (district) {
        fetch(`/api/locations/thanas?district=${district._id}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.thanas) setThanas(data.thanas);
          });
      }
    } else {
      setThanas([]);
    }
  }, [formData.district, districts]);

  const fetchDivisions = async () => {
    try {
      const response = await fetch("/api/locations/divisions");
      const data = await response.json();
      if (response.ok) {
        setDivisions(data.divisions);
      }
    } catch (error) {
      console.error("Error fetching divisions:", error);
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await fetch("/api/diagnostic/centers");
      const data = await response.json();
      if (response.ok) {
        setCenters(data.centers);
      }
    } catch (error) {
      console.error("Error fetching centers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = "/api/diagnostic/centers";
      const method = editingId ? "PUT" : "POST";
      const body = {
        ...(editingId && { id: editingId }),
        name: formData.name,
        nameBn: formData.nameBn,
        division: formData.division || undefined,
        district: formData.district || undefined,
        thana: formData.thana || undefined,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        packageDiscount: formData.packageDiscount ? parseFloat(formData.packageDiscount) : 0,
        minTestsForPackage: formData.minTestsForPackage ? parseInt(formData.minTestsForPackage) : 3,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || (editingId ? "Updated successfully!" : "Created successfully!"));
        setShowForm(false);
        resetForm();
        fetchCenters();
      } else {
        alert(data.error || "Failed to save");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (center: DiagnosticCenter) => {
    setEditingId(center._id);
    setFormData({
      name: center.name,
      nameBn: (center as any).nameBn || "",
      division: center.division || "",
      district: center.district || "",
      thana: center.thana || "",
      address: center.address || "",
      phone: center.phone || "",
      email: center.email || "",
      packageDiscount: center.packageDiscount?.toString() || "",
      minTestsForPackage: center.minTestsForPackage?.toString() || "3",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this center?")) return;
    
    try {
      const response = await fetch(`/api/diagnostic/centers/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCenters(centers.filter((center) => center._id !== id));
        alert("Center deleted successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete center");
      }
    } catch (error) {
      console.error("Error deleting center:", error);
      alert("Failed to delete center");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nameBn: "",
      division: "",
      district: "",
      thana: "",
      address: "",
      phone: "",
      email: "",
      packageDiscount: "",
      minTestsForPackage: "3",
    });
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diagnostic Centers</h1>
          <p className="text-gray-600 mt-2">Create and manage diagnostic centers</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Center
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Center" : "Create New Center"}
            </h2>
            <Button variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Language Toggle */}
            <div className="flex justify-end mb-4">
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    language === 'en'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    language === 'bn'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {language === 'en' ? (
              <div>
                <Label htmlFor="name">
                  Center Name <span className="text-gray-400 text-sm">(Optional)</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Square Diagnostic Center"
                  className="mt-1"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="nameBn">
                  কেন্দ্রের নাম (Center Name Bangla)
                </Label>
                <Input
                  id="nameBn"
                  value={formData.nameBn}
                  onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                  placeholder="স্কয়ার ডায়াগনস্টিক সেন্টার"
                  className="mt-1"
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="division">Division</Label>
                <select
                  id="division"
                  value={formData.division}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      division: e.target.value,
                      district: "",
                      thana: "",
                    });
                  }}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                >
                  <option value="">Select Division</option>
                  {divisions.map((div) => (
                    <option key={div._id} value={div.name}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="district">District</Label>
                <select
                  id="district"
                  value={formData.district}
                  onChange={(e) => {
                    setFormData({ ...formData, district: e.target.value, thana: "" });
                  }}
                  disabled={!formData.division}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1 disabled:opacity-50"
                >
                  <option value="">Select District</option>
                  {districts.map((dist) => (
                    <option key={dist._id} value={dist.name}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="thana">Thana/Upazila</Label>
                <select
                  id="thana"
                  value={formData.thana}
                  onChange={(e) => setFormData({ ...formData, thana: e.target.value })}
                  disabled={!formData.district}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1 disabled:opacity-50"
                >
                  <option value="">Select Thana</option>
                  {thanas.map((thana) => (
                    <option key={thana._id} value={thana.name}>
                      {thana.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full address"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+8801234567890"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="center@example.com"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="packageDiscount">Package Discount (%)</Label>
                <Input
                  id="packageDiscount"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.packageDiscount}
                  onChange={(e) => setFormData({ ...formData, packageDiscount: e.target.value })}
                  placeholder="10"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="minTestsForPackage">Min Tests for Package</Label>
                <Input
                  id="minTestsForPackage"
                  type="number"
                  min="1"
                  value={formData.minTestsForPackage}
                  onChange={(e) => setFormData({ ...formData, minTestsForPackage: e.target.value })}
                  placeholder="3"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update Center" : "Create Center"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Centers List */}
      <Card className="p-6">
        {loading && !showForm ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : centers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No centers found</p>
            <Button onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Center
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {centers.map((center) => (
              <div
                key={center._id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {center.name}
                    </h3>
                    {(center.division || center.district || center.thana) && (
                      <p className="text-sm text-gray-600 mb-2">
                        {[center.division, center.district, center.thana].filter(Boolean).join(", ")}
                      </p>
                    )}
                    {center.address && (
                      <p className="text-sm text-gray-600 mb-1">{center.address}</p>
                    )}
                    <div className="flex gap-4 text-sm text-gray-500">
                      {center.phone && <span>📞 {center.phone}</span>}
                      {center.email && <span>✉️ {center.email}</span>}
                    </div>
                    {center.packageDiscount && center.minTestsForPackage && (
                      <div className="mt-2 text-sm bg-green-50 text-green-700 px-3 py-1 rounded inline-block">
                        {center.packageDiscount}% off on {center.minTestsForPackage}+ tests
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(center)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(center._id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

