import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Theme "ink" color (light text on dark, dark text on light). Use
        // opacity modifiers for muted levels, e.g. text-fg/65, bg-fg/10.
        fg: "rgb(var(--fg-rgb) / <alpha-value>)",
        // These accent vars are comma-separated ("95, 134, 201") because
        // rgba(var(--x), a) and SpotlightGrid's parser rely on that, so they
        // must use rgba() here, not the space-separated `rgb(... / a)` form.
        primary: {
          light: "rgba(var(--accent-primary-rgb), 0.85)",
          DEFAULT: "rgba(var(--accent-primary-rgb), 1)",
          dark: "rgba(var(--accent-primary-rgb), 0.75)",
        },
        accent: {
          light: "rgba(var(--accent-secondary-rgb), 0.9)",
          DEFAULT: "rgba(var(--accent-secondary-rgb), 1)",
          dark: "rgba(var(--accent-secondary-rgb), 0.75)",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-in-out",
        "slide-up": "slideUp 0.6s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

