"use client";

import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";

const statusMessages = [
    "Yapay Zeka analiz ediyor...",
    "Besin değerleri hesaplanıyor...",
    "Öğünler oluşturuluyor...",
    "Makro dengesi ayarlanıyor...",
    "Son dokunuşlar yapılıyor...",
];

export function SkeletonLoading() {
    const [msgIndex, setMsgIndex] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Durum mesajlarını 4 saniyede bir değiştir
        const msgInterval = setInterval(() => {
            setMsgIndex(prev => Math.min(prev + 1, statusMessages.length - 1));
        }, 4000);

        // İlerleme çubuğunu yavaşça ilerlet (maks %90)
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 90) return 90;
                // Başta hızlı, sonra yavaşlayan ilerleme
                const increment = Math.max(0.3, (90 - prev) * 0.03);
                return Math.min(90, prev + increment);
            });
        }, 500);

        return () => {
            clearInterval(msgInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <div className="flex flex-col gap-5 w-full animate-pulse">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-soft">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                        <Sparkles className="text-[#3E3AAF] w-4 h-4 animate-spin" style={{ animationDuration: "3s" }} />
                    </div>
                    <div className="flex-1">
                        <span className="text-slate-700 text-sm font-bold block">{statusMessages[msgIndex]}</span>
                    </div>
                </div>
                {/* İlerleme Çubuğu */}
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-[#3E3AAF] to-indigo-400 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-soft"
                    style={{ animationDelay: `${i * 150}ms` }}>
                    <div className="h-3.5 bg-slate-100 rounded-full w-1/3 mb-4" />
                    <div className="h-2.5 bg-slate-50 rounded-full w-full mb-3" />
                    <div className="h-2.5 bg-slate-50 rounded-full w-2/3" />
                </div>
            ))}
        </div>
    );
}
