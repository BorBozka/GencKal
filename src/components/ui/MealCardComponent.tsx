import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Utensils } from "lucide-react";
import { useTypewriter } from "../../hooks/useTypewriter";
import { MealCard, MealItem } from "../../types";

function formatMacroValue(value: number): string {
    if (!Number.isFinite(value)) return "0";
    const rounded = Math.round(value * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

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
        <div className="mt-1.5 flex flex-row items-center gap-2">
            <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                P {formatMacroValue(protein)}g
            </span>
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Y {formatMacroValue(fat)}g
            </span>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                K {formatMacroValue(carb)}g
            </span>
        </div>
    );
}

// --- YENİLEME (SWAP) SVG İKONU ---
function RefreshIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 2v6h-6" />
            <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
            <path d="M3 22v-6h6" />
            <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
        </svg>
    );
}

// --- YENİLEME PROGRESS BİLEŞENİ ---
function RefreshProgress() {
    return (
        <div className="h-1.5 w-8 overflow-hidden rounded-full bg-indigo-100">
            <motion.div
                className="h-full w-1/2 rounded-full bg-indigo-500"
                initial={{ x: "-100%" }}
                animate={{ x: ["-100%", "220%"] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    );
}


// --- İZOLE BESİN SATIRI BİLEŞENİ ---
interface FoodItemRowProps {
    item: MealItem;
    mealId: string;
    startTyping: boolean;
    onSwapFood?: (mealId: string, foodId: string) => Promise<void>;
}

function FoodItemRow({ item, mealId, startTyping, onSwapFood }: FoodItemRowProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSwap = useCallback(async () => {
        if (isLoading || !onSwapFood) return;
        setIsLoading(true);
        try {
            await onSwapFood(mealId, item.id);
        } catch (error) {
            console.error("Besin değişimi sırasında hata oluştu:", error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, onSwapFood, mealId, item.id]);

    return (
        <div className="flex flex-col gap-1 py-4 px-2 hover:bg-slate-50 transition-colors duration-150 rounded-lg group">
            {/* Üst satır: İsim + Kalori + Swap Butonu */}
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                    {isLoading ? (
                        <div className="h-4 w-3/4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-md animate-pulse" />
                    ) : (
                        <TypewriterLine text={item.fullText} startTyping={startTyping} />
                    )}
                </div>
                <div className="flex items-center gap-1.5 ml-3 shrink-0">
                    {isLoading ? (
                        <div className="h-3.5 w-10 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 rounded-md animate-pulse" />
                    ) : (
                        <span className="text-slate-600 text-xs font-semibold tabular-nums">
                            {item.cal} <span className="text-[9px] text-slate-600 font-normal">kcal</span>
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={handleSwap}
                        disabled={isLoading}
                        title="Bu besini yenile"
                        aria-label="Bu besini yenile"
                        className="text-slate-600 hover:text-indigo-600 transition-colors duration-200 p-1 rounded-md hover:bg-indigo-50 opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-100 disabled:cursor-wait"
                    >
                        {isLoading ? <RefreshProgress /> : <RefreshIcon className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            {/* Alt satır: Makro Rozetleri */}
            {!isLoading ? (
                <MacroBadges
                    protein={item.macros.protein}
                    fat={item.macros.fat}
                    carb={item.macros.carb}
                />
            ) : (
                <div className="mt-1.5 flex flex-row items-center gap-2">
                    <div className="h-5 w-14 animate-pulse rounded-md bg-gradient-to-r from-rose-100 via-rose-50 to-rose-100" />
                    <div className="h-5 w-12 animate-pulse rounded-md bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100" />
                    <div className="h-5 w-12 animate-pulse rounded-md bg-gradient-to-r from-blue-100 via-blue-50 to-blue-100" />
                </div>
            )}
        </div>
    );
}

// --- ANA KART BİLEŞENİ PROPLARI ---
interface MealCardProps {
    meal: MealCard;
    index: number;
    startTyping: boolean;
    onSwapFood?: (mealId: string, foodId: string) => Promise<void>;
}

export function MealCardComponent({ meal, index, startTyping, onSwapFood }: MealCardProps) {
    // Öğün toplam kalorisi
    const mealTotalCal = meal.items.reduce((sum, item) => sum + item.cal, 0);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="bg-gradient-to-br from-indigo-50/80 to-white border-2 border-indigo-100 shadow-md rounded-3xl p-6 hover:shadow-hover hover:border-indigo-200 transition-all duration-300"
        >
            {/* Öğün Başlığı + Toplam Kalori */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                        <Utensils className="w-4 h-4 text-[#3E3AAF]" />
                    </div>
                    <h4 className="text-slate-900 font-bold text-sm">{meal.title}</h4>
                </div>
                <span className="text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                    {mealTotalCal} kcal
                </span>
            </div>

            {/* Yiyecek Listesi */}
            <div className="flex flex-col divide-y divide-slate-100">
                {meal.items.map((item) => (
                    <FoodItemRow
                        key={item.id}
                        item={item}
                        mealId={meal.id}
                        startTyping={startTyping}
                        onSwapFood={onSwapFood}
                    />
                ))}
            </div>
        </motion.div>
    );
}
