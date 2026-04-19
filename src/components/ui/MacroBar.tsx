"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface MacroBarProps {
  label: string;
  percent: number;
  color: string;
  delay: number;
  animate: boolean;
}

export const MacroBar: React.FC<MacroBarProps> = ({ label, percent, color, delay, animate }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!animate) return;
    const timer = setTimeout(() => setWidth(percent), delay);
    return () => clearTimeout(timer);
  }, [animate, percent, delay]);

  return (
    <div className="flex items-center gap-3">
      <span className="text-indigo-200/50 text-[10px] font-bold uppercase tracking-widest w-14 text-right shrink-0">
        {label}
      </span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${width}%` }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <span className="text-white/60 text-xs font-bold w-10 text-right">
        {animate ? `${percent}%` : "—"}
      </span>
    </div>
  );
};