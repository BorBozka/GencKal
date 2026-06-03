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
    const dietPlanOptions = [
        {
            id: "bulk" as const,
            title: "Kilo Al",
            subtitle: "Bulk",
            calories: bulkCalories,
            canSelect: canSelectBulk,
            selectedLabel: "Seçili Hedef",
            accentClass: "text-blue-700",
            iconClass: "bg-blue-50 text-blue-700 border-blue-100",
            activeClass: "border-blue-300 bg-blue-50/60 shadow-blue-100",
            hoverClass: "hover:border-blue-200",
        },
        {
            id: "maintain" as const,
            title: "Kilo Koru",
            subtitle: "Maintain",
            calories: maintainCalories,
            canSelect: canSelectMaintain,
            selectedLabel: "Mevcut Durum",
            accentClass: "text-emerald-700",
            iconClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
            activeClass: "border-emerald-300 bg-emerald-50/60 shadow-emerald-100",
            hoverClass: "hover:border-emerald-200",
        },
        {
            id: "cut" as const,
            title: "Kilo Ver",
            subtitle: "Cut",
            calories: cutCalories,
            canSelect: canSelectCut,
            selectedLabel: "Seçili Hedef",
            accentClass: "text-rose-700",
            iconClass: "bg-rose-50 text-rose-700 border-rose-100",
            activeClass: "border-rose-300 bg-rose-50/60 shadow-rose-100",
            hoverClass: "hover:border-rose-200",
        },
    ];



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
                            <button
                                onClick={() => setStep(1)}
                                className="flex cursor-pointer items-center gap-1 text-base font-normal leading-none text-white transition-colors hover:text-indigo-100"
                            >
                                Ana Sayfa
                            </button>
                            <AuthNavButton />
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
                    <div className="w-full relative z-20 -mt-4 pb-12 px-4">
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
        /* --- 2. ADIM: DİYET PLANI (Açık ve veri odaklı akış) --- */
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
                        <button
                            onClick={() => setStep(1)}
                            className="flex cursor-pointer items-center gap-1 text-base font-normal leading-none text-white transition-colors hover:text-indigo-100"
                        >
                            Ana Sayfa
                        </button>
                        <AuthNavButton />
                        <Link href="/iletisim" className="text-base font-normal leading-none text-white transition-colors hover:text-indigo-100">İletişim</Link>
                    </div>
                </div>
            </header>

            {/* --- ANA İÇERİK --- */}
            <div className="flex-1 w-full max-w-[1320px] mx-auto px-4 sm:px-8 pt-6 pb-8">
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

                <div className="mb-5">
                    <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-600">Diyet planı</p>
                        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">Kalori hedefinizi belirleyin</h2>
                        <p className="mt-1 text-sm font-medium leading-6 text-slate-500">
                            Profil değerlerinizi güncelleyerek TDEE değerini, makro dağılımını ve plan hedefini aynı ekranda takip edin.
                        </p>
                    </div>
                </div>

                {/* Üst Alan: TDEE Hesaplama + Skor */}
                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_430px] 2xl:grid-cols-[minmax(0,1fr)_460px]">

                    {/* SOL: TDEE Hesaplama Paneli */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm animate-fade-in-up sm:p-5">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div>
                                <h3 className="text-sm font-extrabold text-slate-950">Profil Verileri</h3>
                                <p className="mt-1 text-xs font-medium text-slate-500">Boy, kilo, yaş ve aktivite bilgileri</p>
                            </div>
                            <div className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                                Anlık hesaplama
                            </div>
                        </div>
                        <TDEECalculatorPanel
                            data={formData.fizikselVeriler}
                            handleChange={handleFizikselChange}
                            setField={setFizikselAlan}
                        />
                    </div>

                    {/* SAĞ: TDEE Skor Gösterimi */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 flex flex-col text-center relative overflow-hidden animate-scale-in sm:p-5"
                        style={{ animationDelay: "0.15s" }}>
                        <div>
                            <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold">Günlük kalori ihtiyacı</p>
                            <p className="mt-2 flex items-baseline justify-center gap-2 text-4xl font-black tracking-tight text-indigo-950">
                                {calculatedTDEE} <span className="text-lg font-semibold text-slate-500">kcal</span>
                            </p>
                        </div>
                        <div className="mt-4 w-full rounded-2xl border border-slate-100 bg-slate-50/70 p-4 text-left">
                            <div className="mb-3 flex items-center justify-between">
                                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">Günlük Makro Dağılımı</p>
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
                <div className="mt-5 grid grid-cols-1 gap-4 pb-0 lg:grid-cols-3">
                    {dietPlanOptions.map((plan, index) => {
                        const isActive = activePlan === plan.id;
                        const planName = `${plan.title} (${plan.subtitle})`;
                        return (
                            <div
                                key={plan.id}
                                role="button"
                                tabIndex={plan.canSelect ? 0 : -1}
                                aria-disabled={!plan.canSelect}
                                onClick={() => {
                                    if (plan.canSelect) setActivePlan(plan.id);
                                }}
                                onKeyDown={(e) => {
                                    if ((e.key === "Enter" || e.key === " ") && plan.canSelect) setActivePlan(plan.id);
                                }}
                                className={`group flex min-h-[320px] flex-col rounded-3xl border bg-white p-7 shadow-sm transition-all duration-300 animate-fade-in-up ${isActive ? plan.activeClass : `border-slate-200 ${plan.hoverClass} hover:shadow-md`} ${plan.canSelect ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
                                style={{ animationDelay: `${0.12 + index * 0.08}s` }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${plan.iconClass}`}>
                                        {plan.id === "bulk" ? (
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                                                <polyline points="16 7 22 7 22 13"></polyline>
                                            </svg>
                                        ) : plan.id === "cut" ? (
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"></polyline>
                                                <polyline points="16 17 22 17 22 11"></polyline>
                                            </svg>
                                        ) : (
                                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="8"></circle>
                                                <path d="M12 8v4l3 2"></path>
                                            </svg>
                                        )}
                                    </div>
                                    {isActive && (
                                        <span className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 shadow-sm ring-1 ring-slate-200">
                                            {plan.selectedLabel}
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col items-center justify-center pt-2 pb-8 text-center">
                                    <p className="-mt-14 text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">{plan.subtitle}</p>
                                    <h3 className="mt-2 text-2xl font-extrabold text-slate-950">{plan.title}</h3>
                                    <p className={`mt-9 text-5xl font-black tracking-tight ${plan.accentClass}`}>
                                        {plan.calories} <span className="text-base font-semibold text-slate-500">kcal</span>
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setActivePlan(plan.id);
                                        handleSelectPlan(planName, plan.calories);
                                    }}
                                    disabled={!plan.canSelect}
                                    className={`h-12 w-full cursor-pointer rounded-2xl border text-sm font-extrabold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${isActive
                                        ? "border-[#3E3AAF] bg-[#3E3AAF] text-white shadow-[0_8px_20px_rgba(62,58,175,0.18)] hover:bg-indigo-700"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                                        }`}
                                >
                                    Bu Planı Seç
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobil Geri Dönüş Butonu (Sadece küçük ekranlarda görünür) */}
            <div className="sm:hidden flex-none text-center pb-6">
                <button
                    onClick={() => setStep(1)}
                    className="text-slate-600 hover:text-slate-800 font-bold transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                    <span>&larr;</span> Ana Sayfa
                </button>
            </div>

        </div>
    );
}
