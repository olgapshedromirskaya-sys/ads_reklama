import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { LoadingScreen } from "@/components/LoadingScreen";
import { telegramLogin } from "@/api/endpoints";
import { useTelegramTheme } from "@/hooks/useTelegramTheme";
import { useAuthStore } from "@/store/auth";
import { removeDemoParamFromCurrentUrl, resolveLaunchContext, setDemoMode } from "@/demo/mode";
import { AlertsPage } from "@/pages/AlertsPage";
import { BudgetPage } from "@/pages/BudgetPage";
import { CampaignDetailPage } from "@/pages/CampaignDetailPage";
import { CampaignsPage } from "@/pages/CampaignsPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { KeywordsPage } from "@/pages/KeywordsPage";
import { QueriesPage } from "@/pages/QueriesPage";
import { SettingsPage } from "@/pages/SettingsPage";

function App() {
  useTelegramTheme();
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const [demoMode, setDemoModeState] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    function resolveAuthErrorMessage(error: unknown): string {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const payload = error.response?.data as { detail?: unknown; message?: unknown } | undefined;
        const detail = payload?.detail ?? payload?.message ?? error.message;
        const detailText = Array.isArray(detail)
          ? detail
              .map((entry) => {
                if (typeof entry === "string") {
                  return entry;
                }
                if (entry && typeof entry === "object") {
                  const reason = (entry as { msg?: string }).msg;
                  return reason || JSON.stringify(entry);
                }
                return String(entry);
              })
              .join("; ")
          : typeof detail === "string"
            ? detail
            : detail
              ? JSON.stringify(detail)
              : "Unknown authorization error";

        return `Failed to authenticate Telegram session${status ? ` (${status})` : ""}: ${detailText}`;
      }

      if (error instanceof Error) {
        if (error.message === "Invalid auth response") {
          return "Failed to authenticate Telegram session: backend returned an invalid user payload.";
        }
        return `Failed to authenticate Telegram session: ${error.message}`;
      }

      return "Failed to authenticate Telegram session: Unknown error.";
    }

    async function bootstrapAuth() {
      const launchContext = resolveLaunchContext();
      if (mounted) {
        setDemoModeState(launchContext.demoMode);
      }
      setDemoMode(launchContext.demoMode);
      console.log("[TelegramAuth] Bootstrapping app", {
        demoMode: launchContext.demoMode,
        initDataPresent: Boolean(launchContext.initData)
      });

      if (launchContext.demoMode) {
        setBootstrapError(null);
        setBootstrapping(false);
        return;
      }

      if (token) {
        console.log("[TelegramAuth] Existing token found in auth store, skipping bootstrap auth");
        setBootstrapping(false);
        return;
      }

      setBootstrapping(true);
      const initData = launchContext.initData;

      console.log("[TelegramAuth] Telegram WebApp available:", Boolean(window.Telegram?.WebApp));
      console.log("[TelegramAuth] initData detected:", Boolean(initData), "length:", initData.length);

      if (!initData) {
        console.error("[TelegramAuth] initData missing; unable to continue regular auth flow");
        setBootstrapping(false);
        setBootstrapError("Open this app from Telegram to authorize.");
        return;
      }

      try {
        console.log("[TelegramAuth] Sending initData to POST /api/auth/telegram");
        const auth = await telegramLogin(initData);
        if (!auth?.user?.id) {
          throw new Error("Invalid auth response");
        }
        if (!mounted) {
          return;
        }

        console.log("[TelegramAuth] Telegram auth success", {
          userId: auth.user.id,
          telegramId: auth.user.telegram_id
        });
        localStorage.setItem("mp-ads-jwt", auth.access_token);
        setAuth(auth.access_token, auth.user);
        setBootstrapError(null);
        navigate("/dashboard", { replace: true });
      } catch (error) {
        console.error("[TelegramAuth] Telegram auth request failed", error);
        if (!mounted) {
          return;
        }
        setBootstrapError(resolveAuthErrorMessage(error));
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

  function handleExitDemoMode() {
    setDemoMode(false);
    setDemoModeState(false);
    window.location.href = removeDemoParamFromCurrentUrl();
  }

  if (bootstrapping) {
    return <LoadingScreen text="Authorizing..." fullscreen />;
  }

  if (bootstrapError && !token) {
    return (
      <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-6 text-center">
        <div>
          <h1 className="mb-2 text-lg font-semibold">MP Ads Manager</h1>
          <p className="text-sm text-[color:var(--tg-hint-color)]">{bootstrapError}</p>
        </div>
      </div>
    );
  }

  return (
    <Layout demoMode={demoMode} onExitDemo={handleExitDemoMode}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="/queries" element={<QueriesPage />} />
        <Route path="/keywords" element={<KeywordsPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
