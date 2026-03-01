const DEMO_QUERY_PARAM = "demo";

let demoModeEnabled = false;

export type LaunchContext = {
  initData: string;
  forceDemo: boolean;
  demoMode: boolean;
};

export function resolveInitData(search = window.location.search): string {
  const queryParams = new URLSearchParams(search);
  return window.Telegram?.WebApp?.initData || queryParams.get("initData") || queryParams.get("tgWebAppData") || "";
}

export function resolveLaunchContext(search = window.location.search): LaunchContext {
  const queryParams = new URLSearchParams(search);
  const forceDemo = queryParams.get(DEMO_QUERY_PARAM) === "true";
  const initData = resolveInitData(search);
  return {
    initData,
    forceDemo,
    demoMode: forceDemo || !initData
  };
}

export function setDemoMode(value: boolean) {
  demoModeEnabled = value;
}

export function isDemoMode() {
  return demoModeEnabled;
}

export function removeDemoParamFromCurrentUrl(): string {
  const url = new URL(window.location.href);
  url.searchParams.delete(DEMO_QUERY_PARAM);
  return `${url.pathname}${url.search}${url.hash}`;
}
