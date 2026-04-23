// src/components/ui/MacroBar.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MacroBarProps {
  label: string;
  percent: number;
  grams?: number;
  color: string;
  delay: number;
  animate: boolean;
}

export const MacroBar: React.FC<MacroBarProps> = ({ label, percent, grams, color, delay, animate }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setWidth(percent), delay);
    return () => clearTimeout(timer);
  }, [animate, percent, delay]);

  return (
    <div className="flex items-center gap-3">
      {/* 1. ETİKET RENGİ: Slate yerine parent bileşenle uyumlu indigo-200/50 kullanıldı */}
      <span className="text-indigo-200/50 text-[10px] font-bold uppercase tracking-widest w-14 text-right shrink-0">
        {label}
      </span>

      {/* 2. ÇUBUK ARKA PLANI: Koyu slate yerine, cam efektli panele oturacak yarı saydam katman eklendi */}
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden shadow-inner">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* 3. DEĞER METNİ: Kontrast için saf beyaz tutuldu */}
      <span className="text-white text-xs font-bold w-12 text-right">
        {animate ? (grams !== undefined ? `${grams}g` : `${percent}%`) : "—"}
      </span>
    </div>
  );
};