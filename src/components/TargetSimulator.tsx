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
        <div className="w-full max-w-[320px] xl:max-w-[350px] bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col shrink-0 animate-fade-in-right">

            {/* Net ve Temiz Başlık */}
            <h3 className="text-xl font-bold text-white mb-8">Hedef Simülatörü</h3>

            {/* Sadece Veri Odaklı Slider Alanı */}
            <div className="space-y-4 mb-8">
                <div className="flex justify-between items-end text-white font-medium text-sm">
                    <span>Hedef Kilo</span>
                    <span className="text-2xl text-emerald-400 font-bold">{targetWeight} kg</span>
                </div>

                <input
                    type="range"
                    min={minWeight}
                    max={currentWeight}
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(Number(e.target.value))}
                    className="w-full h-2 bg-indigo-900/50 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />

                <div className="flex justify-between text-[11px] text-indigo-300">
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