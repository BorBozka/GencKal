// Dosya Yolu: src/components/InputPanel.tsx
import type { ChangeEvent } from "react";
// 1. DÜZELTME: "type" anahtar kelimesi eklendi (Derleyici optimizasyonu için)
import type { KullaniciProfil } from "../types";

export interface InputPanelProps {
    data: KullaniciProfil["fizikselVeriler"];
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    // 2. DÜZELTME: "any" kaldırıldı. Değerin, fizikselVeriler objesindeki özelliklerden birinin tipi olacağı garanti altına alındı.
    setField: <K extends keyof KullaniciProfil["fizikselVeriler"]>(
        name: K,
        value: KullaniciProfil["fizikselVeriler"][K]
    ) => void;
}

export default function InputPanel({ data, handleChange }: InputPanelProps) {
    const { boy, kilo, yagOrani } = data;

    const sliders = [
        { name: 'boy', id: 'input-panel-boy', label: 'Boy', unit: 'cm', min: 120, max: 220, val: boy },
        { name: 'kilo', id: 'input-panel-kilo', label: 'Kilo', unit: 'kg', min: 30, max: 160, val: kilo },
        { name: 'yagOrani', id: 'input-panel-yag-orani', label: 'Yağ Oranı', unit: '%', min: 0, max: 100, val: yagOrani ?? 15 }
    ];

    return (
        <div className="w-full max-w-[600px] lg:w-[600px] bg-white text-gray-800 rounded-2xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18)] p-6 lg:p-8 lg:pl-24 h-auto flex flex-col font-sans relative z-30 mx-auto">
            <div className="w-full mt-2">
                {sliders.map(slider => {
                    const progress = ((slider.val - slider.min) / (slider.max - slider.min)) * 100;

                    return (
                        <div key={slider.name} className="mb-6 flex w-full flex-col space-y-3 last:mb-0">
                            <div className="flex w-full items-center justify-between gap-4">
                                <label htmlFor={slider.id} className="text-[15px] font-bold tracking-wide text-slate-500">
                                    {slider.label}
                                </label>
                                <div className="flex min-w-[92px] items-center justify-center rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5">
                                    <span className="text-2xl font-bold leading-none text-slate-800">{slider.val}</span>
                                    <span className="ml-1 text-xs font-medium text-slate-600">{slider.unit}</span>
                                </div>
                            </div>

                            <div className="relative flex w-full items-center py-2">
                                <input
                                    id={slider.id}
                                    type="range"
                                    name={slider.name}
                                    min={slider.min}
                                    max={slider.max}
                                    value={slider.val}
                                    onChange={handleChange}
                                    style={{
                                        background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${progress}%, #e2e8f0 ${progress}%, #e2e8f0 100%)`,
                                    }}
                                    className="h-2.5 w-full cursor-pointer appearance-none rounded-full border border-slate-200/80 outline-none shadow-inner transition-[filter] duration-200 hover:brightness-[0.98] focus-visible:ring-4 focus-visible:ring-indigo-100 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-indigo-500 [&::-moz-range-thumb]:shadow-[0_4px_12px_rgba(79,70,229,0.35)] [&::-moz-range-thumb]:transition-transform hover:[&::-moz-range-thumb]:scale-110 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-[0_4px_12px_rgba(79,70,229,0.35)] [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110"
                                />
                            </div>

                            <div className="flex w-full items-center justify-between text-xs font-medium tracking-wide text-slate-600">
                                <span>{slider.min} {slider.unit}</span>
                                <span>{slider.max} {slider.unit}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
