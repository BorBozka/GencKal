// src/components/TargetSimulator.tsx
import React, { useState, useEffect } from "react";

interface TargetSimulatorProps {
    currentWeight: number;
    leanMass: number;
    currentBodyFat: number;
}

export default function TargetSimulator({ currentWeight, leanMass, currentBodyFat }: TargetSimulatorProps) {
    const [targetWeight, setTargetWeight] = useState(currentWeight);

    useEffect(() => {
        setTargetWeight(currentWeight);
    }, [currentWeight]);

    const newBodyFat = targetWeight > 0 ? ((targetWeight - leanMass) / targetWeight) * 100 : 0;
    const minWeight = Math.ceil(leanMass);

    return (
        <div className="w-full max-w-[320px] xl:max-w-[350px] bg-gradient-to-b from-[#4F46E5] to-[#0F172A] text-white rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.85)] p-8 flex flex-col shrink-0 animate-fade-in-right">

            {/* Net ve Temiz Başlık */}
            <h3 className="text-xl font-bold text-white text-center mb-4">Hedef Simülatörü</h3>

            {/* Sadece Veri Odaklı Slider Alanı */}
            <div className="space-y-6 my-auto py-4">
                <div className="flex flex-col items-center justify-center text-white font-medium gap-1">
                    <span className="text-indigo-200/80 text-sm">Hedef Kilo</span>
                    <span className="text-4xl text-cyan-400 font-black tracking-tight">{targetWeight} <span className="text-xl text-cyan-400/80 font-bold">kg</span></span>
                </div>

                <input
                    type="range"
                    min={minWeight}
                    max={currentWeight}
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(Number(e.target.value))}
                    className="w-full h-2.5 bg-indigo-900/60 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />

                <div className="flex justify-between text-[11px] text-indigo-300/80 font-medium px-1">
                    <span>Min: {minWeight} kg</span>
                    <span>Mevcut: {currentWeight} kg</span>
                </div>
            </div>

            {/* Sade ve Keskin Sonuç Paneli */}
            <div className="bg-indigo-900/40 rounded-2xl p-6 border border-indigo-500/30 flex flex-col justify-center items-center text-center mt-auto">
                <span className="text-indigo-200 text-sm font-medium mb-2">Yeni Yağ Oranı</span>
                <span className="text-5xl font-black text-white">
                    % {newBodyFat > 0 ? newBodyFat.toFixed(1) : "0.0"}
                </span>
            </div>

        </div>
    );
}