import axios from "axios";
import { useEffect, useState } from "react";
import { Layout, type AppTab } from "@/components/Layout";
import { LoadingScreen } from "@/components/LoadingScreen";
import { telegramLogin } from "@/api/endpoints";
import { useTelegramTheme } from "@/hooks/useTelegramTheme";
import { useAuthStore } from "@/store/auth";
import { resolveLaunchContext, setDemoMode } from "@/demo/mode";
import { DashboardPage } from "@/pages/DashboardPage";
import { SettingsPage } from "@/pages/SettingsPage";

function App() {
  useTelegramTheme();
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [demoMode, setDemoModeState] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>("ozon");

  useEffect(() => {
    let mounted = true;

    function enableDemoFallback() {
      if (!mounted) return;
      setDemoModeState(true);
      setDemoMode(true);
      setActiveTab("ozon");
    }

    async function bootstrapAuth() {
      const launchContext = resolveLaunchContext();
      if (mounted) {
        setDemoModeState(launchContext.demoMode);
      }
      setDemoMode(launchContext.demoMode);

      if (launchContext.demoMode) {
        if (mounted) {
          setActiveTab("ozon");
        }
        setBootstrapping(false);
        return;
      }

      if (token) {
        setBootstrapping(false);
        return;
      }

      setBootstrapping(true);
      const initData = launchContext.initData;

      if (!initData) {
        enableDemoFallback();
        return;
      }

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
        setDemoModeState(false);
        setDemoMode(false);
        setActiveTab("ozon");
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.error("[TelegramAuth] Auth failed:", error.response?.status, error.message);
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

  return (
    <Layout demoMode={demoMode} activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "ozon" && <DashboardPage marketplace="ozon" />}
      {activeTab === "wb" && <DashboardPage marketplace="wb" />}
      {activeTab === "settings" && <SettingsPage />}
    </Layout>
  );
}

export default App;
