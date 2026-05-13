'use client';

import { createContext, useContext, useCallback, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

type Toast = { id: number; status: 'success' | 'error'; message: string };
type ToastContextValue = { toast: (status: 'success' | 'error', message: string) => void };

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });
export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((status: 'success' | 'error', message: string) => {
    const id = ++nextId;
    setToasts(prev => [...prev.slice(-2), { id, status, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {toasts.map(t => {
            const ok = t.status === 'success';
            const Icon = ok ? CheckCircle2 : XCircle;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                className={`pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-2.5 shadow-xl shadow-black/30 ${
                  ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[13px] font-medium">{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
