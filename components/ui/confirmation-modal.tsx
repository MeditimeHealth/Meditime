"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  language?: "en" | "bn";
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = "danger",
  language = "en",
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  const fontStyle = {};

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-full shrink-0 ${variant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-primary/10 text-primary'}`}>
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-gray-900 mb-2" style={fontStyle}>
                  {title}
                </h3>
                <p className="text-gray-600 leading-relaxed" style={fontStyle}>
                  {message}
                </p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row-reverse gap-3">
            <Button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`rounded-xl font-bold px-6 h-11 ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-primary hover:bg-primary/90 text-white'}`}
              style={fontStyle}
            >
              {confirmText || (language === 'bn' ? 'নিশ্চিত করুন' : 'Confirm')}
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-xl font-bold px-6 h-11 border-gray-200 text-gray-600 hover:bg-gray-100"
              style={fontStyle}
            >
              {cancelText || (language === 'bn' ? 'বাতিল' : 'Cancel')}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
