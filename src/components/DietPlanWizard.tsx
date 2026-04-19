"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Flame, Utensils, Dumbbell, ChevronRight, Save } from "lucide-react";

// Modüler Importlarımız
import DietPreferencesForm, { type DietPreferencesData } from "./DietPreferencesForm";
import { MacroBar } from "./ui/MacroBar";
import { SkeletonLoading } from "./ui/SkeletonLoading";
import { MealCardComponent } from "./ui/MealCardComponent";

// Saf fonksiyonlar ve tipler
import { calculateMacroGrams } from "../utils/calculations";
import type { MealCard } from "../types";

interface DietPlanWizardProps {
    targetCalories: number;
    selectedPlanName: string;
    onBack: () => void;
}

// Örnek Veri
const sampleMeals: MealCard[] = [
    {
        title: "Öğün 1 — Kahvaltı",
        items: [
            { name: "Yumurta", cal: "220 kcal", fullText: "3 Adet Haşlanmış Yumurta" },
            { name: "Yulaf", cal: "350 kcal", fullText: "Yulaf Ezmesi + Muz + Bal" },
            { name: "Süt", cal: "120 kcal", fullText: "1 Bardak Yarım Yağlı Süt" },
        ],
    },
    {
        title: "Öğün 2 — Öğle Yemeği",
        items: [
            { name: "Tavuk", cal: "380 kcal", fullText: "150g Izgara Tavuk Göğsü" },
            { name: "Pilav", cal: "260 kcal", fullText: "1 Porsiyon Bulgur Pilavı" },
            { name: "Salata", cal: "80 kcal", fullText: "Mevsim Salata + Zeytinyağı" },
        ],
    },
    {
        title: "Öğün 3 — Akşam Yemeği",
        items: [
            { name: "Balık", cal: "320 kcal", fullText: "200g Somon Fileto" },
            { name: "Sebze", cal: "150 kcal", fullText: "Fırında Karışık Sebze" },
            { name: "Ekmek", cal: "120 kcal", fullText: "2 Dilim Tam Buğday Ekmeği" },
        ],
    },
];

export default function DietPlanWizard({ targetCalories, selectedPlanName, onBack }: DietPlanWizardProps) {
    const [step, setStep] = useState<"form" | "generating">("form");
    const [formData, setFormData] = useState<DietPreferencesData | null>(null);
    const [phase, setPhase] = useState(0);

    const handleGenerate = useCallback((data: DietPreferencesData) => {
        setFormData(data);
        setStep("generating");
        setPhase(0);
    }, []);

    useEffect(() => {
        if (step !== "generating") return;

        const timers = [
            setTimeout(() => setPhase(1), 1500),
            setTimeout(() => setPhase(2), 3000),
            setTimeout(() => setPhase(3), 4500),
            setTimeout(() => setPhase(4), 6000),
            setTimeout(() => setPhase(5), 7500),
        ];

        return () => timers.forEach(clearTimeout);
    }, [step]);

    const macros = { protein: 35, fat: 25, carb: 40 };

    return (
        <div className="w-full flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
            {/* SOL PANEL (FORM VEYA ÖZET) */}
            <AnimatePresence mode="wait">
                {step === "form" ? (
                    <motion.div
                        key="form-full"
                        layout
                        className="w-full flex items-start justify-center"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -30, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <DietPreferencesForm
                            targetCalories={targetCalories}
                            selectedPlanName={selectedPlanName}
                            onBack={onBack}
                            onSubmit={handleGenerate}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="form-summary"
                        layout
                        className="w-full lg:w-[320px] shrink-0"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    >
                        {/* Mobil: yatay ince bilgi çubuğu */}
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

                        {/* Masaüstü: dikey özet kartı */}
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

                            <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2">
                                <p className="text-[10px] text-indigo-200/30 uppercase tracking-widest font-bold mb-1">Makro Hedef</p>
                                <div className="flex justify-between text-xs">
                                    <span className="text-indigo-200/40">Protein</span>
                                    <span className="text-emerald-400 font-bold">{macros.protein}%</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-indigo-200/40">Yağ</span>
                                    <span className="text-amber-400 font-bold">{macros.fat}%</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-indigo-200/40">Karbonhidrat</span>
                                    <span className="text-blue-400 font-bold">{macros.carb}%</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep("form")}
                                className="mt-6 py-2.5 rounded-xl text-indigo-200/40 text-xs font-bold hover:bg-white/5 hover:text-white/60 transition-all border border-transparent hover:border-white/10"
                            >
                                ← Düzenle
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* SAĞ PANEL (ÜRETİM ALANI) */}
            <AnimatePresence>
                {step === "generating" && (
                    <motion.div
                        key="generation-area"
                        className="flex-1 flex flex-col gap-5 min-h-0 overflow-y-auto pb-8"
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-emerald-500/15 rounded-xl flex items-center justify-center border border-emerald-500/20">
                                <Sparkles className="w-4.5 h-4.5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-white font-bold text-lg">AI Beslenme Planı</h3>
                                <p className="text-indigo-200/40 text-xs">
                                    {phase < 5 ? "Planınız oluşturuluyor..." : "Planınız hazır!"}
                                </p>
                            </div>
                        </div>

                        {phase === 0 && <SkeletonLoading />}

                        {phase >= 1 && (
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="bg-white/[0.05] backdrop-blur-sm rounded-2xl p-5 border border-white/10"
                            >
                                <h4 className="text-[10px] text-indigo-200/50 uppercase tracking-[0.2em] font-bold mb-4">Kalori & Makro Dağılımı</h4>

                                <div className="flex items-baseline gap-2 mb-5">
                                    <span className="text-white font-black text-3xl">{targetCalories}</span>
                                    <span className="text-indigo-200/40 text-sm font-medium">kcal / gün</span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <MacroBar label="Protein" percent={macros.protein} color="linear-gradient(90deg, #10b981, #34d399)" delay={0} animate={phase >= 1} />
                                    <MacroBar label="Yağ" percent={macros.fat} color="linear-gradient(90deg, #f59e0b, #fbbf24)" delay={200} animate={phase >= 1} />
                                    <MacroBar label="Karb" percent={macros.carb} color="linear-gradient(90deg, #3b82f6, #60a5fa)" delay={400} animate={phase >= 1} />
                                </div>

                                <div className="flex gap-3 mt-4 pt-3 border-t border-white/5">
                                    <div className="flex-1 text-center">
                                        <p className="text-emerald-400 font-bold text-sm">
                                            {calculateMacroGrams(targetCalories, macros.protein, 'protein')}g
                                        </p>
                                        <p className="text-indigo-200/30 text-[10px] mt-0.5">Protein</p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-amber-400 font-bold text-sm">
                                            {calculateMacroGrams(targetCalories, macros.fat, 'fat')}g
                                        </p>
                                        <p className="text-indigo-200/30 text-[10px] mt-0.5">Yağ</p>
                                    </div>
                                    <div className="flex-1 text-center">
                                        <p className="text-blue-400 font-bold text-sm">
                                            {calculateMacroGrams(targetCalories, macros.carb, 'carb')}g
                                        </p>
                                        <p className="text-indigo-200/30 text-[10px] mt-0.5">Karbonhidrat</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {phase >= 2 && sampleMeals.slice(0, phase - 1).map((meal, i) => (
                            <MealCardComponent key={i} meal={meal} index={i} startTyping={true} />
                        ))}

                        {phase >= 5 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="mt-2"
                            >
                                <button className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2.5 animate-pulse"
                                    style={{ animationDuration: "2s" }}
                                >
                                    <Save className="w-4.5 h-4.5" />
                                    Planı Kaydet
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}