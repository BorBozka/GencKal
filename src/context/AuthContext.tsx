"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthUser } from "../types";

interface AuthResponse {
    user: AuthUser;
    token: string;
}

interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    signin: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    signout: () => void;
    authHeaders: () => Record<string, string>;
}

const storageKey = "genckal_auth_token";
const AuthContext = createContext<AuthContextValue | null>(null);

async function parseAuthError(response: Response): Promise<string> {
    const data = await response.json().catch(() => null);
    return data?.error || `Sunucu hatası (${response.status})`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const applyAuth = useCallback((auth: AuthResponse) => {
        localStorage.setItem(storageKey, auth.token);
        setToken(auth.token);
        setUser(auth.user);
    }, []);

    const signout = useCallback(() => {
        localStorage.removeItem(storageKey);
        setToken(null);
        setUser(null);
    }, []);

    const authHeaders = useCallback((): Record<string, string> => (
        token ? { Authorization: `Bearer ${token}` } : {}
    ), [token]);

    useEffect(() => {
        let isActive = true;

        Promise.resolve().then(async () => {
            const savedToken = localStorage.getItem(storageKey);
            if (!savedToken) {
                if (isActive) setIsLoading(false);
                return;
            }

            if (isActive) setToken(savedToken);
            try {
                const response = await fetch("/api/auth/me", {
                    headers: { Authorization: `Bearer ${savedToken}` },
                });
                if (!response.ok) throw new Error(await parseAuthError(response));
                const data = await response.json() as { user: AuthUser };
                if (isActive) setUser(data.user);
            } catch {
                localStorage.removeItem(storageKey);
                if (isActive) {
                    setToken(null);
                    setUser(null);
                }
            } finally {
                if (isActive) setIsLoading(false);
            }
        });

        return () => {
            isActive = false;
        };
    }, []);

    const signin = useCallback(async (email: string, password: string) => {
        const response = await fetch("/api/auth/signin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        if (!response.ok) throw new Error(await parseAuthError(response));
        applyAuth(await response.json() as AuthResponse);
    }, [applyAuth]);

    const signup = useCallback(async (name: string, email: string, password: string) => {
        const response = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        if (!response.ok) throw new Error(await parseAuthError(response));
        applyAuth(await response.json() as AuthResponse);
    }, [applyAuth]);

    const value = useMemo<AuthContextValue>(() => ({
        user,
        token,
        isLoading,
        signin,
        signup,
        signout,
        authHeaders,
    }), [user, token, isLoading, signin, signup, signout, authHeaders]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
}
