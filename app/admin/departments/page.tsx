"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Edit, Trash2 } from "lucide-react";

interface Department {
  _id: string;
  name: string;
  nameBn?: string;
  image?: string;
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    image: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/departments");
      const data = await response.json();
      if (response.ok) {
        setDepartments(data.departments);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    
    try {
      // Create FormData for ImgBB API
      const formDataImg = new FormData();
      formDataImg.append("image", file);
      
      // ImgBB API key - You'll need to add this to your environment variables
      const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || "your-imgbb-api-key";
      
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        {
          method: "POST",
          body: formDataImg,
        }
      );

      const data = await response.json();

      if (data.success) {
        const imageUrl = data.data.url;
        setFormData({ ...formData, image: imageUrl });
        setImagePreview(imageUrl);
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId
        ? `/api/departments/${editingId}`
        : "/api/departments";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        await fetchDepartments();
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: "", nameBn: "", image: "" });
        setImagePreview("");
        alert(editingId ? "Department updated successfully" : "Department created successfully");
      } else {
        alert(result.error || "Failed to save department");
      }
    } catch (error) {
      console.error("Error saving department:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingId(department._id);
    setFormData({
      name: department.name,
      nameBn: department.nameBn || "",
      image: department.image || "",
    });
    setImagePreview(department.image || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this department?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchDepartments();
        alert("Department deleted successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete department");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Failed to delete department");
    } finally {
      setLoading(false);
    }
  };

  if (loading && departments.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Manage Departments</h1>
        <p className="text-gray-600 mt-2">Create and manage medical departments</p>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {departments.length} Department{departments.length !== 1 ? "s" : ""}
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", nameBn: "", image: "" });
            setImagePreview("");
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Department" : "Create Department"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: "", nameBn: "", image: "" });
                setImagePreview("");
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {language === 'en' ? (
                <div>
                  <Label htmlFor="name">
                    Department Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Cardiology"
                    required
                    className="mt-1"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="nameBn">
                    বিভাগের নাম (Department Name Bangla)
                  </Label>
                  <Input
                    id="nameBn"
                    value={formData.nameBn}
                    onChange={(e) =>
                      setFormData({ ...formData, nameBn: e.target.value })
                    }
                    placeholder="হৃদরোগ বিভাগ"
                    className="mt-1"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                  />
                </div>
              )}

              <div>
                <Label htmlFor="image">
                  Department Photo
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="mt-1"
                />
                {uploading && (
                  <p className="text-sm text-blue-600 mt-1">Uploading image...</p>
                )}
                {imagePreview && (
                  <div className="mt-2">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-24 h-24 object-cover rounded border"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Department"
                  : "Create Department"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({ name: "", nameBn: "", image: "" });
                  setImagePreview("");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Departments List */}
      {departments.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No departments found</p>
          <Button onClick={() => setShowForm(true)}>Create First Department</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((department) => (
            <Card key={department._id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  {department.image && (
                    <img src={department.image} alt={department.name} className="w-12 h-12 object-cover rounded" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 break-words">
                      {department.name}
                    </h3>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(department)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(department._id)}
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

