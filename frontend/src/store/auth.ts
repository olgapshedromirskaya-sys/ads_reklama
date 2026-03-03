import { create } from "zustand";
import { persist } from "zustand/middleware";

const JWT_STORAGE_KEY = "mp-ads-jwt";

type AuthUser = {
  id: number;
  telegram_id: number;
  username?: string | null;
  name: string;
  role?: "owner" | "admin" | "manager";
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        localStorage.setItem(JWT_STORAGE_KEY, token);
        set({ token, user });
      },
      clearAuth: () => {
        localStorage.removeItem(JWT_STORAGE_KEY);
        set({ token: null, user: null });
      }
    }),
    { name: "mp-ads-auth" }
  )
);
