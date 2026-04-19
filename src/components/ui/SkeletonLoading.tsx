import React from "react";
import { Sparkles } from "lucide-react";

export const SkeletonLoading: React.FC = () => {
    return (
        <div className="flex flex-col gap-4 w-full animate-pulse">
            <div className="flex items-center gap-3 mb-2">
                <Sparkles className="text-emerald-400 w-5 h-5 animate-spin" style={{ animationDuration: "3s" }} />
                <span className="text-indigo-200/70 text-sm font-medium">Yapay Zeka Analiz Ediyor...</span>
            </div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/[0.04] rounded-2xl p-5 border border-white/5">
                    <div className="h-3 bg-white/[0.06] rounded-full w-1/3 mb-3" />
                    <div className="h-2.5 bg-white/[0.04] rounded-full w-full mb-2" />
                    <div className="h-2.5 bg-white/[0.04] rounded-full w-2/3" />
                </div>
            ))}
        </div>
    );
};