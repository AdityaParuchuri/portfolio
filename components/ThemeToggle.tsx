"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "light" | "dark";

const THEME_COLORS: Record<Theme, string> = {
  dark: "#0b0f14",
  light: "#f6f8fb",
};

const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", THEME_COLORS[theme]);
};

export default function ThemeToggle() {
  // null until mounted: the real theme is set by the inline script in
  // layout.tsx before hydration, so the server can't know it.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const read = (): Theme =>
      document.documentElement.dataset.theme === "light" ? "light" : "dark";
    setTheme(read());
    applyTheme(read());

    // Navigation renders one toggle for desktop and one for mobile; both stay
    // mounted, so follow the attribute instead of trusting local state.
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage can be blocked (private mode); the choice just won't persist.
    }
  };

  const isLight = theme === "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label="Light mode"
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      onClick={toggle}
      disabled={theme === null}
      className="relative inline-flex h-8 w-14 flex-shrink-0 items-center rounded-full glass transition-colors duration-200 accent-focus cursor-pointer"
    >
      <Sun
        aria-hidden="true"
        className="absolute left-2 h-4 w-4 text-fg/60"
      />
      <Moon
        aria-hidden="true"
        className="absolute right-2 h-4 w-4 text-fg/60"
      />
      <span
        aria-hidden="true"
        className={`absolute left-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-primary-strong)] text-white shadow transition-transform duration-200 ${
          isLight ? "translate-x-0" : "translate-x-6"
        }`}
      >
        {isLight ? (
          <Sun className="h-3.5 w-3.5" />
        ) : (
          <Moon className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  );
}
