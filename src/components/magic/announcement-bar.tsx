"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

export type Announcement = {
  emoji?: string;
  text: string;
  bg: string;
  textColor: string;
};

// Dismissible top promo bar. Stays hidden for the session once closed.
// When a festival announcement is passed, it overrides the default promo and
// uses a message-specific dismissal key so a new festival re-appears.
export function AnnouncementBar({ announcement }: { announcement?: Announcement | null }) {
  const [show, setShow] = useState(true);

  // Per-message key: dismissing one festival/promo doesn't hide the next.
  const dismissKey = announcement
    ? `promo-fest-${announcement.text.slice(0, 24).replace(/\s+/g, "-")}`
    : "promo-ipl25-dismissed";

  useEffect(() => {
    if (sessionStorage.getItem(dismissKey)) setShow(false);
    else setShow(true);
  }, [dismissKey]);

  if (!show) return null;

  const festival = !!announcement;
  const wrapStyle = festival
    ? { background: announcement!.bg, color: announcement!.textColor }
    : undefined;

  return (
    <div
      className={`relative z-50 ${festival ? "" : "bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-[var(--accent-3)] text-[#06070d]"}`}
      style={wrapStyle}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-10 py-2 text-center text-xs font-semibold sm:text-sm">
        {festival ? (
          <span className="hidden shrink-0 sm:block">{announcement!.emoji}</span>
        ) : (
          <Sparkles className="hidden h-4 w-4 shrink-0 sm:block" />
        )}
        <span>{festival ? announcement!.text : "Official IPL 2025 Merchandise Now Available!"}</span>
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
          sessionStorage.setItem(dismissKey, "1");
        }}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full transition-colors hover:bg-[#06070d]/15"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
