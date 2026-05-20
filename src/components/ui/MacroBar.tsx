// src/components/ui/MacroBar.tsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MacroBarProps {
  label: string;
  percent: number;
  grams?: number;
  color: string;
  delay: number;
  animate: boolean;
}

function formatMacroValue(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function MacroBar({ label, percent, grams, color, delay, animate }: MacroBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setWidth(percent), delay);
    return () => clearTimeout(timer);
  }, [animate, percent, delay]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-4">
        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
          {label}
        </span>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold tabular-nums text-slate-900">
            {animate ? (grams !== undefined ? `${formatMacroValue(grams)}g` : `${percent}%`) : "—"}
          </span>
          <span className="font-semibold tabular-nums text-slate-400">
            {animate ? `${percent}%` : "—"}
          </span>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100/80">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
