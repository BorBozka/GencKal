// src/components/DietPlanWizard.tsx
"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Flame, Utensils, Dumbbell, ChevronRight, Save, AlertTriangle, RotateCcw } from "lucide-react";

import DietPreferencesForm, { type DietPreferencesData } from "./DietPreferencesForm";
import { MacroBar } from "./ui/MacroBar";
import { SkeletonLoading } from "./ui/SkeletonLoading";
import { MealCardComponent } from "./ui/MealCardComponent";
import type { MealCard, MacroDistribution } from "../types";

interface DietPlanWizardProps {
    targetCalories: number;
    selectedPlanName: string;
    onBack: () => void;
}

export default function DietPlanWizard({ targetCalories, selectedPlanName, onBack }: DietPlanWizardProps) {
    const [step, setStep] = useState<"form" | "generating">("form");
    const [formData, setFormData] = useState<DietPreferencesData | null>(null);
    const [generatedPlan, setGeneratedPlan] = useState<{ macros: MacroDistribution; meals: MealCard[] } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            setGeneratedPlan(plan);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Beklenmeyen bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    }, [targetCalories]);

    const handleRetry = useCallback(() => {
        if (formData) handleGenerate(formData);
    }, [formData, handleGenerate]);

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
                    <motion.div key="form-full" layout className="w-full flex items-start justify-center"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30, scale: 0.95 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
                        <DietPreferencesForm targetCalories={targetCalories} selectedPlanName={selectedPlanName} onBack={onBack} onSubmit={handleGenerate} />
                    </motion.div>
                ) : (
                    <motion.div key="form-summary" layout className="w-full lg:w-[320px] shrink-0"
                        initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>

                        {/* Mobil: yatay ince bilgi çubuğu (Eski tasarıma dönüldü) */}
                        <div className="lg:hidden bg-white/[0.07] backdrop-blur-xl rounded-2xl p-4 border border-white/10 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                    <Flame className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-sm">{targetCalories} kcal</p>
                                    <p className="text-indigo-200/40 text-[10px]">{selectedPlanName}</p>
                                </div>
                            </div>
                            {formData && (
                                <div className="flex items-center gap-2">
                                    <span className="text-indigo-200/40 text-[10px]">{formData.mealsPerDay} öğün</span>
                                    <span className="text-white/10">·</span>
                                    <span className="text-indigo-200/40 text-[10px] capitalize">{formData.dietType}</span>
                                </div>
                            )}
                        </div>

                        {/* Masaüstü: dikey özet kartı (Eski tasarıma dönüldü) */}
                        <div className="hidden lg:flex flex-col bg-white/[0.07] backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] sticky top-24">
                            <div className="text-center border-b border-white/10 pb-4 mb-5">
                                <p className="text-indigo-200/50 text-[10px] uppercase tracking-[0.25em] font-bold mb-1">{selectedPlanName}</p>
                                <p className="text-white font-black text-3xl">
                                    {targetCalories} <span className="text-sm font-medium text-indigo-200/50">kcal</span>
                                </p>
                            </div>

                            {formData && (
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Utensils className="w-4 h-4 text-emerald-400/70" />
                                        <span className="text-indigo-200/50 flex-1">Öğün Sayısı</span>
                                        <span className="text-white font-bold">{formData.mealsPerDay}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Dumbbell className="w-4 h-4 text-emerald-400/70" />
                                        <span className="text-indigo-200/50 flex-1">Diyet Tipi</span>
                                        <span className="text-white font-bold capitalize">{formData.dietType}</span>
                                    </div>
                                    {formData.allergies && (
                                        <div className="flex items-start gap-3 text-sm mt-1">
                                            <ChevronRight className="w-4 h-4 text-red-400/60 mt-0.5 shrink-0" />
                                            <span className="text-indigo-200/50 flex-1">Alerjiler</span>
                                            <span className="text-red-300/70 font-medium text-xs text-right max-w-[120px]">{formData.allergies}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {showPlanData && (
                                <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2">
                                    <p className="text-[10px] text-indigo-200/30 uppercase tracking-widest font-bold mb-1">Makro Hedef</p>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-indigo-200/40">Protein</span>
                                        <span className="text-emerald-400 font-bold">{proteinPct}%</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-indigo-200/40">Yağ</span>
                                        <span className="text-amber-400 font-bold">{fatPct}%</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-indigo-200/40">Karbonhidrat</span>
                                        <span className="text-blue-400 font-bold">{carbPct}%</span>
                                    </div>
                                </div>
                            )}

                            <button onClick={() => { setStep("form"); setGeneratedPlan(null); setError(null); }}
                                className="mt-6 py-2.5 rounded-xl text-indigo-200/40 text-xs font-bold hover:bg-white/5 hover:text-white/60 transition-all border border-transparent hover:border-white/10">
                                ← Düzenle
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SAĞ PANEL (ÜRETİM ALANI) */}
            <AnimatePresence>
                {step === "generating" && (
                    <motion.div key="generation-area" className="flex-1 flex flex-col gap-5 min-h-0 overflow-y-auto pb-8"
                        initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>

                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-emerald-500/15 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">AI Beslenme Planı</h3>
                                <p className="text-indigo-200/40 text-xs">
                                    {isLoading ? "Planınız oluşturuluyor..." : error ? "Bir hata oluştu" : "Planınız hazır!"}
                                </p>
                            </div>
                        </div>

                        {isLoading && <SkeletonLoading />}

                        {/* Hata Kartı (Glassmorphism Dark Tema Uyumu) */}
                        {error && !isLoading && (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                                className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-5 border border-red-500/20">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                    <div className="flex-1">
                                        <h4 className="text-red-400 font-bold text-sm mb-1">Plan oluşturulamadı</h4>
                                        <p className="text-red-300/80 text-xs leading-relaxed">{error}</p>
                                    </div>
                                </div>
                                <button onClick={handleRetry}
                                    className="mt-4 w-full py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 font-bold text-sm transition-all border border-red-500/30 flex items-center justify-center gap-2">
                                    <RotateCcw className="w-4 h-4" /> Tekrar Dene
                                </button>
                            </motion.div>
                        )}

                        {showPlanData && (
                            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                                className="bg-white/[0.05] backdrop-blur-sm rounded-2xl p-5 border border-white/10">
                                <h4 className="text-[10px] text-indigo-200/50 uppercase tracking-[0.2em] font-bold mb-4">Kalori & Makro Dağılımı</h4>

                                <div className="flex items-baseline gap-2 mb-5">
                                    <span className="text-white font-black text-3xl">{targetCalories}</span>
                                    <span className="text-indigo-200/40 text-sm font-medium">kcal / gün</span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <MacroBar label="Protein" percent={proteinPct} grams={macros.protein} color="linear-gradient(90deg, #10b981, #34d399)" delay={0} animate={true} />
                                    <MacroBar label="Yağ" percent={fatPct} grams={macros.fat} color="linear-gradient(90deg, #f59e0b, #fbbf24)" delay={200} animate={true} />
                                    <MacroBar label="Karb" percent={carbPct} grams={macros.carb} color="linear-gradient(90deg, #3b82f6, #60a5fa)" delay={400} animate={true} />
                                </div>

                                <div className="flex gap-3 mt-4 pt-3 border-t border-white/5">
                                    <div className="flex-1 text-center">
                                        <p className="text-emerald-400 font-bold text-sm">{macros.protein}g</p>
                                        <p className="text-indigo-200/30 text-[10px] mt-0.5">Protein</p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-amber-400 font-bold text-sm">{macros.fat}g</p>
                                        <p className="text-indigo-200/30 text-[10px] mt-0.5">Yağ</p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-blue-400 font-bold text-sm">{macros.carb}g</p>
                                        <p className="text-indigo-200/30 text-[10px] mt-0.5">Karbonhidrat</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* ÖĞÜN KARTLARI — 2 Sütunlu Grid */}
                        {showPlanData && (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {generatedPlan.meals.map((meal, i) => (
                                    <MealCardComponent key={i} meal={meal} index={i} startTyping={true} />
                                ))}
                            </div>
                        )}

                        {showPlanData && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="mt-2">
                                <button className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2.5 animate-pulse"
                                    style={{ animationDuration: "2s" }}>
                                    <Save className="w-4.5 h-4.5" /> Planı Kaydet
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}