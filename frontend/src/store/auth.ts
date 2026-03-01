import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthUser = {
  id: number;
  telegram_id: number;
  username?: string | null;
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
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null })
    }),
    { name: "mp-ads-auth" }
  )
);
