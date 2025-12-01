"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Phone, 
  DollarSign,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  Loader2,
  FileText,
  Image as ImageIcon
} from "lucide-react";

interface Withdrawal {
  _id: string;
  amount: number;
  patientName: string;
  patientPhone: string;
  hospitalName: string;
  proofPhotos: string[];
  paymentMethod: string;
  paymentDetails: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  processedAt?: string;
  createdAt: string;
  affiliateId: {
    _id: string;
    name: string;
    affiliateCode: string;
    email: string;
    phoneNumber: string;
    walletBalance: number;
  };
  processedBy?: {
    fullName: string;
    email: string;
  };
  notes?: string;
}

export default function AffiliateWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [processing, setProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const statusParam = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`/api/admin/affiliate-withdrawals${statusParam}`);
      const data = await response.json();
      
      if (response.ok) {
        setWithdrawals(data.withdrawals || []);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (action: 'approve' | 'reject') => {
    if (!selectedWithdrawal) return;

    if (action === 'reject' && !rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setProcessing(true);
      const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {};
      
      const response = await fetch(
        `/api/admin/affiliate-withdrawals/${selectedWithdrawal._id}/process`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action,
            adminId: user._id || user.id,
            rejectionReason: action === 'reject' ? rejectionReason : undefined,
            notes: adminNotes || undefined,
          }),
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        alert(data.message);
        setSelectedWithdrawal(null);
        setRejectionReason("");
        setAdminNotes("");
        fetchWithdrawals();
      } else {
        alert(data.error || 'Failed to process withdrawal');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Failed to process withdrawal');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Withdrawal Requests</h1>
        <p className="text-gray-600 mt-1">Manage affiliate withdrawal requests</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            onClick={() => setFilter('pending')}
          >
            Pending
          </Button>
          <Button
            variant={filter === 'approved' ? 'default' : 'outline'}
            onClick={() => setFilter('approved')}
          >
            Approved
          </Button>
          <Button
            variant={filter === 'rejected' ? 'default' : 'outline'}
            onClick={() => setFilter('rejected')}
          >
            Rejected
          </Button>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawals List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Withdrawal Requests</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : withdrawals.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No withdrawal requests found</p>
            </Card>
          ) : (
            withdrawals.map((withdrawal) => {
              const affiliate = withdrawal.affiliateId;
              
              return (
                <Card
                  key={withdrawal._id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedWithdrawal?._id === withdrawal._id 
                      ? 'border-2 border-primary bg-primary/5' 
                      : ''
                  }`}
                  onClick={() => setSelectedWithdrawal(withdrawal)}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {affiliate ? (
                            <>
                              {affiliate.name} ({affiliate.affiliateCode})
                            </>
                          ) : (
                            "Unknown affiliate"
                          )}
                        </h3>
                        {affiliate && (
                          <p className="text-sm text-gray-600">{affiliate.email}</p>
                        )}
                      </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(withdrawal.status)}`}>
                      {withdrawal.status.toUpperCase()}
                    </span>
                  </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Requested Amount:</span>
                        <span className="text-xl font-bold text-primary">৳{withdrawal.amount.toFixed(2)}</span>
                      </div>
                      {affiliate && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-gray-600">Current Balance:</span>
                          <span className="text-sm font-medium">৳{affiliate.walletBalance.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      {formatDate(withdrawal.createdAt)}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Withdrawal Details */}
        <div className="lg:sticky lg:top-6 lg:h-fit">
          {selectedWithdrawal ? (
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">Withdrawal Details</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(selectedWithdrawal.status)}`}>
                    {selectedWithdrawal.status.toUpperCase()}
                  </span>
                </div>

                {/* Amount */}
                <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Withdrawal Amount:</span>
                    <span className="text-2xl font-bold text-primary">
                      ৳{selectedWithdrawal.amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Affiliate Info */}
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-sm text-gray-700">Affiliate Information</h3>
                  <div className="space-y-1 text-sm">
                    {selectedWithdrawal.affiliateId ? (
                      <>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-600" />
                          <span>{selectedWithdrawal.affiliateId.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-600" />
                          <span>{selectedWithdrawal.affiliateId.phoneNumber}</span>
                        </div>
                        <div className="text-xs text-gray-600">
                          Code: {selectedWithdrawal.affiliateId.affiliateCode}
                        </div>
                        <div className="text-xs text-gray-600">
                          Wallet Balance: ৳{selectedWithdrawal.affiliateId.walletBalance.toFixed(2)}
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-gray-500">
                        Affiliate information not available (record not linked).
                      </p>
                    )}
                  </div>
                </div>

                {/* Service Details */}
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-sm text-gray-700">Service Details</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Patient:</strong> {selectedWithdrawal.patientName}</p>
                    <p><strong>Phone:</strong> {selectedWithdrawal.patientPhone}</p>
                    <p><strong>Hospital:</strong> {selectedWithdrawal.hospitalName}</p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-sm text-gray-700">Payment Information</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Method:</strong> {selectedWithdrawal.paymentMethod}</p>
                    <p><strong>Details:</strong> {selectedWithdrawal.paymentDetails}</p>
                  </div>
                </div>

                {/* Proof Photos */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm text-gray-700">Proof Photos ({selectedWithdrawal.proofPhotos.length})</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedWithdrawal.proofPhotos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo}
                          alt={`Proof ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <a
                          href={photo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg"
                        >
                          <ImageIcon className="h-8 w-8 text-white" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Admin Notes (if processed) */}
                {selectedWithdrawal.processedAt && (
                  <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-primary">
                    <p className="text-xs text-gray-600 mb-1">
                      Processed by {selectedWithdrawal.processedBy?.fullName} on {formatDate(selectedWithdrawal.processedAt)}
                    </p>
                    {selectedWithdrawal.rejectionReason && (
                      <p className="text-sm text-red-600 mt-2">
                        <strong>Reason:</strong> {selectedWithdrawal.rejectionReason}
                      </p>
                    )}
                    {selectedWithdrawal.notes && (
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Notes:</strong> {selectedWithdrawal.notes}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Section (only for pending) */}
                {selectedWithdrawal.status === 'pending' && (
                  <div className="space-y-4 pt-4 border-t">
                    {/* Admin Notes */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Admin Notes (Optional)</label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add any notes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={2}
                      />
                    </div>

                    {/* Rejection Reason */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Rejection Reason (if rejecting)</label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Required for rejection..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        rows={2}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleProcess('approve')}
                        disabled={processing}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {processing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleProcess('reject')}
                        disabled={processing}
                        variant="destructive"
                        className="flex-1"
                      >
                        {processing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">
                Select a withdrawal request to view details
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
