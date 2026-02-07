"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Plus, X, Edit, Trash2, Filter, Minus } from "lucide-react";

interface Department {
  _id: string;
  name: string;
  image?: string;
}

interface Disease {
  _id: string;
  name: string;
  bangla: string;
  department?: Department;
}

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>("all");
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  
  // Form state
  const [departmentId, setDepartmentId] = useState<string>("");
  const [diseaseNames, setDiseaseNames] = useState<string[]>([""]);
  const [diseaseNamesBn, setDiseaseNamesBn] = useState<string[]>([""]);

  useEffect(() => {
    fetchDiseases();
    fetchDepartments();
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

  const fetchDepartments = async () => {
    try {
      const response = await fetch("/api/departments");
      const data = await response.json();
      if (response.ok) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleAddNameField = () => {
    setDiseaseNames([...diseaseNames, ""]);
    setDiseaseNamesBn([...diseaseNamesBn, ""]);
  };

  const handleRemoveNameField = (index: number) => {
    const newNames = [...diseaseNames];
    const newNamesBn = [...diseaseNamesBn];
    newNames.splice(index, 1);
    newNamesBn.splice(index, 1);
    setDiseaseNames(newNames);
    setDiseaseNamesBn(newNamesBn);
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...diseaseNames];
    newNames[index] = value;
    setDiseaseNames(newNames);
  };

  const handleNameBnChange = (index: number, value: string) => {
    const newNamesBn = [...diseaseNamesBn];
    newNamesBn[index] = value;
    setDiseaseNamesBn(newNamesBn);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId
        ? `/api/diseases/${editingId}`
        : "/api/diseases";
      const method = editingId ? "PUT" : "POST";

      // Filter out empty names
      const validNames = diseaseNames.filter(n => n.trim() !== "");
      
      if (validNames.length === 0) {
        alert("Please enter at least one disease name");
        setLoading(false);
        return;
      }

      const payload = editingId 
        ? { name: validNames[0], departmentId } // For edit, we only take the first name
        : { names: validNames, departmentId }; // For create, we send array

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchDiseases();
        setShowForm(false);
        setEditingId(null);
        setDepartmentId("");
        setDiseaseNames([""]);
        setDiseaseNamesBn([""]);
        
        if (result.errors && result.errors.length > 0) {
          alert(`Some diseases were created, but errors occurred:\n${result.errors.join("\n")}`);
        } else {
          alert(editingId ? "Disease updated successfully" : "Diseases created successfully");
        }
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
    setDepartmentId(disease.department?._id || "");
    setDiseaseNames([disease.name]);
    setDiseaseNamesBn([disease.bangla || ""]);
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

  // Helper to filter diseases by selected department
  const filteredDiseases = diseases.filter((disease) => {
    if (selectedDepartmentFilter === "all") return true;
    if (selectedDepartmentFilter === "none") return !disease.department;
    return disease.department?._id === selectedDepartmentFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Diseases</h1>
        <p className="text-gray-600 mt-2">Create and manage diseases/conditions</p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-sm text-gray-600">
            {filteredDiseases.length} Disease{filteredDiseases.length !== 1 ? "s" : ""}
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select 
              value={selectedDepartmentFilter} 
              onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
              className="w-[200px]"
            >
              <option value="all">All Departments</option>
              <option value="none">No Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setDepartmentId("");
            setDiseaseNames([""]);
        setDiseaseNamesBn([""]);
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
              {editingId ? "Edit Disease" : "Create Diseases"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setDepartmentId("");
                setDiseaseNames([""]);
        setDiseaseNamesBn([""]);
              }}
            >
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

            <div>
              <Label htmlFor="department">Department (Optional)</Label>
              <Select
                id="department"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                className="mt-1"
              >
                <option value="">None</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-3">
              <Label>
                {language === 'en' ? 'Disease Names' : 'রোগের নাম (Optional)'}
              </Label>
              {(language === 'en' ? diseaseNames : diseaseNamesBn).map((name, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => language === 'en' 
                      ? handleNameChange(index, e.target.value)
                      : handleNameBnChange(index, e.target.value)
                    }
                    placeholder={language === 'en' ? "Enter disease name" : "রোগের নাম লিখুন"}
                    required={language === 'en' && index === 0} // Only first English name required
                    className="flex-1"
                    style={language === 'bn' ? { fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" } : undefined}
                  />
                  {!editingId && diseaseNames.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveNameField(index)}
                      className="shrink-0 px-2"
                    >
                      <Minus className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
              
              {!editingId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddNameField}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Name
                </Button>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Disease"
                  : "Create Diseases"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setDepartmentId("");
                  setDiseaseNames([""]);
        setDiseaseNamesBn([""]);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Diseases List */}
      {filteredDiseases.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">
            {diseases.length === 0 ? "No diseases found" : "No diseases found with selected filter"}
          </p>
          {diseases.length === 0 && (
            <Button onClick={() => setShowForm(true)}>Create First Disease</Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiseases.map((disease) => (
            <Card key={disease._id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {disease.name}
                    </h3>
                  </div>
                  {disease.department && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                      <span>{disease.department.name}</span>
                    </div>
                  )}
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
