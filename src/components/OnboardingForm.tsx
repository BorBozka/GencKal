"use client";

// 1. Core / React Imports
import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from 'next/link';

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
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [errorLine, setErrorLine] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<{ name: string; calories: number } | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

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
    const handleFizikselChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let finalValue: string | number | boolean = value;

        if (type === "number" || type === "range") finalValue = Number(value);
        else if (type === "checkbox") finalValue = (e.target as HTMLInputElement).checked;

        setFormData(prev => ({
            ...prev,
            fizikselVeriler: { ...prev.fizikselVeriler, [name]: finalValue }
        }));
    }, []);

    const setFizikselAlan = useCallback(<K extends keyof KullaniciProfil["fizikselVeriler"]>(
        name: K,
        value: KullaniciProfil["fizikselVeriler"][K]
    ) => {
        setFormData(prev => ({
            ...prev,
            fizikselVeriler: { ...prev.fizikselVeriler, [name]: value }
        }));
    }, []);

    const handleProceedToDiet = useCallback(() => {
        setFormData(prev => {
            const { boy, kilo, yas } = prev.fizikselVeriler;
            if (boy < 100 || boy > 230 || kilo < 30 || kilo > 300 || yas < 15 || yas > 100) {
                setErrorLine("Lütfen fiziksel değerlerinizi kontrol edin (Boy: 100-230, Kilo: 30-300, Yaş: 15-100).");
                window.scrollTo({ top: 0, behavior: 'smooth' });
                return prev;
            }
            setErrorLine(null);
            setStep(2);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return prev;
        });
    }, []);

    const handleSelectPlan = useCallback((name: string, calories: number) => {
        setSelectedPlan({ name, calories });
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);



    // --- RENDER ---
    if (step === 3 && selectedPlan) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-white to-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden">
                <header className={`sticky top-0 z-50 flex-none py-4 px-6 md:px-12 font-medium transition-all duration-300 ${isScrolled ? 'bg-white text-slate-800 shadow-md border-b border-slate-200' : 'bg-[#3E3AAF]/95 backdrop-blur-md text-white border-b border-white/10 shadow-sm'}`}>
                    <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center">
                        <div className={`flex items-center gap-2 font-bold text-xl tracking-tight ${isScrolled ? 'text-indigo-700' : ''}`}>
                            <div className="flex items-center gap-0.5">
                                <div className={`w-1 h-3 rounded-full ${isScrolled ? 'bg-indigo-700' : 'bg-white'}`}></div>
                                <div className={`w-1 h-5 rounded-full ${isScrolled ? 'bg-indigo-700' : 'bg-white'}`}></div>
                                <div className={`w-1 h-3 rounded-full ${isScrolled ? 'bg-indigo-700' : 'bg-white'}`}></div>
                            </div>
                            <span className="text-[18px]">genckalcalculator</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-6">
                            <button
                                onClick={() => setStep(1)}
                                className={`transition-colors text-sm font-bold flex items-center gap-1 ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-indigo-200'}`}
                            >
                                <span>&larr;</span> Ana Sayfa
                            </button>
                            <Link href="/iletisim" className={`transition-colors text-sm ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-indigo-200'}`}>İletişim</Link>
                        </div>
                    </div>
                </header>
                <div className="flex-1 flex py-10 px-4 sm:px-8 max-w-[1500px] mx-auto w-full">
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
                <header className={`sticky top-0 z-50 w-full py-4 px-6 md:px-12 font-medium transition-all duration-300 ${isScrolled ? 'bg-white text-slate-800 shadow-md border-b border-slate-200' : 'bg-[#3E3AAF] text-white border-b border-white/10 shadow-sm'}`}>
                    <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center">
                        <div className={`flex items-center gap-2 font-bold text-xl tracking-tight ${isScrolled ? 'text-indigo-700' : ''}`}>
                            <div className="flex items-center gap-0.5">
                                <div className={`w-1 h-3 rounded-full ${isScrolled ? 'bg-indigo-700' : 'bg-white'}`}></div>
                                <div className={`w-1 h-5 rounded-full ${isScrolled ? 'bg-indigo-700' : 'bg-white'}`}></div>
                                <div className={`w-1 h-3 rounded-full ${isScrolled ? 'bg-indigo-700' : 'bg-white'}`}></div>
                            </div>
                            <span className="text-[18px]">genckalcalculator</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-8">
                            <button
                                onClick={handleProceedToDiet}
                                className={`transition-colors text-[13px] font-medium ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white/90 hover:text-white'}`}
                            >
                                Diyet
                            </button>
                            <Link 
                                href="/iletisim" 
                                className={`transition-colors text-[13px] font-medium ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white/90 hover:text-white'}`}
                            >
                                İletişim
                            </Link>
                        </div>
                    </div>
                </header>

                {/* --- ÜST BÖLÜM (Dashboard) --- */}
                <section className="bg-[#3E3AAF] text-white relative pb-0">
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
                            <div className="relative flex flex-col md:flex-row w-full max-w-4xl justify-center items-center md:items-center">
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
                    <div className="w-full relative z-20 -mt-4 pb-14 px-4">
                        <ReferenceScale
                            score={calculatedFFMI > 0 ? calculatedFFMI : calculatedBMI}
                            type={calculatedFFMI > 0 ? "FFMI" : "BMI"}
                            gender={formData.fizikselVeriler.cinsiyet}
                        />
                    </div>
                </section>

                {/* --- ALT BÖLÜM (Beyaz Eğitim Alanı) --- */}
                <div id="about-section" className="relative z-30 w-full bg-white pt-8 -mt-7 shadow-[0_-20px_50px_rgba(0,0,0,0.2)]">
                    <EducationalSection />
                </div>

            </div>

            {/* --- MOBİL: Sabit Alt CTA Butonu (sm ve üstünde header'da görünür, burada gizlenir) --- */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200">
                <button
                    onClick={handleProceedToDiet}
                    className="w-full py-3.5 rounded-2xl bg-[#3E3AAF] hover:bg-[#4f46a8] text-white font-bold text-sm transition-all shadow-[0_4px_20px_rgba(62,58,175,0.3)] flex items-center justify-center gap-2"
                >
                    Diyet Planı Oluştur →
                </button>
            </div>
        </div>
    ) : (
        /* --- 2. ADIM: DİYET PLANI (Premium SaaS Açık Tema) --- */
        <div className="min-h-screen w-full bg-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden">

            {/* --- STEP 2 HEADER --- */}
            <header className={`sticky top-0 z-50 flex-none py-4 px-6 md:px-12 font-medium transition-all duration-300 ${isScrolled ? 'bg-white text-slate-800 shadow-md border-b border-slate-200' : 'bg-[#3E3AAF]/95 backdrop-blur-md text-white border-b border-white/10 shadow-sm'}`}>
                <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center">
                    <div className={`flex items-center gap-2 font-bold text-xl tracking-tight ${isScrolled ? 'text-indigo-700' : ''}`}>
                        <div className="flex items-center gap-0.5">
                            <div className={`w-1 h-3 rounded-full ${isScrolled ? 'bg-indigo-700' : 'bg-white'}`}></div>
                            <div className={`w-1 h-5 rounded-full ${isScrolled ? 'bg-indigo-700' : 'bg-white'}`}></div>
                            <div className={`w-1 h-3 rounded-full ${isScrolled ? 'bg-indigo-700' : 'bg-white'}`}></div>
                        </div>
                        <span className="text-[18px]">genckalcalculator</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-6">
                        <button
                            onClick={() => setStep(1)}
                            className={`transition-colors text-sm font-bold flex items-center gap-1 ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-indigo-200'}`}
                        >
                            <span>&larr;</span> Ana Sayfa
                        </button>
                        <Link href="/iletisim" className={`transition-colors text-sm ${isScrolled ? 'text-slate-600 hover:text-indigo-600' : 'text-white hover:text-indigo-200'}`}>İletişim</Link>
                    </div>
                </div>
            </header>

            {/* --- ANA İÇERİK (Scroll Edilebilir) --- */}
            <div className="flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-8 py-10 overflow-y-auto">

                {/* Üst Alan: TDEE Hesaplama + Skor */}
                <div className="flex flex-col lg:flex-row gap-6 mb-8">

                    {/* SOL: TDEE Hesaplama Paneli */}
                    <div className="flex-1 bg-gradient-to-br from-indigo-50/80 to-white rounded-3xl p-8 border-2 border-indigo-100 shadow-md hover:shadow-hover transition-all duration-300 animate-fade-in-up">
                        <TDEECalculatorPanel
                            data={formData.fizikselVeriler}
                            handleChange={handleFizikselChange}
                            setField={setFizikselAlan}
                        />
                    </div>

                    {/* SAĞ: TDEE Skor Gösterimi */}
                    <div className="lg:w-[340px] flex-none bg-gradient-to-br from-indigo-50/80 to-white rounded-3xl p-8 border-2 border-indigo-100 shadow-md hover:shadow-hover transition-all duration-300 flex flex-col items-center justify-center text-center relative overflow-hidden animate-scale-in"
                        style={{ animationDelay: "0.15s" }}>
                        {/* Arka plan glow efekti */}
                        <div className="absolute inset-0 opacity-15"
                            style={{ background: "radial-gradient(circle at 50% 30%, rgba(79,70,229,0.25) 0%, transparent 65%)" }}
                        />
                        <div className="relative z-10">
                            <h2 className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold mb-3">Günlük Kalori İhtiyacınız (TDEE)</h2>
                            <p className="text-indigo-900 font-extrabold text-6xl md:text-7xl flex items-baseline gap-2 justify-center">
                                {calculatedTDEE} <span className="text-2xl font-medium text-slate-500">kcal</span>
                            </p>

                        </div>
                    </div>
                </div>

                {/* Alt Alan: 3'lü Plan Kartları */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">

                    {/* Kilo Al Kartı */}
                    <div className="group bg-gradient-to-br from-indigo-50/80 to-white rounded-3xl p-8 border-2 border-indigo-100 shadow-md flex flex-col items-center text-center hover:shadow-hover hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-fade-in-up"
                        style={{ animationDelay: "0.2s" }}>
                        <div className="w-14 h-14 bg-cyan-100 rounded-full flex items-center justify-center mb-5 group-hover:bg-cyan-200 transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600">
                                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                <polyline points="16 7 22 7 22 13"></polyline>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Kilo Al (Bulk)</h3>
                        <p className="text-indigo-600 font-extrabold text-3xl mb-2">
                            {calculatedTDEE + 500} <span className="text-xs text-slate-400 font-medium">kcal</span>
                        </p>

                        <button
                            onClick={() => handleSelectPlan("Kilo Al (Bulk)", calculatedTDEE + 500)}
                            className="w-full py-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 font-bold hover:bg-slate-200 transition-all duration-300 text-sm">
                            Bu Planı Seç
                        </button>
                    </div>

                    {/* Kilo Koru Kartı (Mevcut Durum) */}
                    <div className="group bg-gradient-to-br from-indigo-50/80 to-white rounded-3xl p-8 border-2 border-indigo-500 shadow-md flex flex-col items-center text-center hover:shadow-hover hover:-translate-y-1 transition-all duration-300 relative animate-fade-in-up"
                        style={{ animationDelay: "0.3s" }}>
                        <div className="absolute -top-3.5 bg-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-md z-10">
                            MEVCUT DURUM
                        </div>
                        <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-5">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Kilo Koru (Maintain)</h3>
                        <p className="text-indigo-600 font-extrabold text-3xl mb-2">
                            {calculatedTDEE} <span className="text-xs text-slate-400 font-medium">kcal</span>
                        </p>

                        <button
                            onClick={() => handleSelectPlan("Kilo Koru (Maintain)", calculatedTDEE)}
                            className="w-full py-3.5 rounded-2xl bg-indigo-600 border border-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 text-sm">
                            Bu Planı Seç
                        </button>
                    </div>

                    {/* Kilo Ver Kartı */}
                    <div className="group bg-gradient-to-br from-indigo-50/80 to-white rounded-3xl p-8 border-2 border-indigo-100 shadow-md flex flex-col items-center text-center hover:shadow-hover hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-fade-in-up"
                        style={{ animationDelay: "0.4s" }}>
                        <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mb-5 group-hover:bg-amber-200 transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                                <polyline points="16 17 22 17 22 11"></polyline>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Kilo Ver (Cut)</h3>
                        <p className="text-indigo-600 font-extrabold text-3xl mb-2">
                            {calculatedTDEE - 500} <span className="text-xs text-slate-400 font-medium">kcal</span>
                        </p>

                        <button
                            onClick={() => handleSelectPlan("Kilo Ver (Cutting)", calculatedTDEE - 500)}
                            className="w-full py-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-700 font-bold hover:bg-slate-200 transition-all duration-300 text-sm">
                            Bu Planı Seç
                        </button>
                    </div>

                </div>
            </div>

            {/* Mobil Geri Dönüş Butonu (Sadece küçük ekranlarda görünür) */}
            <div className="sm:hidden flex-none text-center pb-6">
                <button
                    onClick={() => setStep(1)}
                    className="text-slate-400 hover:text-slate-700 font-bold transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                    <span>&larr;</span> Ana Sayfa
                </button>
            </div>

        </div>
    );
}