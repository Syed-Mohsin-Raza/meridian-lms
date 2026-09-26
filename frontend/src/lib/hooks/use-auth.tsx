"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api/auth";
import { tokenStore, userStore, clearSession } from "@/lib/auth/token";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/types/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login(payload: LoginRequest): Promise<User>;
  register(payload: RegisterRequest): Promise<User>;
  logout(): void;
  refresh(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const router = useRouter();

  // Hydrate from sessionStorage on mount.
  // If sessionStorage is empty but a stale cookie exists (e.g., from a
  // restored session), clear both so the middleware and the frontend agree.
  useEffect(() => {
    const storedUser = userStore.get();
    const token = tokenStore.get();
    const hasCookie =
      typeof document !== "undefined" &&
      document.cookie.includes("lms.auth.token");

    console.log("[hydrate]", {
      hasStoredUser: Boolean(storedUser),
      hasStoredToken: Boolean(token),
      hasCookie,
      cookiesRaw: document.cookie,
    });

    if (storedUser && token) {
      setState({ user: storedUser, isLoading: false, isAuthenticated: true });
      return;
    }

    if (hasCookie) {
      console.log("[hydrate] clearing stale session");
      clearSession();
    }

    setState({ user: null, isLoading: false, isAuthenticated: false });
  }, []);

  const applyAuth = useCallback((response: AuthResponse) => {
    tokenStore.set(response.token);
    userStore.set(response.user);
    setState({
      user: response.user,
      isLoading: false,
      isAuthenticated: true,
    });
    return response.user;
  }, []);

  const login = useCallback(
    async (payload: LoginRequest) => {
      const response = await authApi.login(payload);
      return applyAuth(response);
    },
    [applyAuth]
  );

  const register = useCallback(
    async (payload: RegisterRequest) => {
      const response = await authApi.register(payload);
      return applyAuth(response);
    },
    [applyAuth]
  );

  const logout = useCallback(() => {
    clearSession();
    setState({ user: null, isLoading: false, isAuthenticated: false });
    router.push("/login");
  }, [router]);

  const refresh = useCallback(async () => {
    try {
      const user = await authApi.me();
      userStore.set(user);
      setState({ user, isLoading: false, isAuthenticated: true });
    } catch {
      clearSession();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  // Auto-refresh user data on window focus.
  // Picks up credit score changes triggered by admin approval or payment
  // processing without requiring a manual page reload.
  useEffect(() => {
    if (!state.isAuthenticated || state.isLoading) return;

    function handleFocus() {
      void refresh();
    }

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [state.isAuthenticated, state.isLoading, refresh]);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
