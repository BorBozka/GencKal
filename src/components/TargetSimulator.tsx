// src/components/TargetSimulator.tsx
import { useState } from "react";

interface TargetSimulatorProps {
    currentWeight: number;
    leanMass: number;
}

export default function TargetSimulator({ currentWeight, leanMass }: TargetSimulatorProps) {
    const [targetWeight, setTargetWeight] = useState(currentWeight);

    // Kilo alımında (Bulk) alınan kilonun %50'sinin kas (lean mass) olduğu varsayılır (gerçekçi temiz bulk).
    // Kilo veriminde ise yağsız kütlenin korunduğu varsayılır (standart definisyon).
    const gainedWeight = targetWeight > currentWeight ? targetWeight - currentWeight : 0;
    const simulatedLeanMass = targetWeight > currentWeight ? leanMass + gainedWeight * 0.5 : leanMass;
    const newBodyFat = targetWeight > 0 ? ((targetWeight - simulatedLeanMass) / targetWeight) * 100 : 0;

    const minWeight = Math.ceil(leanMass);
    const maxWeight = currentWeight + 20;

    return (
        <div className="w-full max-w-[320px] md:w-[320px] xl:w-[350px] h-[440px] bg-gradient-to-b from-[#4F46E5] to-[#0F172A] text-white rounded-2xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.85)] p-8 flex flex-col shrink-0 animate-fade-in-right">

            {/* Net ve Temiz Başlık */}
            <h3 className="text-xl font-bold text-white text-center mb-6">Hedef Simülatörü</h3>
            {/* Sadece Veri Odaklı Slider Alanı */}
            <div className="space-y-6 my-auto py-4">
                <div className="flex flex-col items-center justify-center text-white font-medium gap-1">
                    <span className="text-indigo-200/80 text-sm">Hedef Kilo</span>
                    <span className="text-4xl text-cyan-400 font-black tracking-tight">{targetWeight} <span className="text-xl text-cyan-400/80 font-bold">kg</span></span>
                </div>

                {/* Range Slider Track & Wrapper */}
                <div className="w-full relative py-2">
                    <div className="relative h-2 bg-indigo-950/80 rounded-full flex items-center w-full border border-indigo-500/20">
                        <input
                            type="range"
                            min={minWeight}
                            max={maxWeight}
                            value={targetWeight}
                            onChange={(e) => setTargetWeight(Number(e.target.value))}
                            className="absolute w-full appearance-none bg-transparent cursor-pointer z-20 h-full"
                        />
                    </div>
                </div>

                <div className="flex justify-between text-[10px] text-indigo-300/80 font-medium px-1">
                    <span>Min: {minWeight} kg</span>
                    <span>Max: {maxWeight} kg</span>
                </div>
            </div>

            {/* Sade ve Keskin Sonuç Paneli */}
            <div className="bg-indigo-900/40 rounded-2xl p-5 border border-indigo-500/30 flex flex-col justify-center items-center text-center mt-auto gap-2">
                <div className="flex flex-col">
                    <span className="text-indigo-200 text-xs font-medium mb-1">Yeni Yağ Oranı</span>
                    <span className="text-5xl font-black text-white">
                        % {newBodyFat > 0 ? newBodyFat.toFixed(1) : "0.0"}
                    </span>
                </div>
            </div>

        </div>
    );
}
