import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { LoadingScreen } from "@/components/LoadingScreen";
import { telegramLogin } from "@/api/endpoints";
import { useTelegramTheme } from "@/hooks/useTelegramTheme";
import { useAuthStore } from "@/store/auth";
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
  const [bootstrapping, setBootstrapping] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrapAuth() {
      if (token) {
        setBootstrapping(false);
        return;
      }

      const initData =
        window.Telegram?.WebApp?.initData || new URLSearchParams(window.location.search).get("initData") || "";
      if (!initData) {
        setBootstrapping(false);
        setBootstrapError("Open this app from Telegram to authorize.");
        return;
      }

      try {
        const auth = await telegramLogin(initData);
        if (!mounted) {
          return;
        }
        setAuth(auth.access_token, auth.user);
      } catch (error) {
        if (!mounted) {
          return;
        }
        setBootstrapError("Failed to authenticate Telegram session.");
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
    return <LoadingScreen text="Authorizing Telegram session..." />;
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
    <Layout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="/queries" element={<QueriesPage />} />
        <Route path="/keywords" element={<KeywordsPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
