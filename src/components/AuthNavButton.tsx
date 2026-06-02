"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, UserCircle, Utensils } from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface AuthNavButtonProps {
    isScrolled?: boolean;
}

export default function AuthNavButton({ isScrolled = false }: AuthNavButtonProps) {
    const { user, isLoading, signout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const textClass = isScrolled
        ? "text-slate-700 hover:text-indigo-600"
        : "text-white hover:text-indigo-100";

    if (isLoading) {
        return <span className={`text-base font-normal leading-none ${textClass}`}>...</span>;
    }

    if (!user) {
        return (
            <Link href="/giris" className={`cursor-pointer text-base font-normal leading-none transition-colors ${textClass}`}>
                Giriş Yap
            </Link>
        );
    }

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((value) => !value)}
                className={`flex cursor-pointer items-center gap-1 text-base font-normal leading-none transition-colors ${textClass}`}
            >
                <UserCircle className="h-4 w-4" />
                {user.name}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-8 z-[80] w-52 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                    <Link
                        href="/diyet-planlarim"
                        onClick={() => setIsOpen(false)}
                        className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                    >
                        <Utensils className="h-4 w-4" />
                        Diyet Planlarım
                    </Link>
                    <button
                        type="button"
                        onClick={() => {
                            signout();
                            setIsOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                        <LogOut className="h-4 w-4" />
                        Çıkış Yap
                    </button>
                </div>
            )}
        </div>
    );
}
