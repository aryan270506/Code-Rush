import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Render Portal */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border bg-[#13162D] border-[#272B49] shadow-xl shadow-black/60 text-sm text-[#F8FAFC] transition-all animate-in slide-in-from-bottom-3"
          >
            {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="h-4 w-4 text-[#EF4444] shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="h-4 w-4 text-[#F59E0B] shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="h-4 w-4 text-[#8B5CF6] shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs leading-relaxed text-[#F8FAFC] font-medium">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#737D9D] hover:text-[#F8FAFC] p-0.5 rounded transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
};
