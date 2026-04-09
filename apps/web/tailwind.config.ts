import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Brand color system - Premium orange/amber for primary actions & highlights
      colors: {
        brand: {
          50: "#fff8eb",
          100: "#feefc7",
          200: "#fdd98a",
          300: "#fcc04d",
          400: "#fba324",
          500: "#f58500", // Primary brand orange
          600: "#d96000",
          700: "#b34200",
          800: "#8f3100",
          900: "#752800",
        },
        // Surface colors - Near-black base with light variants
        surface: {
          DEFAULT: "#0a0a0a",
          50: "#f9f9f9",
          100: "#f0f0f0",
          200: "#e4e4e4",
          800: "#1a1a1a",
          900: "#111111",
          950: "#080808",
        },
      },
      // Font family configuration
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      // Animation defaults
      animation: {
        "fade-in": "fadeIn 0.6s ease-in-out",
        "slide-up": "slideUp 0.6s ease-out",
        "pulse-subtle": "pulseSubtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
