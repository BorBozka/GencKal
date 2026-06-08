// src/components/DietPlanWizard.tsx
"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Utensils, Dumbbell, ChevronRight, AlertTriangle, RotateCcw, Save } from "lucide-react";

import DietPreferencesForm, { type DietPreferencesData } from "./DietPreferencesForm";
import { MacroBar } from "./ui/MacroBar";
import { SkeletonLoading } from "./ui/SkeletonLoading";
import { MealCardComponent } from "./ui/MealCardComponent";
import { useToast } from "./ui/Toast";
import { useAuth } from "../context/AuthContext";
import { generatedMealItemSchema, generatedPlanSchema, type MealCard, type MealItem, type MacroDistribution } from "../types";

interface DietPlanWizardProps {
    targetCalories: number;
    selectedPlanName: string;
    onBack: () => void;
}

function calculateMacrosFromMeals(meals: MealCard[]): MacroDistribution {
    return meals.reduce<MacroDistribution>(
        (total, meal) => {
            for (const item of meal.items) {
                total.protein += item.macros.protein;
                total.fat += item.macros.fat;
                total.carb += item.macros.carb;
            }
            return total;
        },
        { protein: 0, fat: 0, carb: 0 }
    );
}

function formatMacroValue(value: number): string {
    if (!Number.isFinite(value)) return "0";
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function formatAllergyLabel(value: string): string {
    return value
        .split(",")
        .map((allergy) => allergy.trim())
        .filter(Boolean)
        .map((allergy) => allergy.charAt(0).toLocaleUpperCase("tr-TR") + allergy.slice(1))
        .join(", ");
}

export default function DietPlanWizard({ targetCalories, selectedPlanName, onBack }: DietPlanWizardProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { user, token, authHeaders } = useAuth();
    const [step, setStep] = useState<"form" | "generating">("form");
    const [formData, setFormData] = useState<DietPreferencesData | null>(null);
    const [generatedPlan, setGeneratedPlan] = useState<{ macros: MacroDistribution; meals: MealCard[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [canViewSavedPlan, setCanViewSavedPlan] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async (data: DietPreferencesData) => {
        setFormData(data);
        setStep("generating");
        setGeneratedPlan(null);
        setIsLoading(true);
        setCanViewSavedPlan(false);
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
            const plan = generatedPlanSchema.parse(await response.json());
            const createdAt = Date.now();

            // API'den gelen veriye runtime'da benzersiz id ata
            const planWithIds = {
                ...plan,
                meals: plan.meals.map((meal, mealIdx) => ({
                    ...meal,
                    id: `meal-${mealIdx}-${createdAt}`,
                    items: meal.items.map((item, itemIdx) => ({
                        ...item,
                        id: `food-${mealIdx}-${itemIdx}-${createdAt}`,
                    })),
                })),
            };
            setGeneratedPlan(planWithIds);
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

    const handleSavePlan = useCallback(async () => {
        if (!generatedPlan || !formData) return;

        if (!user || !token) {
            toast("info", "Giriş yapmanız gerekmektedir", "Diyet planını kaydetmek için önce giriş yapın.");
            router.push("/giris?returnTo=%2Fdiyet-planlarim");
            return;
        }

        setIsSaving(true);
        try {
            const response = await fetch("/api/diet-plans", {
                method: "POST",
                headers: {
                    ...authHeaders(),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    title: `${selectedPlanName} - ${targetCalories} kcal`,
                    targetCalories,
                    dietType: formData.dietType,
                    mealsPerDay: formData.mealsPerDay,
                    allergies: formData.allergies || "",
                    macros: generatedPlan.macros,
                    meals: generatedPlan.meals,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.error || `Sunucu hatası (${response.status})`);
            }

            setCanViewSavedPlan(true);
            toast("success", "Diyet planı kaydedildi", "Planı Diyet Planlarım sayfasında görebilirsiniz.");
        } catch (err) {
            toast("error", "Plan kaydedilemedi", err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.");
        } finally {
            setIsSaving(false);
        }
    }, [authHeaders, formData, generatedPlan, router, selectedPlanName, targetCalories, toast, token, user]);

    const handleViewSavedPlan = useCallback(() => {
        router.push("/diyet-planlarim");
    }, [router]);

    // --- Besin Değişimi (Swap) Handler ---
    const handleSwapFood = useCallback(async (mealId: string, foodId: string) => {
        if (!generatedPlan || !formData) return;

        try {
            setCanViewSavedPlan(false);
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

            const newFood = generatedMealItemSchema.parse(await response.json());

            // Yeni besine benzersiz id ata
            const newFoodWithId: MealItem = {
                ...newFood,
                id: `food-swapped-${Date.now()}`,
            };

            // State'i immutable şekilde güncelle — sadece ilgili besini değiştir
            setGeneratedPlan((prev) => {
                if (!prev) return prev;
                const meals = prev.meals.map((meal) => {
                    if (meal.id !== mealId) return meal;
                    return {
                        ...meal,
                        items: meal.items.map((item) =>
                            item.id === foodId ? newFoodWithId : item
                        ),
                    };
                });

                return {
                    ...prev,
                    macros: calculateMacrosFromMeals(meals),
                    meals,
                };
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Besin değişimi başarısız oldu.";
            toast("error", "Besin değiştirilemedi", msg);
            throw err;
        }

    }, [generatedPlan, formData, toast]);

    const macros = generatedPlan?.macros ?? { protein: 0, fat: 0, carb: 0 };
    const showPlanData = !isLoading && !error && generatedPlan !== null;

    // Gramlardan kalorik yüzde hesapla (MacroBar genişliği için)
    const totalCalFromMacros = (macros.protein * 4) + (macros.fat * 9) + (macros.carb * 4);
    const proteinPct = totalCalFromMacros > 0 ? Math.round((macros.protein * 4) / totalCalFromMacros * 100) : 0;
    const fatPct = totalCalFromMacros > 0 ? Math.round((macros.fat * 9) / totalCalFromMacros * 100) : 0;
    const carbPct = totalCalFromMacros > 0 ? Math.round((macros.carb * 4) / totalCalFromMacros * 100) : 0;

    return (
        <div className="w-full flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
            {/* SOL PANEL (FORM VEYA ÖZET) */}
            <AnimatePresence mode="wait">
                {step === "form" ? (
                    <motion.div key="form-full" layout className="w-full flex items-start justify-center">
                        <DietPreferencesForm targetCalories={targetCalories} selectedPlanName={selectedPlanName} onBack={onBack} onSubmit={handleGenerate} />
                    </motion.div>
                ) : (
                    <motion.div key="form-summary" layout className="w-full lg:w-[340px] shrink-0"
                        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>

                        {/* Mobil: yatay ince bilgi çubuğu */}
                        <div className="lg:hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between gap-4">
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
                        <div className="hidden lg:flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 sticky top-24">
                            <div className="text-center border-b border-slate-100 pb-5 mb-6">
                                <p className="text-indigo-800 text-[10px] uppercase tracking-[0.25em] font-bold mb-2">{selectedPlanName}</p>
                                <p className="text-slate-900 font-extrabold text-4xl">
                                    {targetCalories} <span className="text-base font-medium text-slate-500">kcal</span>
                                </p>
                            </div>

                            {formData && (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm">
                                        <div className="w-8 h-8 bg-indigo-100/50 rounded-lg flex items-center justify-center">
                                            <Utensils className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <span className="text-slate-600 flex-1">Öğün Sayısı</span>
                                        <span className="text-slate-900 font-bold">{formData.mealsPerDay}</span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-sm">
                                        <div className="w-8 h-8 bg-indigo-100/50 rounded-lg flex items-center justify-center">
                                            <Dumbbell className="w-4 h-4 text-indigo-500" />
                                        </div>
                                        <span className="text-slate-600 flex-1">Diyet Tipi</span>
                                        <span className="text-slate-900 font-bold capitalize">{formData.dietType}</span>
                                    </div>
                                    {formData.allergies && (
                                        <div className="flex items-center gap-3 rounded-2xl bg-red-50/70 p-3 text-sm">
                                            <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center shrink-0">
                                                <ChevronRight className="w-4 h-4 text-red-400" />
                                            </div>
                                            <span className="text-slate-600 flex-1 leading-none">Alerjiler</span>
                                            <span className="text-red-500 font-medium text-xs text-right leading-none max-w-[120px]">{formatAllergyLabel(formData.allergies)}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {showPlanData && (
                                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3">
                                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold mb-1">Makro Hedef</p>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-600">Protein</span>
                                        <span className="text-rose-600 font-bold">{proteinPct}%</span>
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
                                className="mt-6 cursor-pointer py-3 rounded-2xl text-indigo-600 text-xs font-bold hover:bg-indigo-50 hover:text-indigo-800 transition-all duration-300 border border-transparent hover:border-indigo-100">
                                ← Düzenle
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SAĞ PANEL (ÜRETİM ALANI) */}
            <AnimatePresence mode="popLayout">
                {step === "generating" && (
                    <motion.div key="generation-area" className="flex-1 flex flex-col gap-5 min-h-0 overflow-y-auto pb-8"
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
                                className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 sm:p-6">
                                <div className="mb-5 flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                                    <div>
                                        <p className="text-[10px] text-indigo-600 uppercase tracking-[0.24em] font-extrabold">{selectedPlanName}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={canViewSavedPlan ? handleViewSavedPlan : handleSavePlan}
                                        disabled={isSaving}
                                        className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#3E3AAF] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-70"
                                    >
                                        {canViewSavedPlan ? <ChevronRight className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                                        {isSaving ? "Kaydediliyor..." : canViewSavedPlan ? "Diyet Planlarımı Görüntüle" : "Bu Diyet Planını Kaydet"}
                                    </button>
                                </div>

                                <div>
                                    <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                                        <div className="flex flex-col justify-center text-left">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Günlük hedef</p>
                                            <p className="mt-2 flex items-baseline gap-2 text-4xl font-black tracking-tight text-slate-950">
                                                {targetCalories}
                                                <span className="text-sm font-semibold text-slate-500">kcal / gün</span>
                                            </p>
                                        </div>
                                        <div className="rounded-2xl bg-rose-50 p-3 text-center">
                                            <p className="text-rose-600 font-extrabold text-lg">{formatMacroValue(macros.protein)}g</p>
                                            <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-wider">Protein</p>
                                        </div>
                                        <div className="rounded-2xl bg-amber-50 p-3 text-center">
                                            <p className="text-amber-600 font-extrabold text-lg">{formatMacroValue(macros.fat)}g</p>
                                            <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-wider">Yağ</p>
                                        </div>
                                        <div className="rounded-2xl bg-blue-50 p-3 text-center">
                                            <p className="text-blue-600 font-extrabold text-lg">{formatMacroValue(macros.carb)}g</p>
                                            <p className="text-slate-500 text-[10px] mt-1 font-bold uppercase tracking-wider">Karb</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4">
                                        <MacroBar label="Protein" percent={proteinPct} grams={macros.protein} color="linear-gradient(90deg, #fb7185, #f43f5e)" delay={0} animate={true} />
                                        <MacroBar label="Yağ" percent={fatPct} grams={macros.fat} color="linear-gradient(90deg, #fbbf24, #f59e0b)" delay={200} animate={true} />
                                        <MacroBar label="Karb" percent={carbPct} grams={macros.carb} color="linear-gradient(90deg, #60a5fa, #3b82f6)" delay={400} animate={true} />
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
                    className="text-slate-600 hover:text-slate-800 font-bold transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                    <span>&larr;</span> Geri Dön
                </button>
            </div>
        </div>
    );
}
