"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authApi, clearSession, getStoredUser, setSession } from "./api";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  register: (payload: { name: string; email: string; password: string; phone?: string; role?: "CUSTOMER" | "PROVIDER" }) => Promise<void>;
  logout: () => void;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Start as null/loading on both server and first client render so hydration
  // matches, then hydrate the real session from localStorage after mount.
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = getStoredUser();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setUser(stored);
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authApi.login({ email, password });
    setSession(result.accessToken, result.user);
    setUser(result.user);
    return result.user;
  }, []);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const result = await authApi.loginWithGoogle(idToken);
    setSession(result.accessToken, result.user);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(
    async (payload: { name: string; email: string; password: string; phone?: string; role?: "CUSTOMER" | "PROVIDER" }) => {
      await authApi.register(payload);
    },
    []
  );

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.push("/");
  }, [router]);

  const refreshMe = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      clearSession();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, register, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
