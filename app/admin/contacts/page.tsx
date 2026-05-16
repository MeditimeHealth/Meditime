"use client";

import { useEffect, useState } from "react";
import { 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  Trash2, 
  CheckCircle, 
  Clock, 
  Search,
  MessageSquare,
  ArrowRight
} from "lucide-react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'resolved';
  createdAt: string;
}

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const LIMIT = 10;

  useEffect(() => {
    fetchMessages(currentPage);
  }, [currentPage]);

  const fetchMessages = async (page: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contact?page=${page}&limit=${LIMIT}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages);
        setTotalPages(data.totalPages);
        setTotalMessages(data.total);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };



  const deleteMessage = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/contact/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Message deleted");
        fetchMessages(currentPage);
        if (selectedMessage?._id === id) setSelectedMessage(null);
      }
    } catch (error) {
      toast.error("Failed to delete message");
    } finally {
      setMessageToDelete(null);
      setLoading(false);
    }
  };

  const filteredMessages = messages.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              Contact Messages
            </h1>
            <p className="text-slate-500 mt-2">Manage and respond to user inquiries from the website.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name, email or phone..."
              className="pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-80 outline-none focus:border-primary transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Messages List */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="bg-white p-12 rounded-[32px] text-center shadow-sm border border-slate-100">
                <Mail className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium">No messages found</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <motion.div
                  layout
                  key={msg._id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`
                    p-6 rounded-3xl cursor-pointer transition-all border shadow-sm
                    ${selectedMessage?._id === msg._id 
                      ? 'bg-primary border-primary text-white shadow-primary/20' 
                      : 'bg-white border-slate-100 hover:border-primary/30 text-slate-900'}
                  `}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold truncate max-w-[200px]">{msg.name}</h3>
                  </div>
                  <p className={`text-sm font-semibold truncate mb-1 ${selectedMessage?._id === msg._id ? 'text-white/90' : 'text-slate-700'}`}>
                    {msg.subject || 'No Subject'}
                  </p>
                  <p className={`text-xs truncate mb-3 ${selectedMessage?._id === msg._id ? 'text-white/70' : 'text-slate-500'}`}>
                    {msg.message}
                  </p>
                  <div className={`flex items-center gap-3 text-xs ${selectedMessage?._id === msg._id ? 'text-white/60' : 'text-slate-400'}`}>
                    <Calendar className="w-3 h-3" />
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))
            )}

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mt-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-colors"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" />
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">Page {currentPage}</span>
                  <span className="text-sm text-slate-400">of {totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}
            
            <div className="text-center px-4">
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                Total {totalMessages} messages
              </p>
            </div>
          </div>

          {/* Message Detail View */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {selectedMessage ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-[32px] p-8 md:p-10 shadow-xl border border-slate-100 sticky top-10"
                >
                  <div className="flex justify-between items-start border-b border-slate-50 pb-8 mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-4">{selectedMessage.name}</h2>
                      <div className="space-y-3">
                        <a href={`mailto:${selectedMessage.email}`} className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors">
                          <Mail className="w-5 h-5 text-primary" />
                          {selectedMessage.email}
                        </a>
                        <a href={`tel:${selectedMessage.phone}`} className="flex items-center gap-3 text-slate-600 hover:text-primary transition-colors">
                          <Phone className="w-5 h-5 text-primary" />
                          {selectedMessage.phone}
                        </a>
                      </div>
                    </div>
                    <button 
                      onClick={() => setMessageToDelete(selectedMessage._id)}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                    >
                      <Trash2 className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="mb-8">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3">Subject</h4>
                    <p className="text-xl font-bold text-slate-900">{selectedMessage.subject || 'No Subject'}</p>
                  </div>

                  <div className="mb-10">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Message</h4>
                    <div className="bg-slate-50 p-6 rounded-2xl text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {selectedMessage.message}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-50">
                    <p className="text-xs text-slate-400 font-medium italic">
                      Inquiry received on {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center bg-white/50 border-2 border-dashed border-slate-200 rounded-[40px] p-20 text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                    <ArrowRight className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-500 mb-2">Select a Message</h3>
                  <p className="text-slate-400">Click on a message from the list to view its full content and manage its status.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {messageToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMessageToDelete(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[32px] p-8 md:p-10 shadow-2xl max-w-md w-full text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Delete Message?</h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Are you sure you want to delete this message? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setMessageToDelete(null)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMessage(messageToDelete)}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all active:scale-95"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
