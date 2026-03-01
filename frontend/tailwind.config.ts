import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        tgBg: "var(--tg-bg-color)",
        tgText: "var(--tg-text-color)",
        tgHint: "var(--tg-hint-color)",
        tgLink: "var(--tg-link-color)",
        tgButton: "var(--tg-button-color)",
        tgButtonText: "var(--tg-button-text-color)"
      }
    }
  },
  plugins: []
};

export default config;
