// src/components/DietPlanWizard.tsx
"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Utensils, Dumbbell, ChevronRight, Save, AlertTriangle, RotateCcw } from "lucide-react";

import DietPreferencesForm, { type DietPreferencesData } from "./DietPreferencesForm";
import { MacroBar } from "./ui/MacroBar";
import { SkeletonLoading } from "./ui/SkeletonLoading";
import { MealCardComponent } from "./ui/MealCardComponent";
import { useToast } from "./ui/Toast";
import type { MealCard, MealItem, MacroDistribution } from "../types";

interface DietPlanWizardProps {
    targetCalories: number;
    selectedPlanName: string;
    onBack: () => void;
}

export default function DietPlanWizard({ targetCalories, selectedPlanName, onBack }: DietPlanWizardProps) {
    const { toast } = useToast();
    const [step, setStep] = useState<"form" | "generating">("form");
    const [formData, setFormData] = useState<DietPreferencesData | null>(null);
    const [generatedPlan, setGeneratedPlan] = useState<{ macros: MacroDistribution; meals: MealCard[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    const handleGenerate = useCallback(async (data: DietPreferencesData) => {
        setFormData(data);
        setStep("generating");
        setGeneratedPlan(null);
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/generate-diet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetCalories, dietType: data.dietType, mealsPerDay: data.mealsPerDay, allergies: data.allergies || undefined }),
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || `Sunucu hatası (${response.status})`);
            }
            const plan = await response.json();

            // API'den gelen veriye runtime'da benzersiz id ata
            const planWithIds = {
                ...plan,
                meals: plan.meals.map((meal: { title: string; items: { name: string; cal: number; fullText: string; macros?: { protein: number; fat: number; carb: number } }[] }, mealIdx: number) => ({
                    ...meal,
                    id: `meal-${mealIdx}-${Date.now()}`,
                    items: meal.items.map((item: { name: string; cal: number; fullText: string; macros?: { protein: number; fat: number; carb: number } }, itemIdx: number) => ({
                        ...item,
                        id: `food-${mealIdx}-${itemIdx}-${Date.now()}`,
                    })),
                })),
            };
            setGeneratedPlan(planWithIds);
            setIsSaved(false);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.";
            setError(msg);
            toast("error", "Plan oluşturulamadı", msg);
        } finally {
            setIsLoading(false);
        }
    }, [targetCalories, toast]);

    const handleRetry = useCallback(() => {
        if (formData) handleGenerate(formData);
    }, [formData, handleGenerate]);

    const handleSavePlan = useCallback(() => {
        if (!generatedPlan || !formData) return;
        try {
            const savedPlan = {
                id: Date.now(),
                planName: selectedPlanName,
                targetCalories,
                preferences: formData,
                plan: generatedPlan,
                savedAt: new Date().toISOString(),
            };
            const existing = JSON.parse(localStorage.getItem("genckal_saved_plans") || "[]");
            existing.unshift(savedPlan);
            // En fazla 10 plan sakla
            if (existing.length > 10) existing.pop();
            localStorage.setItem("genckal_saved_plans", JSON.stringify(existing));
            setIsSaved(true);
            toast("success", "Plan kaydedildi!", "Beslenme planınız başarıyla kaydedildi.");
        } catch {
            toast("error", "Kayıt başarısız", "Plan kaydedilirken bir hata oluştu.");
        }
    }, [generatedPlan, formData, selectedPlanName, targetCalories, toast]);

    // --- Besin Değişimi (Swap) Handler ---
    const handleSwapFood = useCallback(async (mealId: string, foodId: string) => {
        if (!generatedPlan || !formData) return;

        // Hedef öğün ve besini bul
        const targetMeal = generatedPlan.meals.find((m) => m.id === mealId);
        if (!targetMeal) return;
        const targetFood = targetMeal.items.find((item) => item.id === foodId);
        if (!targetFood) return;

        // API'ye istek at
        const response = await fetch("/api/swap-food", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                currentFood: {
                    name: targetFood.name,
                    cal: targetFood.cal,
                    fullText: targetFood.fullText,
                    macros: targetFood.macros ?? { protein: 0, fat: 0, carb: 0 },
                },
                mealTitle: targetMeal.title,
                dietType: formData.dietType,
                allergies: formData.allergies || undefined,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const msg = errorData?.error || "Besin değişimi başarısız oldu.";
            throw new Error(msg);
        }

        const newFood = await response.json();

        // Yeni besine benzersiz id ata
        const newFoodWithId: MealItem = {
            ...newFood,
            id: `food-swapped-${Date.now()}`,
        };

        // State'i immutable şekilde güncelle — sadece ilgili besini değiştir
        setGeneratedPlan((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                meals: prev.meals.map((meal) => {
                    if (meal.id !== mealId) return meal;
                    return {
                        ...meal,
                        items: meal.items.map((item) =>
                            item.id === foodId ? newFoodWithId : item
                        ),
                    };
                }),
            };
        });

    }, [generatedPlan, formData]);

    const macros = generatedPlan?.macros ?? { protein: 0, fat: 0, carb: 0 };
    const showPlanData = !isLoading && !error && generatedPlan !== null;

    // Gramlardan kalorik yüzde hesapla (MacroBar genişliği için)
    const totalCalFromMacros = (macros.protein * 4) + (macros.fat * 9) + (macros.carb * 4);
    const proteinPct = totalCalFromMacros > 0 ? Math.round((macros.protein * 4) / totalCalFromMacros * 100) : 0;
    const fatPct = totalCalFromMacros > 0 ? Math.round((macros.fat * 9) / totalCalFromMacros * 100) : 0;
    const carbPct = totalCalFromMacros > 0 ? Math.round((macros.carb * 4) / totalCalFromMacros * 100) : 0;

    return (
        <div className="w-full flex-1 flex flex-col lg:flex-row gap-8 min-h-0">
            {/* SOL PANEL (FORM VEYA ÖZET) */}
            <AnimatePresence mode="wait">
                {step === "form" ? (
                    <motion.div key="form-full" layout className="w-full flex items-start justify-center"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30, scale: 0.95 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                        <DietPreferencesForm targetCalories={targetCalories} selectedPlanName={selectedPlanName} onBack={onBack} onSubmit={handleGenerate} />
                    </motion.div>
                ) : (
                    <motion.div key="form-summary" layout className="w-full lg:w-[340px] shrink-0"
                        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>

                        {/* Mobil: yatay ince bilgi çubuğu */}
                        <div className="lg:hidden bg-gradient-to-br from-indigo-50/80 to-white border-2 border-indigo-100 shadow-md rounded-3xl p-5 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                                    <Flame className="w-5 h-5 text-indigo-500" />
                                </div>
                                <div>
                                    <p className="text-slate-900 font-bold text-sm">{targetCalories} kcal</p>
                                    <p className="text-slate-500 text-[10px]">{selectedPlanName}</p>
                                </div>
                            </div>
                            {formData && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 text-[10px]">{formData.mealsPerDay} öğün</span>
                                    <span className="text-slate-300">·</span>
                                    <span className="text-slate-500 text-[10px] capitalize">{formData.dietType}</span>
                                </div>
                            )}
                        </div>

                        {/* Masaüstü: dikey özet kartı */}
                        <div className="hidden lg:flex flex-col bg-gradient-to-br from-indigo-50/80 to-white border-2 border-indigo-100 shadow-md rounded-3xl p-8 hover:shadow-hover transition-all duration-300 sticky top-24">
                            <div className="text-center border-b border-indigo-100/60 pb-5 mb-6">
                                <p className="text-indigo-800 text-[10px] uppercase tracking-[0.25em] font-bold mb-2">{selectedPlanName}</p>
                                <p className="text-slate-900 font-extrabold text-4xl">
                                    {targetCalories} <span className="text-base font-medium text-slate-500">kcal</span>
                                </p>
                            </div>

                            {formData && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 bg-indigo-100/50 rounded-lg flex items-center justify-center">
                                            <Utensils className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <span className="text-slate-600 flex-1">Öğün Sayısı</span>
                                        <span className="text-slate-900 font-bold">{formData.mealsPerDay}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <div className="w-8 h-8 bg-indigo-100/50 rounded-lg flex items-center justify-center">
                                            <Dumbbell className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <span className="text-slate-600 flex-1">Diyet Tipi</span>
                                        <span className="text-slate-900 font-bold capitalize">{formData.dietType}</span>
                                    </div>
                                    {formData.allergies && (
                                        <div className="flex items-start gap-3 text-sm mt-1">
                                            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                                                <ChevronRight className="w-4 h-4 text-red-400" />
                                            </div>
                                            <span className="text-slate-600 flex-1">Alerjiler</span>
                                            <span className="text-red-500 font-medium text-xs text-right max-w-[120px]">{formData.allergies}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {showPlanData && (
                                <div className="mt-6 pt-5 border-t border-indigo-100/60 flex flex-col gap-3">
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Makro Hedef</p>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Protein</span>
                                        <span className="text-emerald-600 font-bold">{proteinPct}%</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Yağ</span>
                                        <span className="text-amber-600 font-bold">{fatPct}%</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Karbonhidrat</span>
                                        <span className="text-blue-600 font-bold">{carbPct}%</span>
                                    </div>
                                </div>
                            )}

                            <button onClick={() => { setStep("form"); setGeneratedPlan(null); setError(null); }}
                                className="mt-6 py-3 rounded-2xl text-indigo-600 text-xs font-bold hover:bg-indigo-50 hover:text-indigo-800 transition-all duration-300 border border-transparent hover:border-indigo-100">
                                ← Düzenle
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SAĞ PANEL (ÜRETİM ALANI) */}
            <AnimatePresence mode="popLayout">
                {step === "generating" && (
                    <motion.div key="generation-area" className="flex-1 flex flex-col gap-6 min-h-0 overflow-y-auto pb-8"
                        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>

                        {isLoading && <SkeletonLoading />}

                        {/* Hata Kartı */}
                        {error && !isLoading && (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                                className="bg-red-50 rounded-3xl p-8 border border-red-200/80 shadow-soft">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                                        <AlertTriangle className="w-5 h-5 text-red-500" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-red-600 font-bold text-sm mb-1">Plan oluşturulamadı</h4>
                                        <p className="text-red-500/80 text-xs leading-relaxed">{error}</p>
                                    </div>
                                </div>
                                <button onClick={handleRetry}
                                    className="mt-5 w-full py-3.5 rounded-2xl bg-red-100 hover:bg-red-200 text-red-600 font-bold text-sm transition-all duration-300 border border-red-200 flex items-center justify-center gap-2">
                                    <RotateCcw className="w-4 h-4" /> Tekrar Dene
                                </button>
                            </motion.div>
                        )}

                        {showPlanData && (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                                className="bg-gradient-to-br from-indigo-50/80 to-white border-2 border-indigo-100 shadow-md rounded-3xl p-8 hover:shadow-hover transition-all duration-300">
                                <h4 className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-5">Kalori & Makro Dağılımı</h4>

                                <div className="flex items-baseline gap-2 mb-6">
                                    <span className="text-slate-900 font-black text-4xl">{targetCalories}</span>
                                    <span className="text-slate-500 text-sm font-medium">kcal / gün</span>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <MacroBar label="Protein" percent={proteinPct} grams={macros.protein} color="linear-gradient(90deg, #06b6d4, #67e8f9)" delay={0} animate={true} />
                                    <MacroBar label="Yağ" percent={fatPct} grams={macros.fat} color="linear-gradient(90deg, #f59e0b, #fbbf24)" delay={200} animate={true} />
                                    <MacroBar label="Karb" percent={carbPct} grams={macros.carb} color="linear-gradient(90deg, #3b82f6, #60a5fa)" delay={400} animate={true} />
                                </div>

                                <div className="flex gap-4 mt-6 pt-4 border-t border-slate-100">
                                    <div className="flex-1 text-center">
                                        <p className="text-cyan-600 font-bold text-base">{macros.protein}g</p>
                                        <p className="text-slate-500 text-[10px] mt-1">Protein</p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-amber-600 font-bold text-base">{macros.fat}g</p>
                                        <p className="text-slate-500 text-[10px] mt-1">Yağ</p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-blue-600 font-bold text-base">{macros.carb}g</p>
                                        <p className="text-slate-500 text-[10px] mt-1">Karbonhidrat</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ÖĞÜN KARTLARI — 2 Sütunlu Grid */}
                        {showPlanData && (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                                {generatedPlan.meals.map((meal, i) => (
                                    <MealCardComponent key={meal.id} meal={meal} index={i} startTyping={true} onSwapFood={handleSwapFood} />
                                ))}
                            </div>
                        )}


                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobil Geri Dönüş Butonu (Sadece küçük ekranlarda görünür) */}
            <div className="sm:hidden flex-none text-center pt-4 pb-2 w-full">
                <button
                    onClick={onBack}
                    className="text-slate-400 hover:text-slate-700 font-bold transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                    <span>&larr;</span> Geri Dön
                </button>
            </div>
        </div>
    );
}