import React from "react";
import { motion } from "framer-motion";
import { Utensils } from "lucide-react";
import { useTypewriter } from "../../hooks/useTypewriter";
import { MealCard } from "../../types";

// --- DAKTİLO YAZI SATIRI BİLEŞENİ ---
// Bu alt bileşen sadece bu dosyada kullanıldığı için export etmiyoruz.
function TypewriterLine({ text, startTyping }: { text: string; startTyping: boolean }) {
    const displayed = useTypewriter(text, 30, startTyping);
    return (
        <span className="text-white/80 text-sm">
            {displayed}
            {startTyping && displayed.length < text.length && (
                <span className="inline-block w-0.5 h-4 bg-emerald-400 ml-0.5 animate-pulse align-middle" />
            )}
        </span>
    );
}

// --- ANA KART BİLEŞENİ PROPLARI ---
interface MealCardProps {
    meal: MealCard;
    index: number;
    startTyping: boolean;
}

export const MealCardComponent: React.FC<MealCardProps> = ({ meal, index, startTyping }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white/[0.05] backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-emerald-400/20 transition-colors"
        >
            <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-emerald-500/15 rounded-lg flex items-center justify-center border border-emerald-500/20">
                    <Utensils className="w-4 h-4 text-emerald-400" />
                </div>
                <h4 className="text-white font-bold text-sm">{meal.title}</h4>
            </div>
            <div className="flex flex-col gap-2">
                {meal.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <TypewriterLine text={item.fullText} startTyping={startTyping} />
                        <span className="text-indigo-200/30 text-xs font-medium ml-3 shrink-0">{item.cal}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};