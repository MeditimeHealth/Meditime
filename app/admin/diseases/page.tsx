"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Edit, Trash2 } from "lucide-react";

interface Disease {
  _id: string;
  name: string;
  bangla: string;
}

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    bangla: "",
  });

  useEffect(() => {
    fetchDiseases();
  }, []);

  const fetchDiseases = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/diseases");
      const data = await response.json();
      if (response.ok) {
        setDiseases(data.diseases);
      }
    } catch (error) {
      console.error("Error fetching diseases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId
        ? `/api/diseases/${editingId}`
        : "/api/diseases";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchDiseases();
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: "", bangla: "" });
        alert(editingId ? "Disease updated successfully" : "Disease created successfully");
      } else {
        alert(result.error || "Failed to save disease");
      }
    } catch (error) {
      console.error("Error saving disease:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (disease: Disease) => {
    setEditingId(disease._id);
    setFormData({
      name: disease.name,
      bangla: disease.bangla,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this disease?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/diseases/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchDiseases();
        alert("Disease deleted successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete disease");
      }
    } catch (error) {
      console.error("Error deleting disease:", error);
      alert("Failed to delete disease");
    } finally {
      setLoading(false);
    }
  };

  if (loading && diseases.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">সকল রোগ (All Diseases)</h1>
        <p className="text-gray-600 mt-2">Create and manage diseases/conditions</p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {diseases.length} Disease{diseases.length !== 1 ? "s" : ""}
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", bangla: "" });
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Disease
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Disease" : "Create Disease"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: "", bangla: "" });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">
                  Disease Name (English) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Breast Cancer"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bangla">
                  Disease Name (Bengali) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="bangla"
                  value={formData.bangla}
                  onChange={(e) =>
                    setFormData({ ...formData, bangla: e.target.value })
                  }
                  placeholder="ব্রেস্ট ক্যান্সার"
                  required
                  className="mt-1"
                  style={{
                    fontFamily: "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                  }}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Disease"
                  : "Create Disease"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: "", bangla: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Diseases List */}
      {diseases.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No diseases found</p>
          <Button onClick={() => setShowForm(true)}>Create First Disease</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {diseases.map((disease) => (
            <Card key={disease._id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {disease.name}
                  </h3>
                  <p
                    className="text-sm text-gray-600 mt-1"
                    style={{
                      fontFamily:
                        "'Kalpurush', 'SolaimanLipi', 'Siyam Rupali', sans-serif",
                    }}
                  >
                    {disease.bangla}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(disease)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(disease._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
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

