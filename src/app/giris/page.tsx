"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/ui/Toast";

type AuthMode = "signin" | "signup";

export default function LoginPage() {
    const router = useRouter();
    const { signin, signup } = useAuth();
    const { toast } = useToast();
    const [mode, setMode] = useState<AuthMode>("signin");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            if (mode === "signup") {
                await signup(name, email, password);
                toast("success", "Kayıt tamamlandı", "Hesabınız oluşturuldu.");
            } else {
                await signin(email, password);
                toast("success", "Giriş yapıldı", "Oturumunuz açıldı.");
            }
            router.push("/");
        } catch (error) {
            toast("error", mode === "signup" ? "Kayıt başarısız" : "Giriş başarısız", error instanceof Error ? error.message : "İşlem tamamlanamadı.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900">
            <div className="mx-auto flex w-full max-w-md flex-col gap-6">
                <Link href="/" className="inline-flex w-fit items-center gap-2 text-sm font-bold text-slate-500 transition-colors hover:text-indigo-700">
                    <ArrowLeft className="h-4 w-4" />
                    Ana Sayfa
                </Link>

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">GencKalculator</p>
                        <h1 className="mt-2 text-2xl font-extrabold text-slate-950">
                            {mode === "signin" ? "Giriş Yap" : "Kayıt Ol"}
                        </h1>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            Diyet planlarınızı web ve mobilde aynı hesapla saklayın.
                        </p>
                    </div>

                    <div className="mb-6 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
                        <button
                            type="button"
                            onClick={() => setMode("signin")}
                            className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${mode === "signin" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Giriş Yap
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode("signup")}
                            className={`rounded-xl px-4 py-2 text-sm font-bold transition-colors ${mode === "signup" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Kayıt Ol
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {mode === "signup" && (
                            <label className="flex flex-col gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Ad</span>
                                <input
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    required
                                    minLength={2}
                                    className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-indigo-400 focus:bg-white"
                                    placeholder="Adınız"
                                />
                            </label>
                        )}

                        <label className="flex flex-col gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">E-posta</span>
                            <input
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                type="email"
                                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-indigo-400 focus:bg-white"
                                placeholder="ornek@mail.com"
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Şifre</span>
                            <input
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                                minLength={mode === "signup" ? 6 : 1}
                                type="password"
                                className="h-12 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-800 outline-none transition-colors focus:border-indigo-400 focus:bg-white"
                                placeholder={mode === "signup" ? "En az 6 karakter" : "Şifreniz"}
                            />
                        </label>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-2 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#3E3AAF] px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgba(62,58,175,0.24)] transition-colors hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-70"
                        >
                            {mode === "signup" ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                            {isSubmitting ? "İşleniyor..." : mode === "signup" ? "Kayıt Ol" : "Giriş Yap"}
                        </button>
                    </form>
                </section>
            </div>
        </main>
    );
}
