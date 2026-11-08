import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Locked AlmaLink Brand Colors
        brand: {
          iris: "#5D5FEF",
          "iris-hover": "#4B4DDF",
          "iris-light": "#EEEEFF",
          "iris-subtle": "#F4F4FF",
        },
        sidebar: {
          dark: "#161D2C",
          hover: "#202435",
          active: "#2A324B",
          text: "#A3ADC2",
          "text-active": "#FFFFFF",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#5D5FEF",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["Work Sans", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        lg: "0.625rem", // 10px
        md: "0.5rem",   // 8px
        sm: "0.375rem", // 6px
      },
    },
  },
  plugins: [tailwindAnimate],
};

export default config;

