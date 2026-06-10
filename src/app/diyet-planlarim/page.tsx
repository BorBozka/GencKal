"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Flame, Trash2, Utensils } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";
import type { SavedDietPlan, SavedDietPlanSummary } from "../../types";

function formatDate(value: string): string {
    return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(value));
}

async function parseApiError(response: Response): Promise<string> {
    const data = await response.json().catch(() => null);
    return data?.error || `Sunucu hatası (${response.status})`;
}

export default function SavedDietPlansPage() {
    const { user, token, isLoading, authHeaders } = useAuth();
    const { toast } = useToast();
    const [plans, setPlans] = useState<SavedDietPlanSummary[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<SavedDietPlan | null>(null);
    const [isFetching, setIsFetching] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadPlans = useCallback(async () => {
        if (!token) return;
        setIsFetching(true);
        try {
            const response = await fetch("/api/diet-plans", { headers: authHeaders() });
            if (!response.ok) throw new Error(await parseApiError(response));
            const data = await response.json() as { plans: SavedDietPlanSummary[] };
            setPlans(data.plans);
        } catch (error) {
            toast("error", "Planlar yüklenemedi", error instanceof Error ? error.message : "Liste alınamadı.");
        } finally {
            setIsFetching(false);
        }
    }, [token, authHeaders, toast]);

    const loadPlanDetail = useCallback(async (id: string) => {
        if (!token) return;
        try {
            const response = await fetch(`/api/diet-plans/${id}`, { headers: authHeaders() });
            if (!response.ok) throw new Error(await parseApiError(response));
            const data = await response.json() as { plan: SavedDietPlan };
            setSelectedPlan(data.plan);
        } catch (error) {
            toast("error", "Plan detayı açılamadı", error instanceof Error ? error.message : "Detay alınamadı.");
        }
    }, [token, authHeaders, toast]);

    const deleteSelectedPlan = async () => {
        if (!selectedPlan || !token || !window.confirm("Bu diyet planı silinsin mi?")) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/diet-plans/${selectedPlan.id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            if (!response.ok) throw new Error(await parseApiError(response));
            setPlans((current) => current.filter((plan) => plan.id !== selectedPlan.id));
            setSelectedPlan(null);
            toast("success", "Plan silindi");
        } catch (error) {
            toast("error", "Plan silinemedi", error instanceof Error ? error.message : "Silme işlemi tamamlanamadı.");
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        if (!isLoading && token) {
            Promise.resolve().then(loadPlans);
        }
    }, [isLoading, token, loadPlans]);

    useEffect(() => {
        if (!isFetching && !selectedPlan && plans.length > 0) {
            Promise.resolve().then(() => loadPlanDetail(plans[0].id));
        }
    }, [isFetching, selectedPlan, plans, loadPlanDetail]);

    if (!isLoading && !user) {
        return (
            <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
                <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
                    <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-indigo-700">
                        <ArrowLeft className="h-4 w-4" />
                        Ana Sayfa
                    </Link>
                    <section className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                        <h1 className="text-2xl font-extrabold text-slate-950">Giriş yapmanız gerekmektedir</h1>
                        <p className="mt-3 text-sm leading-6 text-slate-500">
                            Kayıtlı diyet planlarınızı görmek için hesabınıza giriş yapın.
                        </p>
                        <Link href="/giris?returnTo=%2Fdiyet-planlarim" className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-[#3E3AAF] px-6 text-sm font-bold text-white transition-colors hover:bg-indigo-700">
                            Giriş Yap
                        </Link>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                    <div>
                        <Link href="/" className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-indigo-700">
                            <ArrowLeft className="h-4 w-4" />
                            Ana Sayfa
                        </Link>
                        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-indigo-600">Kayıtlı planlar</p>
                        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">Diyet Planlarım</h1>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
                    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Liste</p>
                                <h2 className="mt-1 text-lg font-extrabold text-slate-950">Planlar</h2>
                            </div>
                            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-extrabold text-indigo-700 ring-1 ring-indigo-100">
                                {plans.length}
                            </span>
                        </div>
                        {isFetching ? (
                            <p className="p-4 text-sm font-semibold text-slate-500">Planlar yükleniyor...</p>
                        ) : plans.length === 0 ? (
                            <p className="p-4 text-sm leading-6 text-slate-500">Henüz kaydedilmiş diyet planınız yok.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {plans.map((plan) => {
                                    const isSelectedPlan = selectedPlan?.id === plan.id;

                                    return (
                                        <button
                                            key={plan.id}
                                            type="button"
                                            onClick={() => loadPlanDetail(plan.id)}
                                            aria-pressed={isSelectedPlan}
                                            className={`cursor-pointer rounded-2xl border p-4 text-left transition-colors ${isSelectedPlan ? "border-[#3E3AAF] bg-[#3E3AAF] text-white shadow-[0_8px_18px_rgba(62,58,175,0.22)] ring-2 ring-[#3E3AAF]/20" : "border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50"}`}
                                        >
                                            <p className={`text-sm font-extrabold ${isSelectedPlan ? "text-white" : "text-slate-900"}`}>{plan.title}</p>
                                            <div className={`mt-3 flex flex-wrap gap-2 text-xs font-bold ${isSelectedPlan ? "text-white/90" : "text-slate-500"}`}>
                                                <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 ${isSelectedPlan ? "bg-white/15" : "bg-slate-100"}`}>
                                                    <Flame className="h-3.5 w-3.5" />
                                                    {plan.targetCalories} kcal
                                                </span>
                                                <span className={`rounded-lg px-2 py-1 ${isSelectedPlan ? "bg-white/15" : "bg-slate-100"}`}>{plan.mealsPerDay} öğün</span>
                                            </div>
                                            <p className={`mt-3 inline-flex items-center gap-1 text-[11px] font-semibold ${isSelectedPlan ? "text-white/80" : "text-slate-600"}`}>
                                                <CalendarDays className="h-3.5 w-3.5" />
                                                {formatDate(plan.createdAt)}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <section className={`self-start rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 ${selectedPlan ? "min-h-[520px]" : "min-h-[calc(100vh-300px)]"}`}>
                        {!selectedPlan ? (
                            <div className="flex min-h-[calc(100vh-348px)] flex-col items-center justify-center text-center">
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 ring-1 ring-indigo-100">
                                    <Utensils className="h-8 w-8 text-indigo-300" />
                                </div>
                                <p className="mt-4 text-sm font-bold text-slate-500">Detay görmek için bir plan seçin.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                                    <div>
                                        <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-indigo-600">{selectedPlan.dietType}</p>
                                        <h2 className="mt-2 text-2xl font-extrabold text-slate-950">{selectedPlan.title}</h2>
                                        <p className="mt-2 text-sm text-slate-500">{formatDate(selectedPlan.createdAt)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={deleteSelectedPlan}
                                        disabled={isDeleting}
                                        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-wait disabled:opacity-70"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Sil
                                    </button>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                                    <div className="flex flex-col justify-center">
                                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Günlük hedef</p>
                                        <p className="mt-2 flex items-baseline gap-2 text-4xl font-black tracking-tight text-slate-950">
                                            {selectedPlan.targetCalories}
                                            <span className="text-sm font-semibold text-slate-500">kcal</span>
                                        </p>
                                    </div>
                                    <div className="rounded-2xl bg-rose-50 p-3 text-center">
                                        <p className="text-lg font-extrabold text-rose-600">{selectedPlan.macros.protein}g</p>
                                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Protein</p>
                                    </div>
                                    <div className="rounded-2xl bg-amber-50 p-3 text-center">
                                        <p className="text-lg font-extrabold text-amber-600">{selectedPlan.macros.fat}g</p>
                                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Yağ</p>
                                    </div>
                                    <div className="rounded-2xl bg-blue-50 p-3 text-center">
                                        <p className="text-lg font-extrabold text-blue-600">{selectedPlan.macros.carb}g</p>
                                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">Karb</p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
                                    {selectedPlan.meals.map((meal, mealIndex) => (
                                        <div key={`${meal.title}-${mealIndex}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                                            <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50">
                                                        <Utensils className="h-5 w-5 text-[#3E3AAF]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Öğün</p>
                                                        <h3 className="text-base font-extrabold text-slate-950">{meal.title}</h3>
                                                    </div>
                                                </div>
                                                <span className="rounded-full bg-slate-50 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-slate-600 ring-1 ring-slate-100">
                                                    {meal.items.reduce((sum, item) => sum + item.cal, 0)} kcal
                                                </span>
                                            </div>
                                            <div className="divide-y divide-slate-100">
                                                {meal.items.map((item, itemIndex) => (
                                                    <div key={`${item.name}-${itemIndex}`} className="rounded-2xl px-3 py-4 transition-colors hover:bg-slate-50">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <p className="text-sm font-semibold leading-6 text-slate-700">{item.fullText}</p>
                                                            <span className="shrink-0 text-xs font-bold text-slate-500">{item.cal} kcal</span>
                                                        </div>
                                                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                                                            <span className="rounded-md bg-rose-50 px-2 py-0.5 text-rose-700">P {item.macros.protein}g</span>
                                                            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-amber-700">Y {item.macros.fat}g</span>
                                                            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-blue-700">K {item.macros.carb}g</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </main>
    );
}
