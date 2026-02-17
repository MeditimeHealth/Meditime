"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Edit, Trash2, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/lib/translations";
import { showToast } from "@/lib/toast";

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
  const { language } = useLanguage();
  const [formLanguage, setFormLanguage] = useState<'en' | 'bn'>(language);
  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    image: "",
  });

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Update form language if global language changes and form is not open
  useEffect(() => {
    if (!showForm) {
      setFormLanguage(language);
    }
  }, [language, showForm]);

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
      showToast.error("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast.error("Image size should be less than 5MB");
      return;
    }

    setUploading(true);
    try {
      const formDataImg = new FormData();
      formDataImg.append("image", file);
      
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
        showToast.success("Image uploaded successfully");
      } else {
        showToast.error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      showToast.error("Error uploading image");
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
        showToast.success(editingId ? "Department updated successfully" : "Department created successfully");
      } else {
        showToast.error(result.error || "Failed to save department");
      }
    } catch (error) {
      console.error("Error saving department:", error);
      showToast.error("An error occurred");
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
        showToast.success("Department deleted successfully");
      } else {
        const data = await response.json();
        showToast.error(data.error || "Failed to delete department");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      showToast.error("Failed to delete department");
    } finally {
      setLoading(false);
    }
  };

  if (loading && departments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 font-medium">{t("loading", language)}</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("manageDepartments", language)}</h1>
          <p className="text-gray-600 mt-1">{language === 'bn' ? 'চিকিৎসা বিভাগ তৈরি এবং পরিচালনা করুন' : 'Create and manage medical departments'}</p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({ name: "", nameBn: "", image: "" });
            setImagePreview("");
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          {t("addDepartment", language)}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 bg-white border-2 border-primary/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {editingId ? t("editDepartment", language) : t("createDepartment", language)}
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
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-end mb-8">
              <div className="bg-gray-100/80 p-1.5 rounded-xl inline-flex shadow-inner">
                <button
                  type="button"
                  onClick={() => setFormLanguage('en')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    formLanguage === 'en'
                      ? 'bg-white text-primary shadow-sm scale-105'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setFormLanguage('bn')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    formLanguage === 'bn'
                      ? 'bg-white text-primary shadow-sm scale-105'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                {formLanguage === 'en' ? (
                  <>
                    <Label htmlFor="name" className="text-base font-semibold text-gray-700">
                      {t("departmentName", language)} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Cardiology"
                      className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                      required
                    />
                  </>
                ) : (
                  <>
                    <Label htmlFor="nameBn" className="text-base font-semibold text-gray-700">
                      {t("nameBn", language)} <span className="text-gray-400 text-sm">(Optional)</span>
                    </Label>
                    <Input
                      id="nameBn"
                      value={formData.nameBn}
                      onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                      placeholder="বিভাগের নাম লিখুন"
                      className="w-full p-3 text-base border-gray-200 rounded-lg focus:ring-primary focus:border-primary"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                    />
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="image" className="text-base font-semibold text-gray-700">
                  {t("departmentPhoto", language)}
                </Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="w-full border-gray-200"
                />
                {uploading && (
                  <p className="text-sm text-primary flex items-center mt-1">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    {t("uploadingImage", language)}
                  </p>
                )}
                {imagePreview && (
                  <div className="mt-3 relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="w-24 h-24 object-cover rounded-lg border-2 border-gray-100 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setFormData({ ...formData, image: "" });
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-8">
              <Button 
                type="submit" 
                disabled={loading} 
                className="flex-1 h-12 text-lg font-bold bg-primary hover:bg-primary/90 shadow-md rounded-xl transition-all active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t("saving", language)}
                  </>
                ) : (
                  editingId ? t("update", language) : t("create", language)
                )}
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
                className="flex-1 h-12 text-lg font-bold border-2 rounded-xl transition-all"
              >
                {t("cancel", language)}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {departments.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-2 bg-gray-50/50">
          <div className="max-w-md mx-auto space-y-4">
            <p className="text-gray-500 text-lg">{t("noDepartments", language)}</p>
            <Button onClick={() => setShowForm(true)} className="bg-primary">
              <Plus className="h-4 w-4 mr-2" />
              {t("createFirstDepartment", language)}
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((department) => (
            <Card key={department._id} className="flex flex-col hover:shadow-lg transition-all duration-200 border-gray-100 group overflow-hidden">
              <div className="p-5 flex-1">
                <div className="flex items-center gap-4">
                  <div className="shrink-0">
                    {department.image ? (
                      <img 
                        src={department.image} 
                        alt={department.name} 
                        className="w-16 h-16 object-cover rounded-xl shadow-sm border border-gray-100" 
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                        <Plus className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-primary transition-colors">
                      {department.name}
                    </h3>
                    {department.nameBn && (
                      <p className="text-gray-500 font-medium truncate">
                        {department.nameBn}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 p-3 bg-gray-50 border-t border-gray-100 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 h-10 font-bold border-gray-200 hover:bg-white hover:text-primary hover:border-primary/50 transition-all rounded-lg"
                  onClick={() => handleEdit(department)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {t("edit", language)}
                </Button>
                <Button 
                  variant="outline"
                   size="sm"
                  className="flex-1 h-10 font-bold border-gray-200 hover:bg-white hover:text-red-500 hover:border-red-200 transition-all rounded-lg"
                  onClick={() => handleDelete(department._id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("delete", language)}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
