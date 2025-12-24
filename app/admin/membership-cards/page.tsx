"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  Search,
  Eye,
  Edit,
  Trash2,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Upload,
  Loader2,
} from "lucide-react";
import Image from "next/image";

interface MembershipCard {
  _id: string;
  serialNumber: string;
  name: string;
  photo?: string;
  cardType: "silver" | "gold" | "platinum" | "corporate";
  expiryDate: string;
  isActive: boolean;
  phoneNumber?: string;
  email?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminMembershipCardsPage() {
  const [cards, setCards] = useState<MembershipCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<MembershipCard | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    photo: "",
    cardType: "silver",
    expiryDate: "",
    phoneNumber: "",
    email: "",
    address: "",
    notes: "",
    serialNumber: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/membership-cards");
      const data = await response.json();
      if (response.ok) {
        setCards(data.cards);
      }
    } catch (error) {
      console.error("Error fetching cards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (card?: MembershipCard) => {
    if (card) {
      setEditingCard(card);
      setFormData({
        name: card.name,
        photo: card.photo || "",
        cardType: card.cardType,
        expiryDate: new Date(card.expiryDate).toISOString().split("T")[0],
        phoneNumber: card.phoneNumber || "",
        email: card.email || "",
        address: card.address || "",
        notes: card.notes || "",
        serialNumber: card.serialNumber,
      });
    } else {
      setEditingCard(null);
      // Set default expiry date to 1 year from now
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      setFormData({
        name: "",
        photo: "",
        cardType: "silver",
        expiryDate: oneYearFromNow.toISOString().split("T")[0],
        phoneNumber: "",
        email: "",
        address: "",
        notes: "",
        serialNumber: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCard(null);
    setPreviewImage(null);
    setSelectedFile(null);
  };

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
        setFormData({ ...formData, photo: data.url });
        setSelectedFile(null);
        setPreviewImage(null);
        // Reset file input
        const fileInput = document.getElementById("cardPhotoFile") as HTMLInputElement;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = editingCard
        ? `/api/membership-cards/${editingCard._id}`
        : "/api/membership-cards";
      const method = editingCard ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(editingCard ? "Card updated successfully" : "Card created successfully");
        handleCloseModal();
        fetchCards();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save card");
      }
    } catch (error) {
      console.error("Error saving card:", error);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (card: MembershipCard) => {
    try {
      const response = await fetch(`/api/membership-cards/${card._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !card.isActive }),
      });

      if (response.ok) {
        fetchCards();
      } else {
        alert("Failed to update card status");
      }
    } catch (error) {
      console.error("Error updating card:", error);
      alert("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this card?")) return;

    try {
      const response = await fetch(`/api/membership-cards/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Card deleted successfully");
        fetchCards();
      } else {
        alert("Failed to delete card");
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      alert("An error occurred");
    }
  };

  const getCardTypeBadge = (type: string) => {
    const typeColors: Record<string, string> = {
      silver: "bg-gray-200 text-gray-800",
      gold: "bg-yellow-100 text-yellow-800",
      platinum: "bg-purple-100 text-purple-800",
      corporate: "bg-blue-100 text-blue-800",
    };
    return typeColors[type] || "bg-gray-100 text-gray-800";
  };

  const getStatusInfo = (card: MembershipCard) => {
    const now = new Date();
    const expiryDate = new Date(card.expiryDate);
    const isExpired = expiryDate < now;

    if (!card.isActive) {
      return { text: "Deactivated", color: "bg-red-100 text-red-800" };
    }
    if (isExpired) {
      return { text: "Expired", color: "bg-orange-100 text-orange-800" };
    }
    return { text: "Active", color: "bg-green-100 text-green-800" };
  };

  const filteredCards = cards.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.phoneNumber?.includes(searchTerm) ||
      card.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || card.cardType === filterType;

    let matchesStatus = true;
    if (filterStatus === "active") {
      matchesStatus = card.isActive && new Date(card.expiryDate) >= new Date();
    } else if (filterStatus === "expired") {
      matchesStatus = new Date(card.expiryDate) < new Date();
    } else if (filterStatus === "deactivated") {
      matchesStatus = !card.isActive;
    }

    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: cards.length,
    active: cards.filter((c) => c.isActive && new Date(c.expiryDate) >= new Date()).length,
    expired: cards.filter((c) => new Date(c.expiryDate) < new Date()).length,
    deactivated: cards.filter((c) => !c.isActive).length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Membership Cards
          </h1>
          <p className="text-gray-600">
            Manage and issue membership cards to customers
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5" />
          Issue New Card
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Cards</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <CreditCard className="w-10 h-10 text-blue-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-orange-600">{stats.expired}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-500" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-lg shadow p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Deactivated</p>
              <p className="text-2xl font-bold text-red-600">{stats.deactivated}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, serial, phone, or email..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Card Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cardholder
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No cards found
                  </td>
                </tr>
              ) : (
                filteredCards.map((card) => {
                  const statusInfo = getStatusInfo(card);
                  return (
                    <tr key={card._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {card.photo ? (
                            <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3">
                              <Image
                                src={card.photo}
                                alt={card.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                              <span className="text-gray-500 font-medium">
                                {card.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {card.name}
                            </div>
                            {card.phoneNumber && (
                              <div className="text-sm text-gray-500">
                                {card.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm text-gray-900">
                          {card.serialNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${getCardTypeBadge(
                            card.cardType
                          )}`}
                        >
                          {card.cardType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(card.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}
                        >
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleOpenModal(card)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(card)}
                          className={
                            card.isActive
                              ? "text-orange-600 hover:text-orange-900"
                              : "text-green-600 hover:text-green-900"
                          }
                          title={card.isActive ? "Deactivate" : "Activate"}
                        >
                          {card.isActive ? (
                            <XCircle className="w-4 h-4 inline" />
                          ) : (
                            <CheckCircle className="w-4 h-4 inline" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(card._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">
                  {editingCard ? "Edit Card" : "Issue New Card"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cardholder Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.cardType}
                      onChange={(e) =>
                        setFormData({ ...formData, cardType: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="silver">Silver</option>
                      <option value="gold">Gold</option>
                      <option value="platinum">Platinum</option>
                      <option value="corporate">Corporate</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Serial Number {!editingCard && "(Auto-generated if empty)"}
                    </label>
                    <input
                      type="text"
                      value={formData.serialNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, serialNumber: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      placeholder="MT24XXXXXX"
                      disabled={!!editingCard}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.expiryDate}
                      onChange={(e) =>
                        setFormData({ ...formData, expiryDate: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, phoneNumber: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Photo
                  </label>
                  
                  {/* Image Upload Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        id="cardPhotoFile"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label
                        htmlFor="cardPhotoFile"
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm"
                      >
                        <Upload className="h-4 w-4" />
                        Choose Image
                      </label>
                      {selectedFile && (
                        <button
                          type="button"
                          onClick={handleUploadImage}
                          disabled={uploading}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm disabled:opacity-50"
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
                        </button>
                      )}
                    </div>
                    
                    {/* Preview */}
                    {previewImage && (
                      <div className="relative w-32 h-32 border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={previewImage}
                          alt="Preview"
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null);
                            setSelectedFile(null);
                            const fileInput = document.getElementById("cardPhotoFile") as HTMLInputElement;
                            if (fileInput) fileInput.value = "";
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    
                    {/* Uploaded URL indicator */}
                    {formData.photo && !previewImage && (
                      <div className="flex items-center gap-2">
                        <div className="relative w-16 h-16 border border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={formData.photo}
                            alt="Current photo"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded">
                            ✓ Photo uploaded
                          </p>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, photo: "" })}
                            className="text-xs text-red-500 hover:underline mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {/* Manual URL input */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        Or enter URL manually:
                      </label>
                      <input
                        type="url"
                        value={formData.photo}
                        onChange={(e) =>
                          setFormData({ ...formData, photo: e.target.value })
                        }
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary text-sm"
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Saving..." : editingCard ? "Update Card" : "Issue Card"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
