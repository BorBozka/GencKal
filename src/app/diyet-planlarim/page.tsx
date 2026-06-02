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

    const loadPlanDetail = async (id: string) => {
        if (!token) return;
        try {
            const response = await fetch(`/api/diet-plans/${id}`, { headers: authHeaders() });
            if (!response.ok) throw new Error(await parseApiError(response));
            const data = await response.json() as { plan: SavedDietPlan };
            setSelectedPlan(data.plan);
        } catch (error) {
            toast("error", "Plan detayı açılamadı", error instanceof Error ? error.message : "Detay alınamadı.");
        }
    };

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
                        <Link href="/giris" className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-[#3E3AAF] px-6 text-sm font-bold text-white transition-colors hover:bg-indigo-700">
                            Giriş Yap
                        </Link>
                    </section>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-indigo-700">
                            <ArrowLeft className="h-4 w-4" />
                            Ana Sayfa
                        </Link>
                        <h1 className="mt-4 text-3xl font-extrabold text-slate-950">Diyet Planlarım</h1>
                        <p className="mt-1 text-sm text-slate-500">{user?.name} için kaydedilen planlar</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
                    <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                        {isFetching ? (
                            <p className="p-4 text-sm font-semibold text-slate-500">Planlar yükleniyor...</p>
                        ) : plans.length === 0 ? (
                            <p className="p-4 text-sm leading-6 text-slate-500">Henüz kaydedilmiş diyet planınız yok.</p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {plans.map((plan) => (
                                    <button
                                        key={plan.id}
                                        type="button"
                                        onClick={() => loadPlanDetail(plan.id)}
                                        className={`rounded-2xl border p-4 text-left transition-colors ${selectedPlan?.id === plan.id ? "border-indigo-300 bg-indigo-50" : "border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50"}`}
                                    >
                                        <p className="text-sm font-extrabold text-slate-900">{plan.title}</p>
                                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-500">
                                            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1">
                                                <Flame className="h-3.5 w-3.5" />
                                                {plan.targetCalories} kcal
                                            </span>
                                            <span className="rounded-lg bg-slate-100 px-2 py-1">{plan.mealsPerDay} öğün</span>
                                        </div>
                                        <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            {formatDate(plan.createdAt)}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="min-h-[360px] rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                        {!selectedPlan ? (
                            <div className="flex h-full min-h-[280px] flex-col items-center justify-center text-center">
                                <Utensils className="h-10 w-10 text-indigo-200" />
                                <p className="mt-4 text-sm font-bold text-slate-500">Detay görmek için bir plan seçin.</p>
                            </div>
                        ) : (
                            <div>
                                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">{selectedPlan.dietType}</p>
                                        <h2 className="mt-2 text-2xl font-extrabold text-slate-950">{selectedPlan.title}</h2>
                                        <p className="mt-2 text-sm text-slate-500">{formatDate(selectedPlan.createdAt)}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={deleteSelectedPlan}
                                        disabled={isDeleting}
                                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 text-sm font-bold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-wait disabled:opacity-70"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Sil
                                    </button>
                                </div>

                                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <div className="rounded-2xl bg-slate-50 p-4">
                                        <p className="text-xs font-bold text-slate-600">Kalori</p>
                                        <p className="mt-1 text-lg font-extrabold text-slate-900">{selectedPlan.targetCalories}</p>
                                    </div>
                                    <div className="rounded-2xl bg-rose-50 p-4">
                                        <p className="text-xs font-bold text-rose-400">Protein</p>
                                        <p className="mt-1 text-lg font-extrabold text-rose-700">{selectedPlan.macros.protein}g</p>
                                    </div>
                                    <div className="rounded-2xl bg-amber-50 p-4">
                                        <p className="text-xs font-bold text-amber-500">Yağ</p>
                                        <p className="mt-1 text-lg font-extrabold text-amber-700">{selectedPlan.macros.fat}g</p>
                                    </div>
                                    <div className="rounded-2xl bg-blue-50 p-4">
                                        <p className="text-xs font-bold text-blue-400">Karb</p>
                                        <p className="mt-1 text-lg font-extrabold text-blue-700">{selectedPlan.macros.carb}g</p>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
                                    {selectedPlan.meals.map((meal, mealIndex) => (
                                        <div key={`${meal.title}-${mealIndex}`} className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">
                                            <h3 className="text-sm font-extrabold text-slate-900">{meal.title}</h3>
                                            <div className="mt-3 divide-y divide-slate-200/70">
                                                {meal.items.map((item, itemIndex) => (
                                                    <div key={`${item.name}-${itemIndex}`} className="py-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <p className="text-sm font-semibold leading-6 text-slate-700">{item.fullText}</p>
                                                            <span className="shrink-0 text-xs font-bold text-slate-500">{item.cal} kcal</span>
                                                        </div>
                                                        <p className="mt-1 text-xs font-semibold text-slate-600">
                                                            P {item.macros.protein}g · Y {item.macros.fat}g · K {item.macros.carb}g
                                                        </p>
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
