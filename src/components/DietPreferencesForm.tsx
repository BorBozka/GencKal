"use client";

import { useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
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
const dietTypeOptions: { key: DietPreferencesData["dietType"]; label: string; icon: ReactNode }[] = [
    { key: "standart", label: "Standart", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg> },
    { key: "karnivor", label: "Karnivor", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M12 8v8" /><path d="M8 12h8" /></svg> },
    { key: "vejetaryen", label: "Vejetaryen", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13V6a7 7 0 0 1 14 0v7a7 7 0 0 1-7 7Z" /></svg> },
    { key: "vegan", label: "Vegan", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-3.5 2.5-6 6-6s6 2.5 6 6a7 7 0 0 1-7 7Z" /><path d="M11 7a5 5 0 0 1 5-5 5 5 0 0 1 5 5c0 3-2 5-5 5s-5-2-5-5Z" /></svg> },
    { key: "keto", label: "Keto", icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" /></svg> },
];

function getPlanHero(selectedPlanName: string) {
    const normalized = selectedPlanName.toLocaleLowerCase("tr-TR");

    if (normalized.includes("bulk") || normalized.includes("kilo al")) {
        return {
            icon: "↑",
            badgeClass: "bg-blue-50 text-blue-900",
        };
    }

    if (normalized.includes("cut") || normalized.includes("kilo ver")) {
        return {
            icon: "↓",
            badgeClass: "bg-rose-50 text-rose-900",
        };
    }

    return {
        icon: "→",
        badgeClass: "bg-emerald-50 text-emerald-900",
    };
}

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
    const [allergyInput, setAllergyInput] = useState("");
    const [allergyTags, setAllergyTags] = useState<string[]>([]);
    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<DietPreferencesData>({
        resolver: zodResolver(dietPreferencesSchema),
        defaultValues: {
            mealsPerDay: 3,
            dietType: "standart",
            allergies: "",
        },
    });
    const planHero = getPlanHero(selectedPlanName);

    const syncAllergies = (nextTags: string[]) => {
        setAllergyTags(nextTags);
        setValue("allergies", nextTags.join(", "), { shouldValidate: true });
    };

    const addAllergyTag = (rawValue: string) => {
        const normalized = rawValue.trim().replace(/,$/, "");
        if (!normalized) return;

        const exists = allergyTags.some((tag) => tag.toLocaleLowerCase("tr-TR") === normalized.toLocaleLowerCase("tr-TR"));
        if (exists) {
            setAllergyInput("");
            return;
        }

        syncAllergies([...allergyTags, normalized]);
        setAllergyInput("");
    };

    const removeAllergyTag = (tagToRemove: string) => {
        syncAllergies(allergyTags.filter((tag) => tag !== tagToRemove));
    };

    const handleAllergyKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === "," || event.key === ";") {
            event.preventDefault();
            addAllergyTag(allergyInput);
        }
    };

    const handleFormSubmit = (data: DietPreferencesData) => {
        const pendingTag = allergyInput.trim().replace(/,$/, "");
        const nextTags = pendingTag && !allergyTags.some((tag) => tag.toLocaleLowerCase("tr-TR") === pendingTag.toLocaleLowerCase("tr-TR"))
            ? [...allergyTags, pendingTag]
            : allergyTags;

        onSubmit({
            ...data,
            allergies: nextTags.join(", "),
        });
    };

    return (
        <div className="w-full max-w-3xl mx-auto font-sans">
            <h1 className="sr-only">Diyet tercihleri</h1>
            <button
                type="button"
                onClick={onBack}
                className="mb-4 inline-flex cursor-pointer items-center rounded-xl px-1 py-1 text-sm font-bold text-slate-500 transition-colors hover:text-slate-800"
            >
                ← Diyet Planlarına Geri Dön
            </button>
            <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 sm:p-8 flex flex-col gap-7"
            >
            {/* --- HERO HEADER --- */}
            <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-5 text-center">
                <div className="flex justify-center">
                    <p className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold ${planHero.badgeClass}`}>
                        <span className="text-base leading-none">{planHero.icon}</span>
                        {selectedPlanName}
                    </p>
                </div>
                <h2 className="mt-4 flex items-baseline justify-center gap-2 text-5xl font-extrabold tracking-tight text-slate-900">
                    {targetCalories}
                    <span className="text-lg font-medium text-slate-800">kcal / gün</span>
                </h2>
                <p className="text-slate-800 text-sm font-medium mt-2">
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
                        <div className="grid grid-cols-4 gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5">
                            {mealOptions.map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => field.onChange(num)}
                                    aria-pressed={field.value === num}
                                    className={`h-12 cursor-pointer rounded-xl border font-extrabold text-base transition-all duration-200 ${field.value === num
                                        ? "border-[#3E3AAF] bg-[#3E3AAF] text-white shadow-[0_8px_18px_rgba(62,58,175,0.22)] ring-2 ring-[#3E3AAF]/20"
                                        : "border-transparent text-slate-900 hover:bg-white/70"
                                        }`}
                                >
                                    {num} <span className="text-xs font-bold">öğün</span>
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
                                    aria-pressed={field.value === option.key}
                                    className={`flex min-h-[112px] cursor-pointer flex-col items-center justify-center space-y-3 rounded-2xl border p-4 text-center text-xs font-bold transition-all duration-300 ease-in-out ${field.value === option.key
                                        ? "border-[#3E3AAF] bg-[#3E3AAF] text-white shadow-[0_8px_18px_rgba(62,58,175,0.22)] ring-2 ring-[#3E3AAF]/20"
                                        : "border-slate-200 bg-white text-slate-900 hover:border-indigo-200 hover:bg-slate-50"
                                        }`}
                                >
                                    <span className={field.value === option.key ? "text-white" : "text-slate-900"}>
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
                    <span className="text-slate-800 normal-case font-medium text-[10px]">(İsteğe bağlı)</span>
                </label>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 transition-all duration-300 focus-within:border-[#3E3AAF]/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#3E3AAF]/10">
                    {allergyTags.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                            {allergyTags.map((tag) => (
                                <span
                                    key={tag}
                                    className="flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => removeAllergyTag(tag)}
                                        className="cursor-pointer rounded-full text-indigo-400 transition-colors hover:text-indigo-800"
                                        aria-label={`${tag} alerjisini kaldır`}
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    <input
                        type="text"
                        value={allergyInput}
                        onChange={(event) => setAllergyInput(event.target.value)}
                        onKeyDown={handleAllergyKeyDown}
                        onBlur={() => addAllergyTag(allergyInput)}
                        autoComplete="off"
                        placeholder="Örn: Yumurta, Yer fıstığı, Gluten..."
                        className="h-9 w-full bg-transparent px-2 text-sm font-medium text-slate-950 outline-none placeholder:text-slate-700"
                    />
                </div>
            </div>

            {/* --- AKSİYON BUTONLARI --- */}
            <div className="flex justify-center pt-3">
                <button
                    type="submit"
                    className="flex h-12 w-full max-w-md cursor-pointer items-center justify-center gap-2.5 rounded-2xl bg-[#3E3AAF] text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(62,58,175,0.18)] transition-all duration-300 hover:bg-indigo-700"
                >
                    {/* Ses dalgası ikonu — marka tutarlılığı */}
                    <div className="flex items-center gap-0.5">
                        <div className="w-0.5 h-2 bg-white/60 rounded-full"></div>
                        <div className="w-0.5 h-3.5 bg-white/80 rounded-full"></div>
                        <div className="w-0.5 h-2 bg-white/60 rounded-full"></div>
                    </div>
                    Diyet Planımı Oluştur
                </button>
            </div>
            </form>
        </div>
    );
}
