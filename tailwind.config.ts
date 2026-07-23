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
        // Warm-ivory palette with a plum accent (outside blue/green/orange/red)
        primary: {
          DEFAULT: "#6E4B8F",     // plum
          container: "#6E4B8F",   // interactive
          hover: "#5A3B77",       // darker plum for hover
          fixed: "#ECE4F2",
          foreground: "#FFFFFF",
          50: "#F3EEF8",
          100: "#E6DBF0",
          200: "#CDB8E0",
          300: "#B092CE",
          400: "#8E6BB0",
          500: "#6E4B8F",
          600: "#5A3B77",
          700: "#472E5E",
          800: "#2F1E3F",
        },
        secondary: {
          DEFAULT: "#6B6862",     // warm taupe
          container: "#ECE4F2",   // sidebar active — soft plum tint
          fixed: "#ECE4F2",
          hover: "#59554F",
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#3F7A55",
          foreground: "#FFFFFF",
          bg: "#EDF3EC",
          border: "#CADBCB",
        },
        warning: {
          DEFAULT: "#B47818",
          foreground: "#FFFFFF",
          bg: "#FAF2E0",
          border: "#EDD9AE",
        },
        danger: {
          DEFAULT: "#B4402F",
          foreground: "#FFFFFF",
          bg: "#F7ECE8",
          border: "#E9C7BE",
        },
        info: {
          DEFAULT: "#3B6E8F",
          foreground: "#FFFFFF",
          bg: "#EAF1F4",
          border: "#C6DAE3",
        },
        // Warm surface tokens (ivory/cream)
        surface: {
          DEFAULT: "#F4F3EE",
          bright: "#FBFAF6",
          dim: "#EFEDE6",
          container: "#ECEAE3",
          "container-low": "#F3F1EA",
          "container-high": "#E7E4DB",
          "container-highest": "#E0DCD1",
          "container-lowest": "#FFFFFF",
        },
        outline: {
          DEFAULT: "#8A8578",
          variant: "#D8D3C7",
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
        sm: "0.25rem",
        DEFAULT: "0.375rem",
        md: "0.5rem",      // buttons / inputs — softer
        lg: "0.625rem",
        xl: "0.875rem",    // cards
      },
      spacing: {
        sidebar: "260px",
        navbar: "72px",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Fraunces", "Georgia", "Cambria", "Times New Roman", "serif"],
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
        // Softer, warm-tinted elevation to suit the flat editorial look.
        "soft-drop": "0px 1px 2px rgba(41,37,33,0.04), 0px 1px 3px rgba(41,37,33,0.06)",
        "high-elevation": "0px 4px 12px rgba(41,37,33,0.08), 0px 2px 4px rgba(41,37,33,0.04)",
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
