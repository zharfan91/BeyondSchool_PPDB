import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1440px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // PPDB Design System — primary blue (beyondDIGI DESIGN.md)
        primary: {
          DEFAULT: "#004ac6",
          container: "#2563eb",   // button / interactive blue
          hover: "#1d4ed8",
          fixed: "#dbe1ff",
          foreground: "#FFFFFF",
          50: "#eff3ff",
          100: "#dbe1ff",
          200: "#b4c5ff",
          300: "#7d9bff",
          400: "#4d6ef5",
          500: "#2563eb",
          600: "#004ac6",
          700: "#003ea8",
          800: "#00174b",
        },
        secondary: {
          DEFAULT: "#515f74",
          container: "#d5e3fd",   // sidebar active background
          fixed: "#d5e3fd",
          hover: "#3a485c",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#16A34A",
          foreground: "#FFFFFF",
          bg: "#F0FDF4",
          border: "#BBF7D0",
        },
        warning: {
          DEFAULT: "#F59E0B",
          foreground: "#FFFFFF",
          bg: "#FFFBEB",
          border: "#FDE68A",
        },
        danger: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
          bg: "#FEF2F2",
          border: "#FECACA",
        },
        info: {
          DEFAULT: "#2563EB",
          foreground: "#FFFFFF",
          bg: "#EFF6FF",
          border: "#BFDBFE",
        },
        // PPDB Material Design surface tokens
        surface: {
          DEFAULT: "#faf8ff",
          bright: "#faf8ff",
          dim: "#F8FAFC",
          container: "#ededf9",
          "container-low": "#f3f3fe",
          "container-high": "#e7e7f3",
          "container-highest": "#e1e2ed",
          "container-lowest": "#ffffff",
        },
        outline: {
          DEFAULT: "#737686",
          variant: "#c3c6d7",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      borderRadius: {
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
      spacing: {
        sidebar: "260px",
        navbar: "72px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontSize: {
        display: ["36px", { lineHeight: "44px", fontWeight: "700", letterSpacing: "-0.02em" }],
        "headline-lg": ["28px", { lineHeight: "36px", fontWeight: "600", letterSpacing: "-0.01em" }],
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "headline-md": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", fontWeight: "500", letterSpacing: "0.05em" }],
        code: ["13px", { lineHeight: "20px", fontWeight: "400" }],
      },
      boxShadow: {
        "soft-drop": "0px 1px 3px rgba(0,0,0,0.1), 0px 10px 20px rgba(0,0,0,0.02)",
        "high-elevation": "0px 4px 6px rgba(0,0,0,0.1), 0px 10px 24px rgba(0,0,0,0.08)",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in": {
          from: { transform: "translateY(4px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
        "slide-in": "slide-in 0.2s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
