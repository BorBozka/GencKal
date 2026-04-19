"use client";

// 1. Core / React Imports
import React, { useState, useMemo } from "react";

// 2. Types & Interfaces
import {
    KullaniciProfil,
    Cinsiyet,
    AktiviteSeviyesi,
    Hedef,
} from "../types";

// 3. Utilities / Calculations
import { calculateBMI, calculateDetailedFFMI, calculateTDEE } from "../utils/calculations";

// 4. Components
import InputPanel from "./InputPanel";
import ResultsPanel from "./ResultsPanel";
import TargetSimulator from "./TargetSimulator";
import ReferenceScale from "./ReferenceScale";
import EducationalSection from "./EducationalSection";
import TDEECalculatorPanel from "./TDEECalculatorPanel";
import DietPlanWizard from "./DietPlanWizard";

export default function OnboardingForm() {
    const [step, setStep] = useState<number>(1);
    const [errorLine, setErrorLine] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<{ name: string; calories: number } | null>(null);

    const [formData, setFormData] = useState<KullaniciProfil>({
        fizikselVeriler: {
            boy: 175,
            kilo: 75,
            yas: 25,
            cinsiyet: "erkek" as Cinsiyet,
            yagOrani: 15,
            aktiviteSeviyesi: "hareketsiz (ofis işi)" as AktiviteSeviyesi,
            agirlikCalisiyorMu: false,
        },
        diyetVerileri: {
            diyetTipi: "standart",
            ogunSayisi: 3,
            alerjenler: [],
            kullanilanTakviyeler: [],
            hedef: "kilo_koruma" as Hedef,
        },
    });

    const { boy, kilo, yas, yagOrani } = formData.fizikselVeriler;

    // --- ANLIK HESAPLAMALAR (Real-time Calculations) ---
    const calculatedBMI = useMemo(() => calculateBMI(boy, kilo), [boy, kilo]);
    const { leanMass, ffmi: rawFFMI, normalizedFfmi: calculatedFFMI } = useMemo(
        () => calculateDetailedFFMI(boy, kilo, yagOrani),
        [boy, kilo, yagOrani]
    );
    const calculatedTDEE = useMemo(
        () => calculateTDEE(formData.fizikselVeriler),
        [formData.fizikselVeriler]
    );

    // --- ETKİLEŞİM YÖNETİCİLERİ (Handlers) ---
    const handleFizikselChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let finalValue: string | number | boolean = value;

        if (type === "number" || type === "range") finalValue = Number(value);
        else if (type === "checkbox") finalValue = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            fizikselVeriler: { ...prev.fizikselVeriler, [name]: finalValue }
        }));
    };

    const setFizikselAlan = <K extends keyof KullaniciProfil["fizikselVeriler"]>(
        name: K,
        value: KullaniciProfil["fizikselVeriler"][K]
    ) => {
        setFormData(prev => ({
            ...prev,
            fizikselVeriler: { ...prev.fizikselVeriler, [name]: value }
        }));
    };

    const handleProceedToDiet = () => {
        if (boy < 100 || boy > 230 || kilo < 30 || kilo > 300 || yas < 15 || yas > 100) {
            setErrorLine("Lütfen fiziksel değerlerinizi kontrol edin (Boy: 100-230, Kilo: 30-300, Yaş: 15-100).");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setErrorLine(null);
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSelectPlan = (name: string, calories: number) => {
        setSelectedPlan({ name, calories });
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };



    // --- RENDER ---
    if (step === 3 && selectedPlan) {
        return (
            <div className="min-h-screen w-full bg-[#3E3AAF] flex flex-col font-sans text-white overflow-x-hidden"
                style={{ background: "linear-gradient(135deg, #2d2a7c 0%, #3E3AAF 40%, #4f46a8 70%, #3730a3 100%)" }}>
                <header className="sticky top-0 z-50 flex-none flex justify-between items-center py-3 px-6 md:px-12 bg-[#3E3AAF]/95 backdrop-blur-md text-white font-medium text-[15px] border-b border-white/10 shadow-sm">
                    <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-4 bg-white rounded-full"></div>
                            <div className="w-1.5 h-6 bg-white rounded-full"></div>
                            <div className="w-1.5 h-4 bg-white rounded-full"></div>
                        </div>
                        genckalcalculator
                    </div>
                    <div className="hidden sm:flex items-center gap-6">
                        <button
                            onClick={() => setStep(1)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] text-sm tracking-wide flex items-center gap-2"
                        >
                            <span>&larr;</span> Ana Sayfa
                        </button>
                        <a href="#" className="hover:text-indigo-200 transition-colors text-sm">İletişim</a>
                    </div>
                </header>
                <div className="flex-1 flex py-8 px-4 sm:px-6 max-w-[1500px] mx-auto w-full">
                    <DietPlanWizard
                        targetCalories={selectedPlan.calories}
                        selectedPlanName={selectedPlan.name}
                        onBack={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    />
                </div>
            </div>
        );
    }

    return step === 1 ? (
        /* --- 1. ADIM: FİZİKSEL VERİLER (Kaydırılabilir - Scrollable) --- */
        <div className="min-h-screen font-sans bg-white flex flex-col">
            <div className="animate-fade-in flex flex-col w-full">

                {/* --- STEP 1 Header (Sticky ve Solid Renk) --- */}
                <header className="sticky top-0 z-50 w-full flex justify-between items-center py-3 px-6 md:px-12 bg-[#3E3AAF] text-white font-medium text-[15px] border-b border-white/10 shadow-sm">
                    <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
                        <div className="flex items-center gap-1">
                            <div className="w-1.5 h-4 bg-white rounded-full"></div>
                            <div className="w-1.5 h-6 bg-white rounded-full"></div>
                            <div className="w-1.5 h-4 bg-white rounded-full"></div>
                        </div>
                        genckalcalculator
                    </div>
                    <div className="hidden sm:flex items-center gap-6">
                        <button
                            onClick={handleProceedToDiet}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] text-sm tracking-wide"
                        >
                            Diyet Planı Oluştur
                        </button>
                        <a href="#" className="hover:text-indigo-200 transition-colors text-sm">İletişim</a>
                    </div>
                </header>

                {/* --- ÜST BÖLÜM (Dashboard) --- */}
                <section className="bg-[#3E3AAF] text-white relative pb-6">
                    <div className="w-full mx-auto z-10 flex flex-col items-center mt-2 md:mt-4 px-4">
                        <div className="text-center mb-4">
                            <h1 className="text-[32px] sm:text-[38px] font-normal tracking-wide text-white drop-shadow-sm mb-1 font-sans">
                                GençKal Calculator
                            </h1>
                            <p className="text-[14px] sm:text-[15px] text-[#e0e7ff] font-light tracking-wide">
                                Sağlık metriklerinizi ve yağsız vücut kütlenizi belirleyin
                            </p>
                        </div>

                        {errorLine && (
                            <div className="w-full max-w-[900px] mb-2 p-3 bg-red-500/20 border border-red-500/50 text-white rounded-xl text-center text-sm font-bold animate-pulse">
                                {errorLine}
                            </div>
                        )}

                        <div className="relative flex flex-col xl:flex-row justify-center items-center xl:items-stretch gap-6 mt-2 w-full mb-4 max-w-[1400px] mx-auto">
                            <div className="relative flex flex-col md:flex-row w-full max-w-4xl justify-center items-center md:items-stretch">
                                <div className="z-20 w-full md:w-auto flex justify-center md:justify-end">
                                    <ResultsPanel
                                        calculatedBMI={calculatedBMI}
                                        leanMass={leanMass}
                                        bodyFat={yagOrani || 0}
                                        kilo={kilo}
                                        ffmi={rawFFMI}
                                        normalizedFfmi={calculatedFFMI}
                                    />
                                </div>
                                <div className="z-10 w-full md:w-auto md:-ml-12 mt-6 md:mt-0 flex justify-center md:justify-start">
                                    <InputPanel
                                        data={formData.fizikselVeriler}
                                        handleChange={handleFizikselChange}
                                        setField={setFizikselAlan}
                                    />
                                </div>
                            </div>
                            {kilo > 0 && yagOrani > 0 && (
                                <div className="z-20 w-full xl:w-auto flex justify-center">
                                    <TargetSimulator
                                        currentWeight={kilo}
                                        leanMass={leanMass}
                                        currentBodyFat={yagOrani}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Referans Skalası */}
                    <div className="w-full relative z-20 mt-2 pb-16 px-4">
                        <ReferenceScale
                            score={calculatedFFMI > 0 ? calculatedFFMI : calculatedBMI}
                            type={calculatedFFMI > 0 ? "FFMI" : "BMI"}
                            gender={formData.fizikselVeriler.cinsiyet}
                        />
                    </div>
                </section>

                {/* --- ALT BÖLÜM (Beyaz Eğitim Alanı) --- */}
                <div className="relative z-30 w-full bg-white pt-8 -mt-7 shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
                    <EducationalSection />
                </div>

            </div>
        </div>
    ) : (
        /* --- 2. ADIM: DİYET PLANI (Modernize Edilmiş Dark Theme) --- */
        <div className="min-h-screen w-full bg-[#3E3AAF] flex flex-col font-sans text-white overflow-x-hidden"
            style={{ background: "linear-gradient(135deg, #2d2a7c 0%, #3E3AAF 40%, #4f46a8 70%, #3730a3 100%)" }}>

            {/* --- STEP 2 HEADER --- */}
            <header className="sticky top-0 z-50 flex-none flex justify-between items-center py-3 px-6 md:px-12 bg-[#3E3AAF]/95 backdrop-blur-md text-white font-medium text-[15px] border-b border-white/10 shadow-sm">
                <div className="flex items-center gap-3 font-bold text-xl tracking-tight">
                    <div className="flex items-center gap-1">
                        <div className="w-1.5 h-4 bg-white rounded-full"></div>
                        <div className="w-1.5 h-6 bg-white rounded-full"></div>
                        <div className="w-1.5 h-4 bg-white rounded-full"></div>
                    </div>
                    genckalcalculator
                </div>
                <div className="hidden sm:flex items-center gap-6">
                    <button
                        onClick={() => setStep(1)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white px-5 py-2 rounded-full font-bold transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] text-sm tracking-wide flex items-center gap-2"
                    >
                        <span>&larr;</span> Ana Sayfa
                    </button>
                    <a href="#" className="hover:text-indigo-200 transition-colors text-sm">İletişim</a>
                </div>
            </header>

            {/* --- ANA İÇERİK (Scroll Edilebilir) --- */}
            <div className="flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-6 py-8 overflow-y-auto">

                {/* Sayfa Başlığı */}
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-[32px] sm:text-[38px] font-normal tracking-wide text-white drop-shadow-sm mb-1 font-sans">
                        Size Özel Diyet Planları
                    </h1>
                    <p className="text-[14px] sm:text-[15px] text-indigo-200/70 font-light tracking-wide">
                        TDEE değerinize göre kişiselleştirilmiş beslenme programınızı oluşturun
                    </p>
                </div>

                {/* Üst Alan: TDEE Hesaplama + Skor */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8">

                    {/* SOL: TDEE Hesaplama Paneli */}
                    <div className="flex-1 bg-white/[0.07] backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] animate-fade-in-up">
                        <h3 className="text-xs font-bold text-indigo-200/50 mb-4 tracking-[0.2em] uppercase">Hesaplama Detayları</h3>
                        <TDEECalculatorPanel
                            data={formData.fizikselVeriler}
                            handleChange={handleFizikselChange}
                            setField={setFizikselAlan}
                        />
                    </div>

                    {/* SAĞ: TDEE Skor Gösterimi */}
                    <div className="lg:w-[340px] flex-none bg-white/[0.07] backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center text-center relative overflow-hidden animate-scale-in"
                        style={{ animationDelay: "0.15s" }}>
                        {/* Arka plan glow efekti */}
                        <div className="absolute inset-0 opacity-30"
                            style={{ background: "radial-gradient(circle at 50% 40%, rgba(16,185,129,0.4) 0%, transparent 70%)" }}
                        />
                        <div className="relative z-10">
                            <h2 className="text-[10px] uppercase tracking-[0.25em] text-indigo-200/50 font-bold mb-3">Günlük Kalori İhtiyacınız (TDEE)</h2>
                            <p className="text-white font-black text-6xl md:text-7xl drop-shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-baseline gap-2 justify-center">
                                {calculatedTDEE} <span className="text-2xl font-medium text-indigo-200/60">kcal</span>
                            </p>
                            <p className="text-indigo-200/40 mt-4 max-w-xs text-xs md:text-sm leading-relaxed">
                                Aşağıdan hedefinize uygun planı seçerek LLM destekli programınızı oluşturun.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Alt Alan: 3'lü Plan Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">

                    {/* Kilo Al Kartı */}
                    <div className="group bg-white/[0.07] backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex flex-col items-center text-center hover:border-emerald-400/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all duration-300 cursor-pointer animate-fade-in-up"
                        style={{ animationDelay: "0.2s" }}>
                        <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:bg-emerald-500/25 transition-colors border border-emerald-500/20">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                <polyline points="16 7 22 7 22 13"></polyline>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Kilo Al (Bulking)</h3>
                        <p className="text-emerald-400 font-black text-3xl mb-2">
                            {calculatedTDEE + 500} <span className="text-xs text-indigo-200/40 font-medium">kcal</span>
                        </p>
                        <p className="text-indigo-200/40 text-xs mb-6 flex-1 leading-relaxed max-w-[220px]">
                            Kas kütlenizi artırmak için güvenli kalori fazlası.
                        </p>
                        <button
                            onClick={() => handleSelectPlan("Kilo Al (Bulking)", calculatedTDEE + 500)}
                            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 font-bold hover:bg-emerald-500 hover:border-emerald-400/50 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all text-sm">
                            Bu Planı Seç
                        </button>
                    </div>

                    {/* Kilo Koru Kartı (Mevcut Durum) */}
                    <div className="group bg-white/[0.1] backdrop-blur-xl rounded-3xl p-6 border-2 border-emerald-400/40 flex flex-col items-center text-center shadow-[0_0_30px_rgba(16,185,129,0.12)] transition-all duration-300 relative animate-fade-in-up"
                        style={{ animationDelay: "0.3s" }}>
                        <div className="absolute -top-3.5 bg-emerald-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] z-10">
                            MEVCUT DURUM
                        </div>
                        <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-2xl mb-4 border border-emerald-500/20">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Kilo Koru (Maintain)</h3>
                        <p className="text-emerald-400 font-black text-3xl mb-2">
                            {calculatedTDEE} <span className="text-xs text-indigo-200/40 font-medium">kcal</span>
                        </p>
                        <p className="text-indigo-200/40 text-xs mb-6 flex-1 leading-relaxed max-w-[220px]">
                            Mevcut formunuzu korumak için tam enerji ihtiyacınız.
                        </p>
                        <button
                            onClick={() => handleSelectPlan("Kilo Koru (Maintain)", calculatedTDEE)}
                            className="w-full py-3 rounded-xl bg-emerald-500 border border-emerald-400/50 text-white font-bold hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all text-sm">
                            Bu Planı Seç
                        </button>
                    </div>

                    {/* Kilo Ver Kartı */}
                    <div className="group bg-white/[0.07] backdrop-blur-xl rounded-3xl p-6 border border-white/10 flex flex-col items-center text-center hover:border-emerald-400/40 hover:shadow-[0_0_40px_rgba(16,185,129,0.15)] transition-all duration-300 cursor-pointer animate-fade-in-up"
                        style={{ animationDelay: "0.4s" }}>
                        <div className="w-14 h-14 bg-emerald-500/15 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:bg-emerald-500/25 transition-colors border border-emerald-500/20">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                                <polyline points="16 17 22 17 22 11"></polyline>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">Kilo Ver (Cutting)</h3>
                        <p className="text-emerald-400 font-black text-3xl mb-2">
                            {calculatedTDEE - 500} <span className="text-xs text-indigo-200/40 font-medium">kcal</span>
                        </p>
                        <p className="text-indigo-200/40 text-xs mb-6 flex-1 leading-relaxed max-w-[220px]">
                            Sağlıklı yağ yakımı için ~500 kcal kalori açığı.
                        </p>
                        <button
                            onClick={() => handleSelectPlan("Kilo Ver (Cutting)", calculatedTDEE - 500)}
                            className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 font-bold hover:bg-emerald-500 hover:border-emerald-400/50 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all text-sm">
                            Bu Planı Seç
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobil Geri Dönüş Butonu (Sadece küçük ekranlarda görünür) */}
            <div className="sm:hidden flex-none text-center pb-6">
                <button
                    onClick={() => setStep(1)}
                    className="text-indigo-200/50 hover:text-white font-bold transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                    <span>&larr;</span> Ana Sayfa
                </button>
            </div>

        </div>
    );
}