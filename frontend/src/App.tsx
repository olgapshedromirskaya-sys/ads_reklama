import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Layout, type AppTab } from "@/components/Layout";
import { LoadingScreen } from "@/components/LoadingScreen";
import { telegramLogin } from "@/api/endpoints";
import { useTelegramTheme } from "@/hooks/useTelegramTheme";
import { useAuthStore } from "@/store/auth";
import { resolveLaunchContext, setDemoMode } from "@/demo/mode";
import { DashboardPage } from "@/pages/DashboardPage";
import { CampaignDetailPage } from "@/pages/CampaignDetailPage";
import { CampaignsPage } from "@/pages/CampaignsPage";
import { QueriesPage } from "@/pages/QueriesPage";
import { SettingsPage } from "@/pages/SettingsPage";

function App() {
  useTelegramTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [demoMode, setDemoModeState] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const activeTab = useMemo<AppTab>(() => {
    if (location.pathname.startsWith("/settings")) {
      return "settings";
    }
    if (location.pathname.startsWith("/wb")) {
      return "wb";
    }
    return "ozon";
  }, [location.pathname]);

  useEffect(() => {
    let mounted = true;

    function enableDemoFallback() {
      if (!mounted) return;
      setDemoModeState(true);
      setDemoMode(true);
    }

    async function bootstrapAuth() {
      const launchContext = resolveLaunchContext();
      if (mounted) {
        setDemoModeState(launchContext.demoMode);
      }
      setDemoMode(launchContext.demoMode);

      if (launchContext.demoMode) {
        setAccessDenied(false);
        setBootstrapping(false);
        return;
      }

      setBootstrapping(true);
      const initData = launchContext.initData;

      if (!initData) {
        enableDemoFallback();
        return;
      }

      // Всегда авторизуемся заново при наличии initData — чтобы роль всегда была актуальной
      try {
        const auth = await telegramLogin(initData);
        if (!auth?.user?.id) {
          throw new Error("Invalid auth response");
        }
        if (!mounted) {
          return;
        }

        localStorage.setItem("mp-ads-jwt", auth.access_token);
        setAuth(auth.access_token, auth.user);
        setAccessDenied(false);
        setDemoModeState(false);
        setDemoMode(false);
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("[TelegramAuth] Auth failed:", error.response?.status, error.message);
          if (error.response?.status === 403) {
            if (mounted) {
              setAccessDenied(true);
              setDemoModeState(false);
            }
            setDemoMode(false);
            return;
          }
        } else {
          console.error("[TelegramAuth] Auth failed:", error);
        }
        // Любая ошибка авторизации переводит в DEMO-режим.
        enableDemoFallback();
      } finally {
        if (mounted) {
          setBootstrapping(false);
        }
      }
    }

    bootstrapAuth();
    return () => {
      mounted = false;
    };
  }, [token, setAuth]);

  if (bootstrapping) {
    return <LoadingScreen text="Авторизация..." fullscreen />;
  }

  if (accessDenied) {
    return (
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center bg-[color:var(--tg-bg-color)] px-6 text-center">
        <div className="app-card max-w-lg p-6">
          <div className="mb-2 text-xl font-bold text-slate-100">🔒 Доступ закрыт</div>
          <p className="text-sm text-slate-300">Этот бот и дашборд являются приватными. Обратитесь к руководителю для получения доступа.</p>
        </div>
      </div>
    );
  }

  return (
    <Layout
      demoMode={demoMode}
      activeTab={activeTab}
      onTabChange={(tab) => {
        if (tab === "settings") {
          navigate("/settings");
          return;
        }
        navigate(tab === "wb" ? "/wb" : "/");
      }}
    >
      <Routes>
        <Route path="/" element={<DashboardPage marketplace="ozon" />} />
        <Route path="/ozon" element={<DashboardPage marketplace="ozon" />} />
        <Route path="/wb" element={<DashboardPage marketplace="wb" />} />

        <Route path="/ozon/campaigns" element={<CampaignsPage marketplaceFilter="ozon" />} />
        <Route path="/wb/campaigns" element={<CampaignsPage marketplaceFilter="wb" />} />
        <Route path="/campaigns" element={<CampaignsPage />} />

        <Route path="/ozon/campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="/wb/campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />

        <Route path="/queries" element={<QueriesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
