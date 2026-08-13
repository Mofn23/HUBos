import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        hub: {
          bg: "#131313",
          surface: "#1C1C1E",
          surfaceCard: "#18181A",
          elevated: "#2A2A2C",
          elevatedLight: "#3A3A3C",
          tag: "#242426",
          border: "rgba(255, 255, 255, 0.10)",
          borderSubtle: "rgba(255, 255, 255, 0.06)",
          borderStrong: "rgba(255, 255, 255, 0.18)",
          textPrimary: "#F5F5F7",
          textSecondary: "#8E8E93",
          textMuted: "#636366",
          green: "#34C759",
          red: "#E8505B",
          blue: "#0A84FF",
          orange: "#FF9500",
          purple: "#BF5AF2",
          yellow: "#FFD60A",
          cyan: "#64D2FF",
        },
      },
      fontFamily: {
        sans: [
          "var(--font-nunito)",
          "Nunito",
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "system-ui",
          "sans-serif",
        ],
      },
      borderRadius: {
        pill: "9999px",
        card: "24px",
        sheet: "32px",
        modal: "36px",
      },
      boxShadow: {
        glowGreen: "0 0 24px rgba(52, 199, 89, 0.25)",
        glowBlue: "0 0 24px rgba(10, 132, 255, 0.25)",
        glowRed: "0 0 24px rgba(232, 80, 91, 0.25)",
        modal: "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.08)",
        card: "0 10px 30px -10px rgba(0, 0, 0, 0.5)",
      },
      animation: {
        "slide-up": "slideUp 280ms cubic-bezier(0.32, 0.72, 0.28, 1) forwards",
        "fade-in": "fadeIn 200ms ease-out forwards",
        "scale-up": "scaleUp 200ms cubic-bezier(0.32, 0.72, 0.28, 1) forwards",
        "cross-dissolve": "crossDissolve 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        pulseFast: "pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(100%)", opacity: "0.6" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleUp: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        crossDissolve: {
          "0%": { opacity: "0", transform: "scale(0.98)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
