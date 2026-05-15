"use client";

import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle, XCircle } from "@phosphor-icons/react";
import { playSound } from "@/lib/sound-engine";
import { confirmation002Sound } from "@/sounds/confirmation-002";
import { error005Sound } from "@/sounds/error-005";
import { useSoundStore } from "@/lib/sound-store";

type Toast = { id: number; status: "success" | "error"; message: string };
type ToastContextValue = {
  toast: (status: "success" | "error", message: string) => void;
};

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });
export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const lastSoundRef = useRef(0);

  const toast = useCallback((status: "success" | "error", message: string) => {
    const id = ++nextId;
    setToasts((prev) => [...prev.slice(-2), { id, status, message }]);
    const now = Date.now();
    if (now - lastSoundRef.current > 300 && useSoundStore.getState().enabled) {
      lastSoundRef.current = now;
      playSound(
        status === "success"
          ? confirmation002Sound.dataUri
          : error005Sound.dataUri,
        { volume: 0.5 },
      );
    }
  }, []);

  return (
    <ToastPrimitive.Provider duration={2500} swipeDirection="up">
      <ToastContext.Provider value={{ toast }}>
        {children}
        {toasts.map((t) => {
          const ok = t.status === "success";
          const Icon = ok ? CheckCircle : XCircle;
          return (
            <ToastPrimitive.Root
              key={t.id}
              className={`toast-root flex items-center gap-2.5 rounded-xl px-4 py-2.5 shadow-xl shadow-black/30 ${
                ok
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-red-500/15 text-red-300"
              }`}
              onOpenChange={(open) => {
                if (!open)
                  setToasts((prev) => prev.filter((x) => x.id !== t.id));
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <ToastPrimitive.Description className="text-[13px] font-medium">
                {t.message}
              </ToastPrimitive.Description>
            </ToastPrimitive.Root>
          );
        })}
        <ToastPrimitive.Viewport className="fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 outline-none md:inset-x-auto md:right-4 md:items-end" />
      </ToastContext.Provider>
    </ToastPrimitive.Provider>
  );
}
