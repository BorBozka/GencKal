import React from "react";
import { KullaniciProfil, Cinsiyet, AktiviteSeviyesi } from "../types";

interface TDEECalculatorPanelProps {
    data: KullaniciProfil["fizikselVeriler"];
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    setField: <K extends keyof KullaniciProfil["fizikselVeriler"]>(
        name: K,
        value: KullaniciProfil["fizikselVeriler"][K]
    ) => void;
}

const cinsiyetOptions: { key: Cinsiyet; label: string }[] = [
    { key: "erkek", label: "Erkek" },
    { key: "kadın", label: "Kadın" },
];

const aktiviteOptions: { key: AktiviteSeviyesi; label: string; desc: string }[] = [
    { key: "hareketsiz (ofis işi)", label: "Hareketsiz", desc: "Ofis işi" },
    { key: "hafif egzersiz (haftada 1-2 gün)", label: "Hafif", desc: "1-2 Gün" },
    { key: "orta düzey egzersiz (haftada 3-5 gün)", label: "Orta", desc: "3-5 Gün" },
    { key: "yoğun egzersiz (haftada 6-7 gün)", label: "Yoğun", desc: "6-7 Gün" },
    { key: "atlet (günde 2 kez egzersiz)", label: "Atlet", desc: "Günde 2x" },
];

export default function TDEECalculatorPanel({ data, handleChange, setField }: TDEECalculatorPanelProps) {
    return (
        <div className="w-full flex flex-col font-sans">
            <h3 className="text-base font-bold text-slate-900 mb-5 border-b border-slate-100 pb-3">
                TDEE (Günlük Enerji İhtiyacı) Verileri
            </h3>

            <div className="flex flex-col gap-6">
                {/* Üst Satır: 4'lü Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                    {/* 1. Cinsiyet */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cinsiyet</label>
                        <div className="flex gap-2 h-[44px]">
                            {cinsiyetOptions.map((option) => (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => setField("cinsiyet", option.key)}
                                    className={`flex-1 rounded-xl border transition-all duration-300 font-semibold text-sm flex items-center justify-center ${data.cinsiyet === option.key
                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                                        : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-white hover:border-slate-300"
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. Boy (Manuel Input) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Boy</label>
                        <div className="relative h-[44px]">
                            <input
                                type="number"
                                name="boy"
                                value={data.boy || ""}
                                onChange={handleChange}
                                className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 font-bold text-lg text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-300"
                                placeholder="175"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">cm</span>
                        </div>
                    </div>

                    {/* 3. Kilo (Manuel Input) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kilo</label>
                        <div className="relative h-[44px]">
                            <input
                                type="number"
                                name="kilo"
                                value={data.kilo || ""}
                                onChange={handleChange}
                                className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 font-bold text-lg text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-300"
                                placeholder="75"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">kg</span>
                        </div>
                    </div>

                    {/* 4. Yaş (Manuel Input) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Yaş</label>
                        <div className="relative h-[44px]">
                            <input
                                type="number"
                                name="yas"
                                value={data.yas || ""}
                                onChange={handleChange}
                                className="w-full h-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 font-bold text-lg text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-300"
                                placeholder="25"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">yaş</span>
                        </div>
                    </div>
                </div>

                {/* Alt Satır: Aktivite Seviyesi */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aktivite Seviyesi</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {aktiviteOptions.map((option) => (
                            <button
                                key={option.key}
                                type="button"
                                onClick={() => setField("aktiviteSeviyesi", option.key)}
                                className={`p-3 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center text-center h-[70px] ${data.aktiviteSeviyesi === option.key
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-white hover:border-slate-300"
                                    }`}
                            >
                                <span className="font-semibold text-sm mb-0.5">{option.label}</span>
                                <span className={`text-[10px] ${data.aktiviteSeviyesi === option.key ? "text-indigo-200" : "text-slate-400"
                                    }`}>
                                    {option.desc}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}