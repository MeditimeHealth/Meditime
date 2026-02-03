"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Edit, Trash2 } from "lucide-react";

interface Division {
  _id: string;
  name: string;
}

interface District {
  _id: string;
  name: string;
  division: Division;
}

interface Thana {
  _id: string;
  name: string;
  district: District;
}

interface Hospital {
  _id: string;
  name: string;
  thana?: Thana;
  address?: string;
  phone?: string;
  email?: string;
}

type TabType = "division" | "district" | "thana" | "hospital";

export default function LocationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("division");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');

  // Data states
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [thanas, setThanas] = useState<Thana[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    division: "",
    district: "",
    thana: "",
    address: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Fetch divisions when needed
  useEffect(() => {
    if (activeTab === "district" || activeTab === "thana" || activeTab === "hospital") {
      fetch("/api/locations/divisions")
        .then((res) => res.json())
        .then((data) => {
          if (data.divisions) setDivisions(data.divisions);
        });
    }
  }, [activeTab]);

  // Fetch thanas when hospital tab is active
  useEffect(() => {
    if (activeTab === "hospital") {
      fetch("/api/locations/thanas")
        .then((res) => res.json())
        .then((data) => {
          if (data.thanas) setThanas(data.thanas);
        });
    }
  }, [activeTab]);

  // Fetch districts when division is selected
  useEffect(() => {
    if (formData.division && (activeTab === "district" || activeTab === "thana")) {
      fetch(`/api/locations/districts?division=${formData.division}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.districts) setDistricts(data.districts);
        });
    }
  }, [formData.division, activeTab]);

  // Fetch thanas when district is selected
  useEffect(() => {
    if (formData.district && activeTab === "thana") {
      fetch(`/api/locations/thanas?district=${formData.district}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.thanas) setThanas(data.thanas);
        });
    }
  }, [formData.district, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "division") {
        const res = await fetch("/api/locations/divisions");
        const data = await res.json();
        if (res.ok) setDivisions(data.divisions);
      } else if (activeTab === "district") {
        const res = await fetch("/api/locations/districts");
        const data = await res.json();
        if (res.ok) setDistricts(data.districts);
      } else if (activeTab === "thana") {
        const res = await fetch("/api/locations/thanas");
        const data = await res.json();
        if (res.ok) setThanas(data.thanas);
      } else if (activeTab === "hospital") {
        const res = await fetch("/api/locations/hospitals");
        const data = await res.json();
        if (res.ok) setHospitals(data.hospitals);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let url = "";
      const method = "POST";
      let body: any = {};

      if (activeTab === "division") {
        url = "/api/locations/divisions";
        body = { name: formData.name };
      } else if (activeTab === "district") {
        url = "/api/locations/districts";
        body = { name: formData.name, division: formData.division };
      } else if (activeTab === "thana") {
        url = "/api/locations/thanas";
        body = { name: formData.name, district: formData.district };
      } else if (activeTab === "hospital") {
        url = "/api/locations/hospitals";
        body = {
          name: formData.name,
          thana: formData.thana || undefined,
          address: formData.address || undefined,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
        };
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Created successfully!");
        setShowForm(false);
        setFormData({
          name: "",
          nameBn: "",
          division: "",
          district: "",
          thana: "",
          address: "",
          phone: "",
          email: "",
        });
        fetchData();
      } else {
        alert(data.error || "Failed to create");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;

    if (!id) {
      alert("Error: No ID provided");
      console.error("Delete called without ID");
      return;
    }

    try {
      let endpoint = "";
      
      switch (activeTab) {
        case "division":
          endpoint = `/api/locations/divisions/${id}`;
          break;
        case "district":
          endpoint = `/api/locations/districts/${id}`;
          break;
        case "thana":
          endpoint = `/api/locations/thanas/${id}`;
          break;
        case "hospital":
          endpoint = `/api/locations/hospitals/${id}`;
          break;
        default:
          alert("Unknown tab type");
          return;
      }

      console.log(`Deleting ${activeTab} with ID:`, id, "Endpoint:", endpoint);

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        // Remove item from list
        switch (activeTab) {
          case "division":
            setDivisions(divisions.filter((item) => item._id !== id));
            break;
          case "district":
            setDistricts(districts.filter((item) => item._id !== id));
            break;
          case "thana":
            setThanas(thanas.filter((item) => item._id !== id));
            break;
          case "hospital":
            setHospitals(hospitals.filter((item) => item._id !== id));
            break;
        }
        alert("Deleted successfully");
      } else {
        console.error("Delete failed:", data);
        alert(data.error || "Failed to delete");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const tabs = [
    { id: "division" as TabType, label: "Divisions" },
    { id: "district" as TabType, label: "Districts" },
    { id: "thana" as TabType, label: "Thanas/Upazilas" },
    { id: "hospital" as TabType, label: "Hospitals" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Locations</h1>
        <p className="text-gray-600 mt-2">Manage divisions, districts, thanas, and hospitals</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setShowForm(false);
              setEditingId(null);
            }}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {activeTab === "division" && `${divisions.length} Divisions`}
          {activeTab === "district" && `${districts.length} Districts`}
          {activeTab === "thana" && `${thanas.length} Thanas`}
          {activeTab === "hospital" && `${hospitals.length} Hospitals`}
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add {tabs.find((t) => t.id === activeTab)?.label.slice(0, -1)}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="p-6">
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
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Enter name"
                  className="mt-1"
                />
              </div>
            ) : (
              <div>
                <Label htmlFor="nameBn">
                  নাম (Bangla) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nameBn"
                  value={formData.nameBn}
                  onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                  placeholder="নাম লিখুন"
                  className="mt-1"
                  style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                />
              </div>
            )}

            {activeTab === "district" && (
              <div>
                <Label htmlFor="division">Division <span className="text-red-500">*</span></Label>
                <select
                  id="division"
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  required
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                >
                  <option value="">Select Division</option>
                  {divisions.map((div) => (
                    <option key={div._id} value={div._id}>
                      {div.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === "thana" && (
              <>
                <div>
                  <Label htmlFor="division-thana">Division <span className="text-red-500">*</span></Label>
                  <select
                    id="division-thana"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value, district: "" })}
                    required
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                  >
                    <option value="">Select Division</option>
                    {divisions.map((div) => (
                      <option key={div._id} value={div._id}>
                        {div.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="district">District <span className="text-red-500">*</span></Label>
                  <select
                    id="district"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    required
                    disabled={!formData.division}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1 disabled:opacity-50"
                  >
                    <option value="">Select District</option>
                    {districts.map((dist) => (
                      <option key={dist._id} value={dist._id}>
                        {dist.name}
                      </option>
                    ))}
                  </select>
                  {!formData.division && (
                    <p className="text-sm text-gray-500 mt-1">Please select a division first</p>
                  )}
                </div>
              </>
            )}

            {activeTab === "hospital" && (
              <>
                <div>
                  <Label htmlFor="thana-hospital">Thana/Upazila (Optional)</Label>
                  <select
                    id="thana-hospital"
                    value={formData.thana}
                    onChange={(e) => setFormData({ ...formData, thana: e.target.value })}
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                  >
                    <option value="">Select Thana (Optional)</option>
                    {thanas.map((thana) => (
                      <option key={thana._id} value={thana._id}>
                        {thana.name} - {thana.district.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter address"
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Enter phone"
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
                      placeholder="Enter email"
                      className="mt-1"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Data List */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : (
          <div className="space-y-4">
            {activeTab === "division" && (
              <>
                {divisions.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No divisions found</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {divisions.map((div) => (
                      <div
                        key={div._id}
                        className="p-4 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50"
                      >
                        <span className="font-medium">{div.name}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(String(div._id))}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "district" && (
              <>
                {districts.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No districts found</p>
                ) : (
                  <div className="space-y-2">
                    {districts.map((dist) => (
                      <div
                        key={dist._id}
                        className="p-4 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50"
                      >
                        <div>
                          <span className="font-medium">{dist.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({dist.division.name})
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(String(dist._id))}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "thana" && (
              <>
                {thanas.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No thanas found</p>
                ) : (
                  <div className="space-y-2">
                    {thanas.map((thana) => (
                      <div
                        key={thana._id}
                        className="p-4 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50"
                      >
                        <div>
                          <span className="font-medium">{thana.name}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({thana.district.name}, {thana.district.division.name})
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(String(thana._id))}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === "hospital" && (
              <>
                {hospitals.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No hospitals found</p>
                ) : (
                  <div className="space-y-2">
                    {hospitals.map((hospital) => (
                      <div
                        key={hospital._id}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{hospital.name}</div>
                            {hospital.thana && (
                              <div className="text-sm text-gray-500 mt-1">
                                {hospital.thana.name} - {hospital.thana.district.name}
                              </div>
                            )}
                            {hospital.address && (
                              <div className="text-sm text-gray-600 mt-1">{hospital.address}</div>
                            )}
                            {(hospital.phone || hospital.email) && (
                              <div className="text-sm text-gray-500 mt-1">
                                {hospital.phone && <span>{hospital.phone}</span>}
                                {hospital.phone && hospital.email && <span> • </span>}
                                {hospital.email && <span>{hospital.email}</span>}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(String(hospital._id))}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

