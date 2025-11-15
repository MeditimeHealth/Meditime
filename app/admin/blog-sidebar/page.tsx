"use client";

import { useEffect, useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Loader2, Save, Upload, X } from "lucide-react";
import Image from "next/image";

interface BlogSidebarPhoto {
  _id: string;
  imageUrl: string;
  linkUrl: string;
  title?: string;
  order: number;
  isActive: boolean;
}

export default function BlogSidebarPage() {
  const [photos, setPhotos] = useState<BlogSidebarPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    imageUrl: "",
    linkUrl: "",
    title: "",
  });
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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

  const fetchPhotos = useCallback(async () => {
    if (!user || !user.id) return;
    
    try {
      setLoading(true);
      // Fetch all photos for admin (including inactive)
      const response = await fetch(`/api/blog-sidebar/all?userId=${user.id}`);
      const data = await response.json();
      if (data.photos) {
        setPhotos(data.photos);
      }
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      fetchPhotos();
    }
  }, [user, fetchPhotos]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("Image size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      alert("Please select an image file");
      return;
    }

    try {
      setUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("image", selectedFile);

      const response = await fetch("/api/upload/imgbb", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();
      if (response.ok) {
        setFormData({ ...formData, imageUrl: data.url });
        setSelectedFile(null);
        setPreviewImage(null);
        // Reset file input
        const fileInput = document.getElementById("imageFile") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        alert(data.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleAddPhoto = async () => {
    if (!formData.imageUrl || !formData.linkUrl) {
      alert("Please fill in Image URL and Link URL");
      return;
    }

    if (!user || user.role !== "admin") {
      alert("Unauthorized - Admin access required");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch("/api/blog-sidebar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setFormData({ imageUrl: "", linkUrl: "", title: "" });
        setPreviewImage(null);
        setSelectedFile(null);
        setShowAddForm(false);
        fetchPhotos();
      } else {
        alert(data.error || "Failed to add photo");
      }
    } catch (error) {
      console.error("Error adding photo:", error);
      alert("Failed to add photo");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePhoto = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) {
      return;
    }

    if (!user || user.role !== "admin") {
      alert("Unauthorized - Admin access required");
      return;
    }

    try {
      setDeleting(id);
      const response = await fetch(`/api/blog-sidebar/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      if (response.ok) {
        fetchPhotos();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Failed to delete photo");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Sidebar Photos</h1>
          <p className="text-gray-600 mt-1">
            Manage photos displayed in the blog post sidebar
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Photo
        </Button>
      </div>

      {/* Add Photo Form */}
      {showAddForm && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add New Photo</h2>
          <div className="space-y-4">
            {/* Image Upload Section */}
            <div>
              <Label htmlFor="imageFile">Upload Image *</Label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <label
                    htmlFor="imageFile"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 text-sm"
                  >
                    <Upload className="h-4 w-4" />
                    Choose Image
                  </label>
                  {selectedFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleUploadImage}
                      disabled={uploading}
                      className="flex items-center gap-2"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Upload to ImgBB
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {previewImage && (
                  <div className="relative w-full h-48 border border-gray-300 rounded-md overflow-hidden bg-gray-100">
                    <Image
                      src={previewImage}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                    <button
                      onClick={() => {
                        setPreviewImage(null);
                        setSelectedFile(null);
                        const fileInput = document.getElementById("imageFile") as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {formData.imageUrl && (
                  <div className="p-2 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-xs text-green-700">
                      ✓ Image uploaded: {formData.imageUrl.substring(0, 50)}...
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="imageUrl">Or Enter Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                placeholder="https://example.com/image.jpg"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="linkUrl">Link URL *</Label>
              <Input
                id="linkUrl"
                value={formData.linkUrl}
                onChange={(e) =>
                  setFormData({ ...formData, linkUrl: e.target.value })
                }
                placeholder="/blog/post-slug or https://example.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="title">Title (Optional)</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Photo title"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleAddPhoto}
                disabled={saving}
                className="flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Add Photo
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ imageUrl: "", linkUrl: "", title: "" });
                  setPreviewImage(null);
                  setSelectedFile(null);
                  const fileInput = document.getElementById("imageFile") as HTMLInputElement;
                  if (fileInput) fileInput.value = "";
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Photos List */}
      {photos.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No photos added yet. Click "Add Photo" to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <Card key={photo._id} className="overflow-hidden">
              <div className="relative h-48 w-full bg-gray-100">
                <Image
                  src={photo.imageUrl}
                  alt={photo.title || "Sidebar photo"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/slide.jpg";
                  }}
                />
              </div>
              <div className="p-4">
                {photo.title && (
                  <h3 className="font-semibold text-sm mb-2 line-clamp-1">
                    {photo.title}
                  </h3>
                )}
                <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                  Link: {photo.linkUrl}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    Order: {photo.order}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePhoto(photo._id)}
                    disabled={deleting === photo._id}
                    className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700"
                  >
                    {deleting === photo._id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                    Delete
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

