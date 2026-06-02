import { getBMICategory } from "../utils/calculations";

interface ResultsPanelProps {
    calculatedBMI: number;
    leanMass: number;
    bodyFat: number;
    kilo: number;
    ffmi?: number;
    normalizedFfmi?: number;
}

export default function ResultsPanel({ calculatedBMI, leanMass, bodyFat, kilo, ffmi, normalizedFfmi }: ResultsPanelProps) {
    const { label: bmiLabel } = getBMICategory(calculatedBMI);

    const arcLength = 188.5; // (270 degrees out of 360 with radius 40)
    const progressPercent = calculatedBMI > 0 ? Math.min(100, Math.max(0, (calculatedBMI / 40) * 100)) : 0;
    const dashOffset = arcLength - (arcLength * progressPercent) / 100;
    const fatMass = (kilo * bodyFat) / 100;

    return (
        <div className="w-full max-w-[320px] lg:w-[320px] bg-gradient-to-b from-[#4F46E5] to-[#0F172A] text-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.36)] p-8 py-10 z-30 relative transition-transform mb-8 lg:mb-0 h-auto lg:min-h-[440px] flex flex-col font-sans">

            {/* Dairesel İlerleme Çubuğu SVG */}
            <div className="relative w-48 h-48 mx-auto mt-2 mb-6">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <defs>
                        <linearGradient id="gaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#c084fc" />
                            <stop offset="50%" stopColor="#818cf8" />
                            <stop offset="100%" stopColor="#22d3ee" />
                        </linearGradient>
                    </defs>
                    <path
                        d="M 21.7 78.3 A 40 40 0 1 1 78.3 78.3"
                        fill="transparent"
                        stroke="rgba(99, 102, 241, 0.2)"
                        strokeWidth="10"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 21.7 78.3 A 40 40 0 1 1 78.3 78.3"
                        fill="transparent"
                        stroke="url(#gaugeGradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={arcLength}
                        strokeDashoffset={dashOffset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                    <span className="text-5xl font-bold tracking-tight text-white mb-0.5">
                        {calculatedBMI > 0 ? calculatedBMI.toFixed(1) : "0.0"}
                    </span>
                    <span className="text-[10px] text-white font-bold tracking-wider uppercase">
                        BMI SKORU
                    </span>
                </div>
            </div>

            {/* Alt Metrikler */}
            <div className="flex flex-col gap-4 px-1 pb-1 mt-auto">
                <div className="flex justify-between items-center text-[13.5px]">
                    <span className="text-white font-normal tracking-wide">Beden Kitle İndeksi</span>
                    <span className="text-white font-medium">{calculatedBMI > 0 ? calculatedBMI.toFixed(2) : '--'}</span>
                </div>
                <div className="flex justify-between items-center text-[13.5px]">
                    <span className="text-white font-normal tracking-wide">BMI Durumu</span>
                    <span className="text-white font-medium">{calculatedBMI > 0 ? bmiLabel : '--'}</span>
                </div>
                <div className="flex justify-between items-center text-[13.5px]">
                    <span className="text-white font-normal tracking-wide">Yağsız Vücut Kütlesi</span>
                    <span className="text-white font-medium">{leanMass > 0 ? leanMass.toFixed(2) : '--'} kg</span>
                </div>
                <div className="flex justify-between items-center text-[13.5px]">
                    <span className="text-white font-normal tracking-wide">Vücut Yağ Kütlesi</span>
                    <span className="text-white font-medium">{bodyFat > 0 ? fatMass.toFixed(2) : '--'} kg</span>
                </div>

                {ffmi !== undefined && (
                    <div className="flex justify-between items-center text-[13.5px]">
                        <span className="text-white font-normal tracking-wide">FFMI Skoru</span>
                        <span className="text-white font-medium">{ffmi.toFixed(2)}</span>
                    </div>
                )}

                {normalizedFfmi !== undefined && (
                    <div className="flex justify-between items-center text-[13.5px]">
                        <span className="text-cyan-400 font-normal tracking-wide">Normalize FFMI</span>
                        <span className="text-cyan-400 font-bold">{normalizedFfmi.toFixed(2)}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
