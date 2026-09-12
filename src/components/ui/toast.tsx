"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";

type ToastType = "success" | "info" | "error";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} className="text-success shrink-0" />,
  info: <Info size={18} className="text-primary shrink-0" />,
  error: <AlertCircle size={18} className="text-error shrink-0" />,
};

const ACCENT: Record<ToastType, string> = {
  success: "border-l-success",
  info: "border-l-primary",
  error: "border-l-error",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, message, type }]);
      window.setTimeout(() => dismiss(id), 3800);
    },
    [dismiss]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const welcome = params.get("welcome");
    const userName = params.get("user");
    const firstName = userName?.split(" ")[0];
    if (params.get("signedIn") === "1") {
      if (welcome === "new") {
        toast(`Welcome${firstName ? `, ${firstName}` : ""}! Your account is ready.`);
      } else {
        toast(
          firstName ? `Welcome back, ${firstName}!` : "Welcome back!",
          welcome === "back" ? "info" : "success"
        );
      }
      const clean = new URL(window.location.href);
      clean.searchParams.delete("signedIn");
      clean.searchParams.delete("welcome");
      clean.searchParams.delete("user");
      history.replaceState({}, "", clean.pathname + clean.search);
    }
  }, [toast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm items-center pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl bg-surface-container-lowest shadow-lg border border-outline-variant border-l-4 ${ACCENT[t.type]} px-4 py-3 animate-[toast-in_0.25s_ease-out]`}
            role="status"
          >
            {ICONS[t.type]}
            <p className="text-sm font-medium text-on-surface flex-1 leading-snug pt-0.5">{t.message}</p>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Dismiss"
              className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}