import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, Route, Routes } from "react-router-dom";
import { LoadingScreen } from "@/components/LoadingScreen";
import AdsAnalyticsPage from "@/pages/AdsAnalyticsPage";
import {
  connectAccount,
  listAccounts,
  telegramLogin,
  type Account,
} from "@/api/endpoints";
import { canManageApiKeys, resolveUserRole } from "@/auth/roles";
import { useTelegramTheme } from "@/hooks/useTelegramTheme";
import { useAuthStore } from "@/store/auth";
import { resolveLaunchContext, setDemoMode } from "@/demo/mode";
import axios from "axios";

export default function App() {
  useTelegramTheme();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [bootstrapping, setBootstrapping] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function bootstrapAuth() {
      const launchContext = resolveLaunchContext();
      setDemoMode(launchContext.demoMode);

      if (launchContext.demoMode) {
        if (mounted) setBootstrapping(false);
        return;
      }

      const initData = launchContext.initData;
      if (!initData) {
        setDemoMode(true);
        if (mounted) setBootstrapping(false);
        return;
      }

      clearAuth();
      try {
        const auth = await telegramLogin(initData);
        if (!auth?.user?.id) throw new Error("Invalid auth response");
        if (!mounted) return;
        localStorage.setItem("mp-ads-jwt", auth.access_token);
        setAuth(auth.access_token, auth.user);
        setDemoMode(false);
        setAccessDenied(false);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          if (mounted) setAccessDenied(true);
          setDemoMode(false);
        } else {
          setDemoMode(true);
        }
      } finally {
        if (mounted) setBootstrapping(false);
      }
    }

    bootstrapAuth();
    return () => { mounted = false; };
  }, [setAuth, clearAuth]);

  if (bootstrapping) {
    return <LoadingScreen text="Авторизация..." fullscreen />;
  }

  if (accessDenied) {
    return (
      <div style={{ minHeight: "100vh", background: "#151c2e", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div style={{ background: "#1e2640", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: 20, maxWidth: 420 }}>
          <div style={{ fontSize: 24, color: "#ffffff", fontWeight: 700, marginBottom: 8 }}>🔒 Доступ закрыт</div>
          <div style={{ color: "#8892a4", fontSize: 13 }}>
            Доступ открыт только приглашённым пользователям. Добавление/удаление сотрудников выполняется владельцем через Telegram-бот.
          </div>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<AdsAnalyticsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
