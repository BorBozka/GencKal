import { useMemo } from "react";

interface ReferenceScaleProps {
    score: number;
    type: "FFMI" | "BMI";
}

export default function ReferenceScale({ score, type }: ReferenceScaleProps) {
    const isBMI = type === "BMI";
    const minScale = isBMI ? 15 : 15;
    const maxScale = isBMI ? 40 : 31;

    const percent = useMemo(() => {
        if (score <= 0) return 0;
        return Math.min(100, Math.max(0, ((score - minScale) / (maxScale - minScale)) * 100));
    }, [score, minScale, maxScale]);

    const ffmiCategories = [
        { label: "Ortalamanın Altı", center: 16.8 },
        { label: "Ortalama", center: 18.5 },
        { label: "Ortalamanın Üstü", center: 20.5 },
        { label: "Mükemmel", center: 22.5 },
        { label: "Üstün", center: 24.5 },
        { label: "Şüpheli", center: 26.5 },
        { label: "İmkansız", center: 29.0 }
    ];

    const bmiCategories = [
        { label: "Ortalamanın Altı", center: 16.75 },
        { label: "Ortalama", center: 21.75 },
        { label: "Ortalamanın Üstü", center: 27.5 },
        { label: "İmkansız", center: 35 }
    ];

    const categories = isBMI ? bmiCategories : ffmiCategories;

    const barGradient = "linear-gradient(to right, rgba(239,68,68,0) 0%, rgba(239,68,68,1) 5%, rgba(249,115,22,1) 15%, rgba(234,179,8,1) 30%, rgba(132,204,22,1) 45%, rgba(16,185,129,1) 50%, rgba(6,182,212,1) 60%, rgba(59,130,246,1) 75%, rgba(139,92,246,1) 90%, rgba(168,85,247,0) 100%)";

    const ticks = isBMI
        ? [15, 20, 25, 30, 35, 40]
        : Array.from({ length: 15 }, (_, i) => 16 + i);

    return (
        <div className="w-full relative z-10 font-sans mt-13 md:mt-20 mx-auto px-4 sm:px-8 lg:px-12 max-w-[1400px]">
            {/* Skalanın kendisi (Her şey bu div'e göre konumlanacak) */}
            <div className="relative w-full mt-9 mb-4">

                {/* 1. İŞARETÇİ ÜÇGEN (Orijinal sitedeki gibi zarif, içi boş üçgen) */}
                <div
                    className="absolute -top-7 transition-all duration-700 ease-out z-30 -translate-x-1/2"
                    style={{ left: `${percent}%` }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                        <polygon points="4,4 20,4 12,20"></polygon>
                    </svg>
                </div>

                {/* 2. YÜZEY GRADIENT BAR VE İÇİNDEKİ METİNLER */}
                <div
                    className="w-full h-8 z-10 rounded-full opacity-95 relative shadow-inner"
                    style={{ background: barGradient }}
                >
                    {categories.map((cat, idx) => {
                        // Kategori yazısının tam matematiksel merkezini hesaplıyoruz
                        const catPercent = Math.min(100, Math.max(0, ((cat.center - minScale) / (maxScale - minScale)) * 100));
                        return (
                            <div
                                key={idx}
                                className="hidden md:flex absolute h-full items-center justify-center -translate-x-1/2"
                                style={{ left: `${catPercent}%` }}
                            >
                                <span className="text-white font-bold text-[10px] sm:text-xs tracking-wider drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] whitespace-nowrap">
                                    {cat.label}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* 3. RAKAMSAL SINIRLAR (Matematiksel Hizalama) */}
                <div className="relative w-full h-6 mt-3">
                    {ticks.map((tick) => {
                        const tickPercent = ((tick - minScale) / (maxScale - minScale)) * 100;
                        return (
                            <span
                                key={tick}
                                className="absolute -translate-x-1/2 text-gray-300 font-medium text-xs sm:text-sm"
                                style={{ left: `${tickPercent}%` }}
                            >
                                {tick}
                            </span>
                        );
                    })}
                </div>

            </div>
        </div>
    );
}
