"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Trash2, Edit } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface DiagnosticTest {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

export default function DiagnosticTestsPage() {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    description: "",
    descriptionBn: "",
    price: "",
    image: "",
  });
  const [uploading, setUploading] = useState(false);



  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const response = await fetch("/api/diagnostic/tests");
      const data = await response.json();
      if (response.ok) {
        setTests(data.tests);
      }
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      toast.error("Please upload an image for the test");
      return;
    }

    setLoading(true);

    try {
      const url = "/api/diagnostic/tests";
      const method = editingId ? "PUT" : "POST";
      const body = {
        ...(editingId && { id: editingId }),
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        image: formData.image || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || (editingId ? "Updated successfully!" : "Created successfully!"));
        setShowForm(false);
        resetForm();
        fetchTests();
      } else {
        toast.error(data.error || "Failed to save");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (test: DiagnosticTest) => {
    setEditingId(test._id);
    setFormData({
      name: test.name,
      nameBn: (test as any).nameBn || "",
      description: test.description || "",
      descriptionBn: (test as any).descriptionBn || "",
      price: test.price.toString(),
      image: test.image || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;

    const loadingToast = toast.loading("Deleting test...");

    try {
      const response = await fetch(`/api/diagnostic/tests/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTests(tests.filter((test) => test._id !== id));
        toast.success("Test deleted successfully", { id: loadingToast });
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete test", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      toast.error("Failed to delete test", { id: loadingToast });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      nameBn: "",
      description: "",
      descriptionBn: "",
      price: "",
      image: "",
    });
    setEditingId(null);
  };

  const filteredTests = tests;

  return (
    <>
      <Toaster position="top-right" />
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Diagnostic Tests</h1>
          <p className="text-gray-600 mt-2">Create and manage diagnostic tests</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Test
        </Button>
      </div>



      {/* Create/Edit Form */}
      {showForm && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit Test" : "Create New Test"}
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

            {/* Image Upload */}
            <div>
              <Label htmlFor="image">
                Test Image <span className="text-red-500">*</span>
              </Label>
              <div className="mt-2 flex items-center gap-4">
                {formData.image && (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploading(true);
                        const data = new FormData();
                        data.append("image", file);
                        try {
                          const res = await fetch("/api/upload/imgbb", {
                            method: "POST",
                            body: data,
                          });
                          const json = await res.json();
                          if (json.url) {
                            setFormData({ ...formData, image: json.url });
                          } else {
                            alert("Failed to upload image");
                          }
                        } catch (err) {
                          console.error("Upload error:", err);
                          alert("Failed to upload image");
                        } finally {
                          setUploading(false);
                        }
                      }
                    }}
                    disabled={uploading}
                  />
                  {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
                </div>
              </div>
            </div>

            {language === 'en' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">
                      Test Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g., Complete Blood Count (CBC)"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">
                      Price (৳) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="500"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    placeholder="Test description..."
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nameBn">
                      টেস্টের নাম (Test Name Bangla)
                    </Label>
                    <Input
                      id="nameBn"
                      value={formData.nameBn}
                      onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                      placeholder="সম্পূর্ণ রক্ত গণনা (CBC)"
                      className="mt-1"
                      style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">
                      মূল্য (৳) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="500"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="descriptionBn">বিবরণ (Description Bangla)</Label>
                  <textarea
                    id="descriptionBn"
                    value={formData.descriptionBn}
                    onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
                    rows={3}
                    placeholder="টেস্টের বিবরণ..."
                    className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                    style={{ fontFamily: "'Kalpurush', 'SolaimanLipi', sans-serif" }}
                  />
                </div>
              </>
            )}

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update Test" : "Create Test"}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tests List */}
      <Card className="p-6">
        {loading && !showForm ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : filteredTests.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No tests found</p>
            <Button onClick={() => { resetForm(); setShowForm(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Test
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTests.map((test) => (
              <div
                key={test._id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-start justify-between"
              >
                  <div className="flex-1 flex gap-4">
                    {test.image && (
                      <div className="w-16 h-16 rounded-md overflow-hidden shrink-0 border border-gray-200">
                        <img src={test.image} alt={test.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                      </div>
                      {test.description && (
                        <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-bold text-primary text-lg">
                          {test.price}৳
                        </span>
                      </div>
                    </div>
                  </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(test)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(test._id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
    </>
  );
}

