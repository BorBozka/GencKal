import React from "react";
import { motion } from "framer-motion";
import { Utensils } from "lucide-react";
import { useTypewriter } from "../../hooks/useTypewriter";
import { MealCard } from "../../types";

// --- DAKTİLO YAZI SATIRI BİLEŞENİ ---
function TypewriterLine({ text, startTyping }: { text: string; startTyping: boolean }) {
    const displayed = useTypewriter(text, 30, startTyping);
    return (
        <span className="text-slate-700 text-sm leading-relaxed">
            {displayed}
            {startTyping && displayed.length < text.length && (
                <span className="inline-block w-0.5 h-4 bg-[#3E3AAF] ml-0.5 animate-pulse align-middle" />
            )}
        </span>
    );
}

// --- MAKRO ROZET BİLEŞENİ ---
function MacroBadges({ protein, fat, carb }: { protein: number; fat: number; carb: number }) {
    return (
        <div className="flex items-center gap-1.5 mt-1.5">
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-semibold leading-none">
                P {protein}g
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 text-[10px] font-semibold leading-none">
                Y {fat}g
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-semibold leading-none">
                K {carb}g
            </span>
        </div>
    );
}

// --- ANA KART BİLEŞENİ PROPLARI ---
interface MealCardProps {
    meal: MealCard;
    index: number;
    startTyping: boolean;
}

export const MealCardComponent: React.FC<MealCardProps> = ({ meal, index, startTyping }) => {
    // Öğün toplam kalorisi
    const mealTotalCal = meal.items.reduce((sum, item) => sum + item.cal, 0);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-slate-200/80 shadow-soft rounded-3xl p-6 hover:shadow-hover hover:border-slate-300 transition-all duration-300"
        >
            {/* Öğün Başlığı + Toplam Kalori */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                        <Utensils className="w-4 h-4 text-[#3E3AAF]" />
                    </div>
                    <h4 className="text-slate-900 font-bold text-sm">{meal.title}</h4>
                </div>
                <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    {mealTotalCal} kcal
                </span>
            </div>

            {/* Yiyecek Listesi */}
            <div className="flex flex-col divide-y divide-slate-100">
                {meal.items.map((item, i) => (
                    <div key={i} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
                        {/* Üst satır: İsim + Kalori */}
                        <div className="flex items-center justify-between">
                            <TypewriterLine text={item.fullText} startTyping={startTyping} />
                            <span className="text-slate-600 text-xs font-semibold ml-3 shrink-0 tabular-nums">
                                {item.cal} <span className="text-[9px] text-slate-300 font-normal">kcal</span>
                            </span>
                        </div>
                        {/* Alt satır: Makro Rozetleri */}
                        {item.macros && (
                            <MacroBadges
                                protein={item.macros.protein}
                                fat={item.macros.fat}
                                carb={item.macros.carb}
                            />
                        )}
                    </div>
                ))}
            </div>
        </motion.div>
    );
};