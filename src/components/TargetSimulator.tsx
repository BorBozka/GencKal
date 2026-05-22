// src/components/TargetSimulator.tsx
import { useState } from "react";

interface TargetSimulatorProps {
    currentWeight: number;
    leanMass: number;
}

export default function TargetSimulator({ currentWeight, leanMass }: TargetSimulatorProps) {
    const [targetState, setTargetState] = useState({
        value: currentWeight,
        followsCurrentWeight: true,
    });

    const minWeight = Math.max(0, Math.ceil(leanMass));
    const maxWeight = Math.max(minWeight, Math.ceil(currentWeight + 20));
    const clampedStoredTarget = Math.min(maxWeight, Math.max(minWeight, targetState.value));
    const targetWeight = targetState.followsCurrentWeight ? currentWeight : clampedStoredTarget;

    // Kilo alımında (Bulk) alınan kilonun %50'sinin kas (lean mass) olduğu varsayılır (gerçekçi temiz bulk).
    // Kilo veriminde ise yağsız kütlenin korunduğu varsayılır (standart definisyon).
    const gainedWeight = targetWeight > currentWeight ? targetWeight - currentWeight : 0;
    const simulatedLeanMass = targetWeight > currentWeight ? leanMass + gainedWeight * 0.5 : leanMass;
    const newBodyFat = targetWeight > 0 ? ((targetWeight - simulatedLeanMass) / targetWeight) * 100 : 0;

    const rangeSize = maxWeight - minWeight;
    const progress = rangeSize > 0
        ? Math.min(100, Math.max(0, ((targetWeight - minWeight) / rangeSize) * 100))
        : 100;

    return (
        <div className="w-full max-w-[320px] md:w-[320px] xl:w-[350px] h-[440px] bg-gradient-to-b from-[#4F46E5] to-[#0F172A] text-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.36)] p-8 flex flex-col shrink-0 animate-fade-in-right">

            {/* Net ve Temiz Başlık */}
            <h2 className="text-xl font-bold text-white text-center mb-6">Hedef Simülatörü</h2>
            {/* Sadece Veri Odaklı Slider Alanı */}
            <div className="my-auto py-4">
                <div className="mb-6 flex w-full items-center justify-between gap-4">
                    <label htmlFor="target-simulator-weight" className="text-sm font-bold tracking-wide text-indigo-200/80">Hedef Kilo</label>
                    <div className="flex min-w-[92px] items-center justify-center rounded-xl border border-white/10 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                        <span className="text-2xl font-bold leading-none text-white">{targetWeight}</span>
                        <span className="ml-1 text-xs font-medium text-indigo-200/80">kg</span>
                    </div>
                </div>

                {/* Range Slider Track & Wrapper */}
                <div className="relative flex w-full items-center py-2">
                    <input
                        id="target-simulator-weight"
                        type="range"
                        min={minWeight}
                        max={maxWeight}
                        value={targetWeight}
                        onChange={(e) => {
                            const nextTargetWeight = Number(e.target.value);
                            setTargetState({
                                value: nextTargetWeight,
                                followsCurrentWeight: nextTargetWeight === currentWeight,
                            });
                        }}
                        style={{
                            background: `linear-gradient(to right, #22d3ee 0%, #22d3ee ${progress}%, rgba(241,245,249,0.18) ${progress}%, rgba(241,245,249,0.18) 100%)`,
                        }}
                        className="h-2 w-full cursor-pointer appearance-none rounded-full outline-none transition-[filter] duration-200 hover:brightness-110 focus-visible:ring-4 focus-visible:ring-cyan-300/20 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-cyan-400 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:transition-transform hover:[&::-moz-range-thumb]:scale-110 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-cyan-400 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110"
                    />
                </div>

                <div className="mt-3 flex justify-between px-1 text-xs font-medium tracking-wide text-indigo-300/80">
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
