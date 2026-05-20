"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
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
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
};

const borderMap = {
    success: "border-emerald-200",
    error: "border-red-200",
    info: "border-blue-200",
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
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className={`bg-white rounded-2xl p-4 border ${borderMap[t.type]} shadow-hover flex items-start gap-3 max-w-sm w-full pointer-events-auto`}
        >
            {iconMap[t.type]}
            <div className="flex-1 min-w-0">
                <p className="text-slate-900 font-bold text-sm">{t.title}</p>
                {t.description && (
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{t.description}</p>
                )}
            </div>
            <button onClick={() => onDismiss(t.id)} className="text-slate-300 hover:text-slate-500 transition-colors shrink-0">
                <X className="w-4 h-4" />
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

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            {/* Toast Konteyner — Sağ üst */}
            <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map(t => (
                        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
