// Dosya Yolu: src/components/InputPanel.tsx
import React from "react";
// 1. DÜZELTME: "type" anahtar kelimesi eklendi (Derleyici optimizasyonu için)
import type { KullaniciProfil } from "../types";

export interface InputPanelProps {
    data: KullaniciProfil["fizikselVeriler"];
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    // 2. DÜZELTME: "any" kaldırıldı. Değerin, fizikselVeriler objesindeki özelliklerden birinin tipi olacağı garanti altına alındı.
    setField: <K extends keyof KullaniciProfil["fizikselVeriler"]>(
        name: K,
        value: KullaniciProfil["fizikselVeriler"][K]
    ) => void;
}

export default function InputPanel({ data, handleChange }: InputPanelProps) {
    const { boy, kilo, yagOrani } = data;

    const sliders = [
        { name: 'boy', label: 'Boy', unit: 'cm', min: 120, max: 220, val: boy },
        { name: 'kilo', label: 'Kilo', unit: 'kg', min: 30, max: 160, val: kilo },
        { name: 'yagOrani', label: 'Yağ Oranı', unit: '%', min: 0, max: 100, val: yagOrani || 15 }
    ];

    return (
        <div className="w-full max-w-[600px] md:w-[600px] bg-white text-gray-800 rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] p-8 pl-12 md:pl-32 h-auto flex flex-col font-sans relative z-30 mx-auto">
            <div className="space-y-8 w-full mt-2">
                {sliders.map(slider => (
                    <div key={slider.name} className="flex flex-col w-full">
                        {/* Üst Satır */}
                        <div className="flex justify-between items-end mb-2 w-full">
                            <label className="text-[16px] font-bold text-slate-500 tracking-wide">
                                {slider.label}
                            </label>
                            <div className="text-3xl font-black text-slate-800 leading-none flex items-baseline gap-1">
                                {slider.val}<span className="text-sm text-slate-400 font-bold ml-1">{slider.unit}</span>
                            </div>
                        </div>

                        {/* Orta Satır (Slider) */}
                        <div className="w-full relative py-2">
                            <div className="relative h-2 bg-slate-200 rounded-full flex items-center w-full">
                                <input
                                    type="range"
                                    name={slider.name}
                                    min={slider.min}
                                    max={slider.max}
                                    value={slider.val}
                                    onChange={handleChange}
                                    className="absolute w-full appearance-none bg-transparent cursor-pointer z-20 h-full"
                                />
                            </div>
                        </div>

                        {/* Alt Satır (Min/Max Labels) */}
                        <div className="flex justify-between items-center mt-1 text-xs text-slate-400 font-medium tracking-wide w-full">
                            <span>{slider.min} {slider.unit}</span>
                            <span>{slider.max} {slider.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                input[type=range]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    background: #6366f1;
                    height: 24px;
                    width: 24px;
                    border-radius: 50%;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    cursor: pointer;
                    margin-top: -8px;
                    border: 3px solid white;
                }
                input[type=range]::-webkit-slider-runnable-track {
                    width: 100%;
                    height: 8px;
                    cursor: pointer;
                    background: transparent; 
                    border-radius: 9999px;
                }
            `}</style>
        </div>
    );
}