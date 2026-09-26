const TOKEN_KEY = "lms.auth.token";
const USER_KEY = "lms.auth.user";

import type { User } from "@/types/auth";

export const tokenStore = {
  get(): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },

  set(token: string): void {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(TOKEN_KEY, token);
      // Cookie mirror for Next.js middleware
      const isHttps = window.location.protocol === "https:";
      document.cookie = `${TOKEN_KEY}=${token}; path=/; SameSite=Strict${
        isHttps ? "; Secure" : ""
      }`;
    } catch {
      // Storage disabled
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(TOKEN_KEY);
      document.cookie = `${TOKEN_KEY}=; path=/; Max-Age=0; SameSite=Strict`;
    } catch {
      // Ignore
    }
  },
};

export const userStore = {
  get(): User | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },

  set(user: User): void {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch {
      // Ignore
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(USER_KEY);
    } catch {
      // Ignore
    }
  },
};

export function clearSession(): void {
  tokenStore.clear();
  userStore.clear();
}
