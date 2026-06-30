"use client";

import { useEffect, useState } from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import {
  THEME_COOKIE,
  THEME_STORAGE_KEY,
  isThemeChoice,
  resolveMode,
  type ThemeChoice,
} from "@/lib/theme-mode";

const ORDER: ThemeChoice[] = ["light", "dark", "system"];
const META: Record<ThemeChoice, { icon: typeof Sun; label: string }> = {
  light: { icon: Sun, label: "Light" },
  dark: { icon: Moon, label: "Dark" },
  system: { icon: Monitor, label: "System" },
};

function systemPrefersDark(): boolean {
  return typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
    : true;
}

function applyChoice(choice: ThemeChoice) {
  const mode = resolveMode(choice, systemPrefersDark());
  document.documentElement.setAttribute("data-mode", mode);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {}
  // 1-year cookie so the server renders the right mode on next visit (no flash).
  document.cookie = `${THEME_COOKIE}=${encodeURIComponent(choice)};path=/;max-age=31536000;samesite=lax`;
}

/**
 * User-controlled Light / Dark / System mode switch. Lives in the storefront
 * header. The admin's selected cricket theme automatically adapts to the chosen
 * mode (light or dark variant). Cycles on click; persists across sessions.
 */
export function ThemeModeToggle({ className }: { className?: string }) {
  const [choice, setChoice] = useState<ThemeChoice>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {}
    setChoice(isThemeChoice(stored) ? stored : "system");
  }, []);

  // When following the system, keep data-mode in sync with OS changes live.
  useEffect(() => {
    if (!mounted || choice !== "system" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () =>
      document.documentElement.setAttribute("data-mode", mq.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [mounted, choice]);

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(choice) + 1) % ORDER.length];
    setChoice(next);
    applyChoice(next);
  };

  // Render a stable icon until mounted to avoid hydration mismatch.
  const active = mounted ? choice : "system";
  const Icon = META[active].icon;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${META[active].label} (click to change)`}
      title={`Theme: ${META[active].label}`}
      className={
        className ??
        "grid h-10 w-10 place-items-center rounded-full text-muted transition-colors hover:bg-[var(--surface-2)] hover:text-foreground"
      }
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
