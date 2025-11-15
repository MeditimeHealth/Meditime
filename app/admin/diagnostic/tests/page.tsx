"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X, Trash2, Edit } from "lucide-react";

interface DiagnosticTest {
  _id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  originalPrice?: number;
  duration?: string;
  preparation?: string;
  fastingRequired?: boolean;
}

export default function DiagnosticTestsPage() {
  const [tests, setTests] = useState<DiagnosticTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    originalPrice: "",
    duration: "",
    preparation: "",
    fastingRequired: false,
  });

  const categories = ["Blood Tests", "Cardiology", "Imaging", "Pathology"];

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
    setLoading(true);

    try {
      const url = "/api/diagnostic/tests";
      const method = editingId ? "PUT" : "POST";
      const body = {
        ...(editingId && { id: editingId }),
        name: formData.name,
        category: formData.category,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
        duration: formData.duration || undefined,
        preparation: formData.preparation || undefined,
        fastingRequired: formData.fastingRequired,
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
        fetchTests();
      } else {
        alert(data.error || "Failed to save");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (test: DiagnosticTest) => {
    setEditingId(test._id);
    setFormData({
      name: test.name,
      category: test.category,
      description: test.description || "",
      price: test.price.toString(),
      originalPrice: test.originalPrice?.toString() || "",
      duration: test.duration || "",
      preparation: test.preparation || "",
      fastingRequired: test.fastingRequired || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this test?")) return;

    try {
      const response = await fetch(`/api/diagnostic/tests/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setTests(tests.filter((test) => test._id !== id));
        alert("Test deleted successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete test");
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      alert("Failed to delete test");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      price: "",
      originalPrice: "",
      duration: "",
      preparation: "",
      fastingRequired: false,
    });
    setEditingId(null);
  };

  const filteredTests = tests.filter(
    test => !formData.category || test.category === formData.category || formData.category === ""
  );

  return (
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

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Label>Filter by Category:</Label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
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
                <Label htmlFor="category">
                  Category <span className="text-red-500">*</span>
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
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

              <div>
                <Label htmlFor="originalPrice">Original Price (৳) - for discount</Label>
                <Input
                  id="originalPrice"
                  type="number"
                  step="0.01"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  placeholder="600"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="e.g., 1-2 hours"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="fastingRequired" className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="fastingRequired"
                    checked={formData.fastingRequired}
                    onChange={(e) => setFormData({ ...formData, fastingRequired: e.target.checked })}
                    className="h-4 w-4"
                  />
                  Fasting Required
                </Label>
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

            <div>
              <Label htmlFor="preparation">Preparation Instructions</Label>
              <textarea
                id="preparation"
                value={formData.preparation}
                onChange={(e) => setFormData({ ...formData, preparation: e.target.value })}
                rows={2}
                placeholder="Preparation instructions for the patient..."
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm mt-1"
              />
            </div>

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
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{test.name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {test.category}
                    </span>
                    {test.fastingRequired && (
                      <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                        Fasting Required
                      </span>
                    )}
                  </div>
                  {test.description && (
                    <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    {test.originalPrice && test.originalPrice > test.price && (
                      <span className="text-gray-400 line-through">
                        {test.originalPrice}৳
                      </span>
                    )}
                    <span className="font-bold text-primary text-lg">
                      {test.price}৳
                    </span>
                    {test.duration && (
                      <span className="text-gray-500">⏱️ {test.duration}</span>
                    )}
                  </div>
                  {test.preparation && (
                    <p className="text-xs text-gray-500 mt-2">
                      <strong>Preparation:</strong> {test.preparation}
                    </p>
                  )}
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
  );
}

