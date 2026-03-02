import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { LoadingScreen } from "@/components/LoadingScreen";
import { telegramLogin } from "@/api/endpoints";
import { useTelegramTheme } from "@/hooks/useTelegramTheme";
import { useAuthStore } from "@/store/auth";
import { resolveLaunchContext, setDemoMode } from "@/demo/mode";
import { DashboardPage } from "@/pages/DashboardPage";
import { QueriesPage } from "@/pages/QueriesPage";
import { SettingsPage } from "@/pages/SettingsPage";

function App() {
  useTelegramTheme();
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const [demoMode, setDemoModeState] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;

    function enableDemoFallback() {
      if (!mounted) return;
      setDemoModeState(true);
      setDemoMode(true);
      navigate("/ozon", { replace: true });
    }

    async function bootstrapAuth() {
      const launchContext = resolveLaunchContext();
      if (mounted) {
        setDemoModeState(launchContext.demoMode);
      }
      setDemoMode(launchContext.demoMode);

      if (launchContext.demoMode) {
        setBootstrapping(false);
        navigate("/ozon", { replace: true });
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
        navigate("/ozon", { replace: true });
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
  }, [navigate, token, setAuth]);

  if (bootstrapping) {
    return <LoadingScreen text="Авторизация..." fullscreen />;
  }

  return (
    <Layout demoMode={demoMode}>
      <Routes>
        <Route path="/" element={<Navigate to="/ozon" replace />} />
        <Route path="/dashboard" element={<Navigate to="/ozon" replace />} />
        <Route path="/ozon" element={<DashboardPage marketplace="ozon" />} />
        <Route path="/wb" element={<DashboardPage marketplace="wb" />} />
        <Route path="/queries" element={<QueriesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/ozon" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
