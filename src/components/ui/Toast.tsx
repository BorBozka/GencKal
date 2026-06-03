"use client";

import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";
import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";

// --- TİPLER ---
type ToastType = "success" | "error" | "info";

interface ToastMessage {
    id: number;
    type: ToastType;
    title: string;
    description?: string;
}

interface ToastContextValue {
    toast: (type: ToastType, title: string, description?: string) => void;
}

// --- CONTEXT ---
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}

// --- İKON SEÇİCİ ---
const iconMap = {
    success: <CheckCircle2 className="h-5 w-5" />,
    error: <AlertTriangle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
};

const toneMap = {
    success: {
        accent: "bg-indigo-600",
        icon: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    },
    error: {
        accent: "bg-rose-500",
        icon: "bg-rose-50 text-rose-600 ring-rose-100",
    },
    info: {
        accent: "bg-indigo-600",
        icon: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    },
};

// --- TEK TOAST BİLEŞENİ ---
function ToastItem({ toast: t, onDismiss }: { toast: ToastMessage; onDismiss: (id: number) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => onDismiss(t.id), 4000);
        return () => clearTimeout(timer);
    }, [t.id, onDismiss]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 pr-3 shadow-[0_18px_45px_rgba(15,23,42,0.14)] ring-1 ring-slate-950/5"
        >
            <div className={`absolute inset-y-0 left-0 w-1.5 ${toneMap[t.type].accent}`} />
            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl ring-1 ${toneMap[t.type].icon}`}>
                {iconMap[t.type]}
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-extrabold text-slate-950">{t.title}</p>
                {t.description && (
                    <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{t.description}</p>
                )}
            </div>
            <button
                type="button"
                onClick={() => onDismiss(t.id)}
                aria-label="Bildirimi kapat"
                className="grid h-8 w-8 shrink-0 cursor-pointer place-items-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
                <X className="h-4 w-4" />
            </button>
        </motion.div>
    );
}

// --- PROVIDER ---
let idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const dismiss = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addToast = useCallback((type: ToastType, title: string, description?: string) => {
        const id = ++idCounter;
        setToasts(prev => [...prev, { id, type, title, description }]);
    }, []);
    const value = useMemo<ToastContextValue>(() => ({ toast: addToast }), [addToast]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            {/* Toast Konteyner — Sağ alt */}
            <div className="pointer-events-none fixed inset-x-4 bottom-6 z-[100] flex flex-col items-end gap-3 sm:right-6 sm:left-auto">
                <AnimatePresence mode="popLayout">
                    {toasts.map(t => (
                        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
