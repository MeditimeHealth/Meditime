"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Loader2, Save, X, Edit } from "lucide-react";

interface ServiceSection {
  _id: string;
  title: string;
  description: string;
  slug: string;
  order: number;
  isActive: boolean;
}

export default function ServiceSectionsPage() {
  const [sections, setSections] = useState<ServiceSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
    order: "",
  });

  useEffect(() => {
    // Get user from localStorage
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } catch (error) {
          console.error("Error parsing user data:", error);
        }
      }
    }
  }, []);

  const fetchSections = useCallback(async () => {
    if (!user || !user.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/service-sections/all?userId=${user.id}`);
      const data = await response.json();
      if (data.sections) {
        setSections(data.sections);
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      fetchSections();
    }
  }, [user, fetchSections]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: editingId ? prev.slug : generateSlug(title),
    }));
  };

  const handleAddSection = async () => {
    if (!formData.title || !formData.description || !formData.slug) {
      alert("Please fill in all required fields");
      return;
    }

    if (!user || user.role !== "admin") {
      alert("Unauthorized - Admin access required");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/service-sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          order: formData.order ? parseInt(formData.order) : undefined,
          userId: user.id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setFormData({ title: "", description: "", slug: "", order: "" });
        setShowAddForm(false);
        fetchSections();
      } else {
        alert(data.error || "Failed to add section");
      }
    } catch (error) {
      console.error("Error adding section:", error);
      alert("Failed to add section");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSection = async () => {
    if (!editingId || !formData.title || !formData.description || !formData.slug) {
      alert("Please fill in all required fields");
      return;
    }

    if (!user || user.role !== "admin") {
      alert("Unauthorized - Admin access required");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/service-sections/${editingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          order: formData.order ? parseInt(formData.order) : undefined,
          userId: user.id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setFormData({ title: "", description: "", slug: "", order: "" });
        setEditingId(null);
        fetchSections();
      } else {
        alert(data.error || "Failed to update section");
      }
    } catch (error) {
      console.error("Error updating section:", error);
      alert("Failed to update section");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) {
      return;
    }

    if (!user || user.role !== "admin") {
      alert("Unauthorized - Admin access required");
      return;
    }

    try {
      setDeleting(id);
      const response = await fetch(`/api/service-sections/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (response.ok) {
        fetchSections();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete section");
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Failed to delete section");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (section: ServiceSection) => {
    setEditingId(section._id);
    setFormData({
      title: section.title,
      description: section.description,
      slug: section.slug,
      order: section.order.toString(),
    });
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ title: "", description: "", slug: "", order: "" });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Service Sections</h1>
          <p className="text-gray-600 mt-2">Add and manage service sections for the service page</p>
        </div>
        <Button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            setFormData({ title: "", description: "", slug: "", order: "" });
          }}
          disabled={showAddForm && !editingId}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? "Edit Section" : "Add New Section"}
            </h2>
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g., Ambulance Services"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Enter a description for this service section"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary mt-1 min-h-[100px]"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-") }))
                }
                placeholder="e.g., ambulance-services"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly identifier (lowercase, numbers, and hyphens only)
              </p>
            </div>
            <div>
              <Label htmlFor="order">Order (optional)</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, order: e.target.value }))
                }
                placeholder="Display order"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={editingId ? handleUpdateSection : handleAddSection}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? "Update" : "Add"} Section
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {sections.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">No service sections found</p>
            <p className="text-gray-400 text-sm mt-2">
              Click "Add Section" to create your first service section
            </p>
          </Card>
        ) : (
          sections.map((section) => (
            <Card key={section._id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                      Order: {section.order}
                    </span>
                    {!section.isActive && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-2">{section.description}</p>
                  <p className="text-sm text-gray-500">
                    Slug: <code className="bg-gray-100 px-1 rounded">{section.slug}</code>
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(section)}
                    disabled={deleting === section._id}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteSection(section._id)}
                    disabled={deleting === section._id}
                  >
                    {deleting === section._id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

