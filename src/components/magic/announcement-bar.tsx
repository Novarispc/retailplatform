"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

// Dismissible top promo bar. Stays hidden for the session once closed.
export function AnnouncementBar() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (sessionStorage.getItem("promo-ipl25-dismissed")) setShow(false);
  }, []);

  if (!show) return null;

  return (
    <div className="relative z-50 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-3)] text-[#06070d]">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-10 py-2 text-center text-xs font-semibold sm:text-sm">
        <Sparkles className="hidden h-4 w-4 shrink-0 sm:block" />
        <span>Official IPL 2025 Merchandise Now Available!</span>
        <Link
          href="/catalog"
          className="shrink-0 rounded-full bg-[#06070d] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white transition-transform hover:scale-105"
        >
          Buy now
        </Link>
      </div>
      <button
        onClick={() => {
          setShow(false);
          sessionStorage.setItem("promo-ipl25-dismissed", "1");
        }}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full transition-colors hover:bg-[#06070d]/15"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
