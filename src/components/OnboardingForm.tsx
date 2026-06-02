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
import AuthNavButton from "./AuthNavButton";

export default function OnboardingForm() {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [errorLine, setErrorLine] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<{ name: string; calories: number } | null>(null);
    const [activePlan, setActivePlan] = useState<"bulk" | "maintain" | "cut">("maintain");
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
    const isDietInputValid = boy >= 100 && boy <= 230 && kilo >= 30 && kilo <= 300 && yas >= 15 && yas <= 100 && calculatedTDEE > 0;

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
        if (boy < 100 || boy > 230 || kilo < 30 || kilo > 300 || yas < 15 || yas > 100) {
            setErrorLine("Lütfen fiziksel değerlerinizi kontrol edin (Boy: 100-230, Kilo: 30-300, Yaş: 15-100).");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setErrorLine(null);
        setStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [boy, kilo, yas]);

    const handleSelectPlan = useCallback((name: string, calories: number) => {
        if (!isDietInputValid || calories < 800 || calories > 6000) {
            setErrorLine("Lütfen geçerli fiziksel değerlerle 800-6000 kcal aralığında bir plan seçin.");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setErrorLine(null);
        setSelectedPlan({ name, calories });
        setStep(3);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [isDietInputValid]);

    const bulkCalories = calculatedTDEE + 500;
    const maintainCalories = calculatedTDEE;
    const cutCalories = calculatedTDEE - 500;
    const activePlanCalories = activePlan === "bulk" ? bulkCalories : activePlan === "cut" ? cutCalories : maintainCalories;
    const macroRows = [
        {
            label: "Protein",
            percent: 30,
            grams: Math.round((activePlanCalories * 0.3) / 4),
            barClass: "bg-rose-500",
        },
        {
            label: "Karbonhidrat",
            percent: 40,
            grams: Math.round((activePlanCalories * 0.4) / 4),
            barClass: "bg-blue-500",
        },
        {
            label: "Yağ",
            percent: 30,
            grams: Math.round((activePlanCalories * 0.3) / 9),
            barClass: "bg-amber-500",
        },
    ];
    const canSelectBulk = isDietInputValid && bulkCalories >= 800 && bulkCalories <= 6000;
    const canSelectMaintain = isDietInputValid && maintainCalories >= 800 && maintainCalories <= 6000;
    const canSelectCut = isDietInputValid && cutCalories >= 800 && cutCalories <= 6000;



    // --- RENDER ---
    if (step === 3 && selectedPlan) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-white to-slate-50 flex flex-col font-sans text-slate-900 overflow-x-hidden">
                <header className="sticky top-0 z-50 flex-none py-4 px-6 md:px-12 font-medium bg-[#3E3AAF] text-white border-b border-white/10 shadow-sm">
                    <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center">
                        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
                            <div className="flex items-center gap-0.5">
                                <div className="w-1 h-3 rounded-full bg-white"></div>
                                <div className="w-1 h-5 rounded-full bg-white"></div>
                                <div className="w-1 h-3 rounded-full bg-white"></div>
                            </div>
                            <span className="text-[18px]">GencKalculator</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-8">
                            <AuthNavButton />
                            <button
                                onClick={() => setStep(1)}
                                className="flex cursor-pointer items-center gap-1 text-base font-normal leading-none text-white transition-colors hover:text-indigo-100"
                            >
                                Ana Sayfa
                            </button>
                            <Link href="/iletisim" className="text-base font-normal leading-none text-white transition-colors hover:text-indigo-100">İletişim</Link>
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
                            <span className="text-[18px]">GencKalculator</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-8">
                            <AuthNavButton isScrolled={isScrolled} />
                            <button
                                onClick={handleProceedToDiet}
                                className={`cursor-pointer text-base font-normal leading-none transition-colors ${isScrolled ? 'text-slate-700 hover:text-indigo-600' : 'text-white hover:text-indigo-100'}`}
                            >
                                Diyet
                            </button>
                            <Link
                                href="/iletisim"
                                className={`text-base font-normal leading-none transition-colors ${isScrolled ? 'text-slate-700 hover:text-indigo-600' : 'text-white hover:text-indigo-100'}`}
                            >
                                İletişim
                            </Link>
                        </div>
                    </div>
                </header>

                {/* --- ÜST BÖLÜM (Dashboard) --- */}
                <section className="bg-[#3E3AAF] text-white relative pb-0">
                    <div className="w-full mx-auto z-10 flex flex-col items-center mt-6 md:mt-10 px-4">
                        <div className="text-center mb-4">
                            <h1 className="text-[32px] sm:text-[38px] font-normal tracking-wide text-white drop-shadow-sm mb-1 font-sans">
                                GencKalculator
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

                        <div className="relative flex flex-col lg:flex-row justify-center items-center lg:items-center gap-6 lg:gap-0 mt-2 w-full mb-4 max-w-[1400px] mx-auto">
                            <div className="z-20 w-full lg:w-auto flex justify-center lg:justify-end">
                                <ResultsPanel
                                    calculatedBMI={calculatedBMI}
                                    leanMass={leanMass}
                                    bodyFat={yagOrani || 0}
                                    kilo={kilo}
                                    ffmi={rawFFMI}
                                    normalizedFfmi={calculatedFFMI}
                                />
                            </div>
                            <div className="z-10 w-full lg:w-auto lg:-ml-12 mt-0 flex flex-col xl:flex-row items-center justify-center xl:justify-start gap-6">
                                <div className="w-full lg:w-auto flex justify-center lg:justify-start">
                                    <InputPanel
                                        data={formData.fizikselVeriler}
                                        handleChange={handleFizikselChange}
                                        setField={setFizikselAlan}
                                    />
                                </div>
                                {kilo > 0 && yagOrani >= 0 && (
                                    <div className="z-20 w-full xl:w-auto flex justify-center">
                                        <TargetSimulator
                                            currentWeight={kilo}
                                            leanMass={leanMass}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Referans Skalası */}
                    <div className="w-full relative z-20 -mt-4 pb-14 px-4">
                        <ReferenceScale
                            score={yagOrani >= 0 ? calculatedFFMI : calculatedBMI}
                            type={yagOrani >= 0 ? "FFMI" : "BMI"}
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
            <header className="sticky top-0 z-50 flex-none py-4 px-6 md:px-12 font-medium bg-[#3E3AAF] text-white border-b border-white/10 shadow-sm">
                <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
                        <div className="flex items-center gap-0.5">
                            <div className="w-1 h-3 rounded-full bg-white"></div>
                            <div className="w-1 h-5 rounded-full bg-white"></div>
                            <div className="w-1 h-3 rounded-full bg-white"></div>
                        </div>
                        <span className="text-[18px]">GencKalculator</span>
                    </div>
                    <div className="hidden sm:flex items-center gap-8">
                        <AuthNavButton />
                        <button
                            onClick={() => setStep(1)}
                            className="flex cursor-pointer items-center gap-1 text-base font-normal leading-none text-white transition-colors hover:text-indigo-100"
                        >
                            Ana Sayfa
                        </button>
                        <Link href="/iletisim" className="text-base font-normal leading-none text-white transition-colors hover:text-indigo-100">İletişim</Link>
                    </div>
                </div>
            </header>

            {/* --- ANA İÇERİK --- */}
            <div className="flex-1 w-full max-w-[1500px] mx-auto px-4 sm:px-8 pt-4 pb-8">
                {errorLine && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-center text-sm font-bold">
                        {errorLine}
                    </div>
                )}
                {!isDietInputValid && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl text-center text-sm font-bold">
                        Plan seçebilmek için boy, kilo ve yaş değerlerini geçerli aralıkta tutun.
                    </div>
                )}

                <div className="mb-4">
                    <h2 className="text-base font-extrabold text-slate-950">TDEE Verileri</h2>
                    <p className="mt-1 text-sm font-medium text-slate-500">Profil değerlerinizi güncelleyerek kalori ve makro dağılımını anlık takip edin.</p>
                </div>

                {/* Üst Alan: TDEE Hesaplama + Skor */}
                <div className="flex flex-col xl:flex-row xl:items-stretch gap-5 mb-5">

                    {/* SOL: TDEE Hesaplama Paneli */}
                    <div className="flex flex-1 items-center bg-white rounded-3xl p-7 border border-slate-200 shadow-sm transition-all duration-300 animate-fade-in-up">
                        <TDEECalculatorPanel
                            data={formData.fizikselVeriler}
                            handleChange={handleFizikselChange}
                            setField={setFizikselAlan}
                        />
                    </div>

                    {/* SAĞ: TDEE Skor Gösterimi */}
                    <div className="xl:w-[360px] 2xl:w-[380px] flex-none bg-white rounded-3xl p-6 2xl:p-7 border border-slate-200 shadow-sm transition-all duration-300 flex flex-col justify-between text-center relative overflow-hidden animate-scale-in"
                        style={{ animationDelay: "0.15s" }}>
                        {/* Arka plan glow efekti */}
                        <div className="absolute inset-0 opacity-15"
                            style={{ background: "radial-gradient(circle at 50% 30%, rgba(79,70,229,0.25) 0%, transparent 65%)" }}
                        />
                        <div className="relative z-10">
                            <h2 className="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold mb-3">Günlük Kalori İhtiyacınız (TDEE)</h2>
                            <p className="text-indigo-900 font-extrabold text-5xl flex items-baseline gap-2 justify-center">
                                {calculatedTDEE} <span className="text-xl font-medium text-slate-500">kcal</span>
                            </p>
                        </div>
                        <div className="relative z-10 mt-5 w-full rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-left">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Günlük Makro Dağılımı</p>
                                <p className="text-xs font-bold text-slate-700">{activePlanCalories} kcal</p>
                            </div>
                            <div className="space-y-2">
                                {macroRows.map((macro) => (
                                    <div
                                        key={macro.label}
                                        className="group rounded-xl p-1.5 transition-colors duration-200 hover:bg-slate-50"
                                    >
                                        <div className="mb-1.5 flex items-center justify-between gap-3">
                                            <span className="text-sm font-bold text-slate-800">{macro.label}: {macro.grams}g</span>
                                            <span className="text-xs font-semibold text-slate-500">{macro.percent}%</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-slate-100">
                                            <div
                                                className={`h-full origin-left rounded-full transition-all duration-200 group-hover:scale-y-125 group-hover:brightness-110 ${macro.barClass}`}
                                                style={{ width: `${macro.percent}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alt Alan: 3'lü Plan Kartları */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pb-0">

                    {/* Kilo Al Kartı */}
                    <div
                        role="button"
                        tabIndex={canSelectBulk ? 0 : -1}
                        aria-disabled={!canSelectBulk}
                        onClick={() => {
                            if (canSelectBulk) setActivePlan("bulk");
                        }}
                        onKeyDown={(e) => {
                            if ((e.key === "Enter" || e.key === " ") && canSelectBulk) setActivePlan("bulk");
                        }}
                        className={`group h-full min-h-[250px] bg-white rounded-3xl px-6 py-7 border-2 shadow-sm flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ease-in-out animate-fade-in-up relative ${activePlan === "bulk" ? "border-blue-500 shadow-blue-200/70" : "border-slate-200 hover:border-blue-300"} ${canSelectBulk ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                        style={{ animationDelay: "0.2s" }}>
                        {activePlan === "bulk" && (
                            <div className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-md shadow-blue-200">
                                MEVCUT DURUM
                            </div>
                        )}
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-5 group-hover:bg-blue-200 transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                <polyline points="16 7 22 7 22 13"></polyline>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Kilo Al (Bulk)</h3>
                        <p className="text-indigo-600 font-extrabold text-3xl mb-8">
                            {bulkCalories} <span className="text-xs text-slate-400 font-medium">kcal</span>
                        </p>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelectPlan("Kilo Al (Bulk)", bulkCalories);
                            }}
                            disabled={!canSelectBulk}
                            className={`mt-auto w-full py-2.5 rounded-2xl border font-bold transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${activePlan === "bulk"
                                ? "border-blue-500 bg-blue-500 text-white shadow-[0_0_24px_rgba(59,130,246,0.35)] hover:bg-blue-600 hover:shadow-[0_0_34px_rgba(59,130,246,0.45)] disabled:hover:bg-blue-500"
                                : "border-blue-500 bg-white text-blue-500 hover:bg-blue-500 hover:text-white hover:shadow-lg disabled:hover:bg-white disabled:hover:text-blue-500"
                                }`}>
                            Bu Planı Seç
                        </button>
                    </div>

                    {/* Kilo Koru Kartı (Mevcut Durum) */}
                    <div
                        role="button"
                        tabIndex={canSelectMaintain ? 0 : -1}
                        aria-disabled={!canSelectMaintain}
                        onClick={() => {
                            if (canSelectMaintain) setActivePlan("maintain");
                        }}
                        onKeyDown={(e) => {
                            if ((e.key === "Enter" || e.key === " ") && canSelectMaintain) setActivePlan("maintain");
                        }}
                        className={`group h-full min-h-[250px] bg-white rounded-3xl px-6 py-7 border-2 shadow-sm flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ease-in-out relative animate-fade-in-up ${activePlan === "maintain" ? "border-indigo-600 shadow-indigo-200/60" : "border-slate-200 hover:border-indigo-300"} ${canSelectMaintain ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                        style={{ animationDelay: "0.3s" }}>
                        {activePlan === "maintain" && (
                            <div className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-md">
                                MEVCUT DURUM
                            </div>
                        )}
                        <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-5">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Kilo Koru (Maintain)</h3>
                        <p className="text-indigo-600 font-extrabold text-3xl mb-8">
                            {maintainCalories} <span className="text-xs text-slate-400 font-medium">kcal</span>
                        </p>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelectPlan("Kilo Koru (Maintain)", maintainCalories);
                            }}
                            disabled={!canSelectMaintain}
                            className={`mt-auto w-full py-2.5 rounded-2xl border font-bold transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${activePlan === "maintain"
                                ? "border-indigo-600 bg-indigo-600 text-white shadow-[0_0_24px_rgba(79,70,229,0.35)] hover:bg-indigo-700 hover:shadow-[0_0_34px_rgba(79,70,229,0.45)] disabled:hover:bg-indigo-600"
                                : "border-indigo-500 bg-white text-indigo-700 hover:bg-indigo-600 hover:text-white hover:shadow-lg disabled:hover:bg-white disabled:hover:text-indigo-700"
                                }`}>
                            Bu Planı Seç
                        </button>
                    </div>

                    {/* Kilo Ver Kartı */}
                    <div
                        role="button"
                        tabIndex={canSelectCut ? 0 : -1}
                        aria-disabled={!canSelectCut}
                        onClick={() => {
                            if (canSelectCut) setActivePlan("cut");
                        }}
                        onKeyDown={(e) => {
                            if ((e.key === "Enter" || e.key === " ") && canSelectCut) setActivePlan("cut");
                        }}
                        className={`group h-full min-h-[250px] bg-white rounded-3xl px-6 py-7 border-2 shadow-sm flex flex-col items-center text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300 ease-in-out animate-fade-in-up relative ${activePlan === "cut" ? "border-rose-500 shadow-rose-200/70" : "border-slate-200 hover:border-rose-300"} ${canSelectCut ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                        style={{ animationDelay: "0.4s" }}>
                        {activePlan === "cut" && (
                            <div className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 bg-rose-500 text-white text-[10px] font-bold px-4 py-1.5 rounded-full shadow-md shadow-rose-200">
                                MEVCUT DURUM
                            </div>
                        )}
                        <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mb-5 group-hover:bg-rose-200 transition-colors">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-rose-600">
                                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                                <polyline points="16 17 22 17 22 11"></polyline>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Kilo Ver (Cut)</h3>
                        <p className="text-indigo-600 font-extrabold text-3xl mb-8">
                            {cutCalories} <span className="text-xs text-slate-400 font-medium">kcal</span>
                        </p>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleSelectPlan("Kilo Ver (Cutting)", cutCalories);
                            }}
                            disabled={!canSelectCut}
                            className={`mt-auto w-full py-2.5 rounded-2xl border font-bold transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed ${activePlan === "cut"
                                ? "border-rose-500 bg-rose-500 text-white shadow-[0_0_24px_rgba(244,63,94,0.35)] hover:bg-rose-600 hover:shadow-[0_0_34px_rgba(244,63,94,0.45)] disabled:hover:bg-rose-500"
                                : "border-rose-500 bg-white text-rose-500 hover:bg-rose-500 hover:text-white hover:shadow-lg disabled:hover:bg-white disabled:hover:text-rose-500"
                                }`}>
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
