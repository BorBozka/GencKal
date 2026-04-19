"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// --- ZOD SCHEMA ---
const dietPreferencesSchema = z.object({
    mealsPerDay: z.number({ error: "Öğün sayısı seçiniz." }).min(2).max(5),
    dietType: z.string({ error: "Diyet tipi seçiniz." }).min(1, "Diyet tipi seçiniz."),
    allergies: z.string().optional(),
});

export type DietPreferencesData = z.infer<typeof dietPreferencesSchema>;

// --- SEÇENEKLER ---
const mealOptions = [2, 3, 4, 5] as const;

// Emojiler yerine zarif SVG yapısına geçtik
const dietTypeOptions: { key: string; label: string; icon: React.ReactNode }[] = [
    { key: "standart", label: "Standart", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg> },
    { key: "karnivor", label: "Karnivor", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M12 8v8" /><path d="M8 12h8" /></svg> }, // Basit temsil
    { key: "vejetaryen", label: "Vejetaryen", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13V6a7 7 0 0 1 14 0v7a7 7 0 0 1-7 7Z" /></svg> },
    { key: "vegan", label: "Vegan", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-3.5 2.5-6 6-6s6 2.5 6 6a7 7 0 0 1-7 7Z" /><path d="M11 7a5 5 0 0 1 5-5 5 5 0 0 1 5 5c0 3-2 5-5 5s-5-2-5-5Z" /></svg> },
    { key: "keto", label: "Keto", icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /></svg> }, // Basit temsil
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
            className="w-full max-w-xl mx-auto bg-white/[0.07] backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] flex flex-col gap-6 animate-fade-in-up font-sans"
        >
            {/* --- BAŞLIK --- */}
            <div className="text-center border-b border-white/10 pb-5">
                <p className="text-indigo-200/50 text-[10px] uppercase tracking-[0.25em] font-bold mb-1">
                    {selectedPlanName}
                </p>
                <h2 className="text-white font-black text-4xl flex items-baseline justify-center gap-1.5">
                    {targetCalories}
                    <span className="text-base font-medium text-indigo-200/50">kcal</span>
                </h2>
                <p className="text-indigo-200/40 text-xs mt-1">
                    Beslenme tercihlerinizi belirleyin
                </p>
            </div>

            {/* --- ÖĞÜN SAYISI --- */}
            <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-bold text-indigo-200/70 uppercase tracking-widest">
                    Günlük Öğün Sayısı
                </label>
                <Controller
                    name="mealsPerDay"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-4 gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                            {mealOptions.map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => field.onChange(num)}
                                    className={`h-10 rounded-xl font-bold text-sm transition-all duration-200 ${field.value === num
                                        ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400/50"
                                        : "text-white/50 hover:text-white/80"
                                        }`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    )}
                />
                {errors.mealsPerDay && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.mealsPerDay.message}</p>
                )}
            </div>

            {/* --- DİYET TİPİ --- */}
            <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-bold text-indigo-200/70 uppercase tracking-widest">
                    Diyet Tipi
                </label>
                <Controller
                    name="dietType"
                    control={control}
                    render={({ field }) => (
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {dietTypeOptions.map((option) => (
                                <button
                                    key={option.key}
                                    type="button"
                                    onClick={() => field.onChange(option.key)}
                                    className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl font-semibold text-[11px] transition-all duration-200 ${field.value === option.key
                                        ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/50"
                                        : "bg-white/5 text-white/50 border border-white/5 hover:bg-white/10 hover:text-white/80"
                                        }`}
                                >
                                    <span className={field.value === option.key ? "text-white" : "text-indigo-200/50"}>
                                        {option.icon}
                                    </span>
                                    <span>{option.label}</span>
                                </button>
                            ))}
                        </div>
                    )}
                />
                {errors.dietType && (
                    <p className="text-red-400 text-[10px] mt-0.5">{errors.dietType.message}</p>
                )}
            </div>

            {/* --- ALERJİLER --- */}
            <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-bold text-indigo-200/70 uppercase tracking-widest flex justify-between items-center">
                    <span>Alerjiler / İntoleranslar</span>
                    <span className="text-indigo-200/30 normal-case font-medium">(İsteğe bağlı)</span>
                </label>
                <input
                    type="text"
                    {...register("allergies")}
                    placeholder="Örn: Yumurta, Fıstık, Gluten..."
                    className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white text-sm font-medium placeholder:text-white/20 focus:bg-white/10 focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 outline-none transition-all"
                />
            </div>

            {/* --- AKSİYON BUTONLARI --- */}
            <div className="flex gap-3 pt-2">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex-none px-5 py-3 rounded-xl text-white/60 font-bold text-xs transition-all hover:bg-white/5 hover:text-white/80 border border-transparent hover:border-white/10"
                >
                    ← Geri Dön
                </button>
                <button
                    type="submit"
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a4 4 0 0 1 4 4v2H8V6a4 4 0 0 1 4-4z" />
                        <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" />
                        <path d="M2 10h20" />
                        <path d="M12 14v4" />
                    </svg>
                    AI Planımı Oluştur
                </button>
            </div>
        </form>
    );
}