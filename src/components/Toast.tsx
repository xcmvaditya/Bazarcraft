import React from "react";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "error" | "info";
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div id="toast-root" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === "success";
          const isError = toast.type === "error";
          
          return (
            <motion.div
              id={`toast-${toast.id}`}
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto flex items-start gap-3 w-full bg-slate-900 border border-slate-800 text-white rounded-xl p-4 shadow-xl shadow-black/30"
            >
              <div className="mt-0.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-amber-400" />}
              </div>
              <div className="flex-1 text-sm font-medium text-slate-100">
                {toast.text}
              </div>
              <button
                id={`toast-close-${toast.id}`}
                onClick={() => onRemove(toast.id)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
