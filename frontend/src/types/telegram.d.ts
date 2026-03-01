export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        ready: () => void;
        expand: () => void;
        colorScheme: "light" | "dark";
        themeParams: Record<string, string>;
        MainButton: {
          isVisible: boolean;
          setParams: (params: { text?: string; color?: string; text_color?: string; is_visible?: boolean }) => void;
          onClick: (handler: () => void) => void;
          offClick: (handler: () => void) => void;
          show: () => void;
          hide: () => void;
        };
        BackButton: {
          show: () => void;
          hide: () => void;
          onClick: (handler: () => void) => void;
          offClick: (handler: () => void) => void;
        };
      };
    };
  }
}
