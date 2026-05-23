import type { ChangeEvent } from "react";
import { KullaniciProfil, Cinsiyet, AktiviteSeviyesi } from "../types";

interface TDEECalculatorPanelProps {
    data: KullaniciProfil["fizikselVeriler"];
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
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
            <div className="flex flex-col gap-4">
                {/* Üst Satır: 4'lü Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-5">

                    {/* 1. Cinsiyet */}
                    <div className="group rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/20">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Cinsiyet</label>
                        <div className="mt-2 flex h-[40px] gap-2">
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
                    <div className="group rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/20">
                        <label htmlFor="tdee-boy" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Boy</label>
                        <div className="relative mt-2 flex h-[40px] items-center gap-3">
                            <input
                                id="tdee-boy"
                                type="number"
                                name="boy"
                                min={100}
                                max={230}
                                value={data.boy || ""}
                                onChange={handleChange}
                                className="h-full w-full cursor-text rounded-xl border border-slate-200 bg-white pl-4 pr-12 text-lg font-bold text-slate-900 caret-indigo-600 outline-none transition-all duration-200 [appearance:textfield] placeholder:text-slate-300 selection:bg-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                placeholder="175"
                            />
                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">cm</span>
                        </div>
                    </div>

                    {/* 3. Kilo (Manuel Input) */}
                    <div className="group rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/20">
                        <label htmlFor="tdee-kilo" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Kilo</label>
                        <div className="relative mt-2 flex h-[40px] items-center gap-3">
                            <input
                                id="tdee-kilo"
                                type="number"
                                name="kilo"
                                min={30}
                                max={300}
                                value={data.kilo || ""}
                                onChange={handleChange}
                                className="h-full w-full cursor-text rounded-xl border border-slate-200 bg-white pl-4 pr-12 text-lg font-bold text-slate-900 caret-indigo-600 outline-none transition-all duration-200 [appearance:textfield] placeholder:text-slate-300 selection:bg-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                placeholder="75"
                            />
                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">kg</span>
                        </div>
                    </div>

                    {/* 4. Yaş (Manuel Input) */}
                    <div className="group rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/20">
                        <label htmlFor="tdee-yas" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Yaş</label>
                        <div className="relative mt-2 flex h-[40px] items-center gap-3">
                            <input
                                id="tdee-yas"
                                type="number"
                                name="yas"
                                min={15}
                                max={100}
                                value={data.yas || ""}
                                onChange={handleChange}
                                className="h-full w-full cursor-text rounded-xl border border-slate-200 bg-white pl-4 pr-12 text-lg font-bold text-slate-900 caret-indigo-600 outline-none transition-all duration-200 [appearance:textfield] placeholder:text-slate-300 selection:bg-indigo-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                placeholder="25"
                            />
                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">yaş</span>
                        </div>
                    </div>
                </div>

                {/* Alt Satır: Aktivite Seviyesi */}
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aktivite Seviyesi</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-5 gap-3">
                        {aktiviteOptions.map((option) => (
                            <button
                                key={option.key}
                                type="button"
                                onClick={() => setField("aktiviteSeviyesi", option.key)}
                                className={`p-2.5 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center text-center h-[58px] ${data.aktiviteSeviyesi === option.key
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
