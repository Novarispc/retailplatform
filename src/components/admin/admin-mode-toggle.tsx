"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

// Separate key from storefront (nova-mode) — no conflict between admin + visitors.
const ADMIN_MODE_KEY = "nova-admin-mode";
type Mode = "light" | "dark";

function read(): Mode {
  try {
    const v = localStorage.getItem(ADMIN_MODE_KEY);
    if (v === "light" || v === "dark") return v;
  } catch {}
  // Default to dark so admin matches the existing admin aesthetic.
  return "dark";
}

function apply(mode: Mode) {
  document.documentElement.setAttribute("data-mode", mode);
  try { localStorage.setItem(ADMIN_MODE_KEY, mode); } catch {}
  document.cookie = `${ADMIN_MODE_KEY}=${mode};path=/admin;max-age=31536000;samesite=lax`;
}

export function AdminModeToggle() {
  const [mode, setMode] = useState<Mode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const m = read();
    setMode(m);
    apply(m); // override visitor's data-mode for this admin session
    setMounted(true);
  }, []);

  function toggle() {
    const next: Mode = mode === "dark" ? "light" : "dark";
    setMode(next);
    apply(next);
  }

  const Icon = mounted ? (mode === "dark" ? Moon : Sun) : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      title={`Admin mode: ${mounted ? mode : "dark"} (click to toggle)`}
      aria-label="Toggle admin light/dark mode"
      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-[var(--surface-2)] hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
