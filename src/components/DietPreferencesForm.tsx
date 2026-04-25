"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// --- ZOD SCHEMA ---
const dietPreferencesSchema = z.object({
    mealsPerDay: z.number({ error: "Öğün sayısı seçiniz." }).min(2).max(5),
    dietType: z.enum(["standart", "karnivor", "vejetaryen", "vegan", "keto"], { error: "Diyet tipi seçiniz." }),
    allergies: z.string().optional(),
});

export type DietPreferencesData = z.infer<typeof dietPreferencesSchema>;

// --- SEÇENEKLER ---
const mealOptions = [2, 3, 4, 5] as const;

// Emojiler yerine zarif SVG yapısına geçtik
const dietTypeOptions: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: "standart", label: "Standart", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg> },
    { key: "karnivor", label: "Karnivor", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M12 8v8" /><path d="M8 12h8" /></svg> },
    { key: "vejetaryen", label: "Vejetaryen", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13V6a7 7 0 0 1 14 0v7a7 7 0 0 1-7 7Z" /></svg> },
    { key: "vegan", label: "Vegan", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-3.5 2.5-6 6-6s6 2.5 6 6a7 7 0 0 1-7 7Z" /><path d="M11 7a5 5 0 0 1 5-5 5 5 0 0 1 5 5c0 3-2 5-5 5s-5-2-5-5Z" /></svg> },
    { key: "keto", label: "Keto", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /></svg> },
];

// --- PROPS ---
interface DietPreferencesFormProps {
    targetCalories: number;
    selectedPlanName: string;
    onBack: () => void;
    onSubmit: (data: DietPreferencesData) => void;
}

// --- BİLEŞEN ---
export default function DietPreferencesForm({
    targetCalories,
    selectedPlanName,
    onBack,
    onSubmit,
}: DietPreferencesFormProps) {
    const {
        control,
        handleSubmit,
        register,
        formState: { errors },
    } = useForm<DietPreferencesData>({
        resolver: zodResolver(dietPreferencesSchema),
        defaultValues: {
            mealsPerDay: 3,
            dietType: "standart",
            allergies: "",
        },
    });

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="w-full max-w-4xl mx-auto bg-gradient-to-br from-indigo-50/80 to-white border-2 border-indigo-100 shadow-md rounded-3xl p-8 sm:p-10 hover:shadow-hover transition-all duration-300 flex flex-col gap-8 animate-fade-in-up font-sans"
        >
            {/* --- BAŞLIK --- */}
            <div className="text-center border-b border-slate-100 pb-6">
                <div className="flex items-center justify-center gap-2 mb-3">
                    {/* Marka ses dalgası simgesi */}
                    <div className="flex items-center gap-0.5 opacity-40">
                        <div className="w-1 h-3 bg-[#3E3AAF] rounded-full"></div>
                        <div className="w-1 h-5 bg-[#3E3AAF] rounded-full"></div>
                        <div className="w-1 h-3 bg-[#3E3AAF] rounded-full"></div>
                    </div>
                    <p className="text-slate-500 text-xs uppercase tracking-[0.25em] font-bold">
                        {selectedPlanName}
                    </p>
                    <div className="flex items-center gap-0.5 opacity-40">
                        <div className="w-1 h-3 bg-[#3E3AAF] rounded-full"></div>
                        <div className="w-1 h-5 bg-[#3E3AAF] rounded-full"></div>
                        <div className="w-1 h-3 bg-[#3E3AAF] rounded-full"></div>
                    </div>
                </div>
                <h2 className="text-slate-900 font-black text-5xl flex items-baseline justify-center gap-2">
                    {targetCalories}
                    <span className="text-lg font-medium text-slate-400">kcal</span>
                </h2>
                <p className="text-slate-500 text-sm mt-2">
                    Beslenme tercihlerinizi belirleyin
                </p>
            </div>

            {/* --- ÖĞÜN SAYISI --- */}
            <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                    Günlük Öğün Sayısı
                </label>
                <Controller
                    name="mealsPerDay"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-4 gap-3 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-200/60">
                            {mealOptions.map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => field.onChange(num)}
                                    className={`h-12 rounded-xl font-bold text-base transition-all duration-300 ${field.value === num
                                        ? "bg-[#3E3AAF] text-white shadow-[0_4px_16px_rgba(62,58,175,0.3)] border border-[#4f46a8] scale-[1.02]"
                                        : "text-slate-400 hover:text-slate-700 hover:bg-white hover:shadow-sm"
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    )}
                />
                {errors.mealsPerDay && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.mealsPerDay.message}</p>
                )}
            </div>

            {/* --- DİYET TİPİ --- */}
            <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                    Diyet Tipi
                </label>
                <Controller
                    name="dietType"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                            {dietTypeOptions.map((option) => (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => field.onChange(option.key)}
                                    className={`flex flex-col items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-xs transition-all duration-300 ${field.value === option.key
                                        ? "bg-[#3E3AAF] text-white shadow-[0_4px_16px_rgba(62,58,175,0.25)] border border-[#4f46a8] scale-[1.02]"
                                        : "bg-white text-slate-500 border border-slate-200/80 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300 hover:shadow-sm"
                                        }`}
                                >
                                    <span className={field.value === option.key ? "text-white" : "text-slate-400"}>
                                        {option.icon}
                                    </span>
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                />
                {errors.dietType && (
                    <p className="text-red-500 text-xs mt-0.5">{errors.dietType.message}</p>
                )}
            </div>

            {/* --- ALERJİLER --- */}
            <div className="flex flex-col gap-3">
                <label className="text-xs font-bold text-slate-900 uppercase tracking-widest flex justify-between items-center">
                    <span>Alerjiler / İntoleranslar</span>
                    <span className="text-slate-300 normal-case font-medium text-[10px]">(İsteğe bağlı)</span>
                </label>
                <input
                    type="text"
                    {...register("allergies")}
                    placeholder="Örn: Yumurta, Fıstık, Gluten..."
                    className="w-full h-12 bg-slate-50/80 border border-slate-200/60 rounded-2xl px-5 text-slate-800 text-sm font-medium placeholder:text-slate-300 focus:bg-white focus:border-[#3E3AAF]/50 focus:ring-2 focus:ring-[#3E3AAF]/10 outline-none transition-all duration-300"
                />
            </div>

            {/* --- AKSİYON BUTONLARI --- */}
            <div className="flex gap-4 pt-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-none px-6 py-3.5 rounded-2xl text-slate-400 font-bold text-sm transition-all duration-300 hover:bg-slate-50 hover:text-slate-600 border border-transparent hover:border-slate-200"
                >
                    ← Geri Dön
                </button>
                <button
                    type="submit"
                    className="flex-1 py-3.5 rounded-2xl bg-[#3E3AAF] hover:bg-[#4f46a8] text-white font-bold text-sm transition-all duration-300 shadow-[0_4px_20px_rgba(62,58,175,0.3)] hover:shadow-[0_8px_30px_rgba(62,58,175,0.4)] flex items-center justify-center gap-2.5"
                >
                    {/* Ses dalgası ikonu — marka tutarlılığı */}
                    <div className="flex items-center gap-0.5">
                        <div className="w-0.5 h-2 bg-white/60 rounded-full"></div>
                        <div className="w-0.5 h-3.5 bg-white/80 rounded-full"></div>
                        <div className="w-0.5 h-2 bg-white/60 rounded-full"></div>
                    </div>
                    AI Planımı Oluştur
                </button>
            </div>
        </form>
    );
}