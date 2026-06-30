"use client";

import { useEffect, useState, lazy, Suspense, type ComponentType } from "react";
import { ANIMATION_REGISTRY, type AnimationId } from "./registry";

const STORAGE_KEY = "nova-no-animations";

// Build the lazy components ONCE at module load — never inside render, or each
// re-render would create a new lazy() and remount the animation (flicker/reset).
const LAZY_COMPONENTS: Record<string, ComponentType> = Object.fromEntries(
  ANIMATION_REGISTRY.map((a) => [a.id, lazy(a.load)]),
);

interface Props {
  /** Active animation IDs from server config */
  active: AnimationId[];
}

/**
 * Renders all active animations lazily. Respects:
 * - `prefers-reduced-motion` OS setting
 * - User's stored "disable animations" preference (localStorage)
 *
 * A small dismiss button lets visitors opt out without reloading.
 */
export function AnimationLayer({ active }: Props) {
  const [enabled, setEnabled] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check user's stored preference.
    try {
      if (localStorage.getItem(STORAGE_KEY) === "true") setEnabled(false);
    } catch {}
    // Respect OS prefers-reduced-motion.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) setEnabled(false);
    const onChange = () => { if (mq.matches) setEnabled(false); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function dismiss() {
    setEnabled(false);
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
  }

  if (!mounted || !enabled || active.length === 0) return null;

  return (
    <>
      {active.map((id) => {
        const LazyComp = LAZY_COMPONENTS[id];
        if (!LazyComp) return null;
        return (
          <Suspense key={id} fallback={null}>
            <LazyComp />
          </Suspense>
        );
      })}
      {/* Dismiss button — always visible so users can opt out */}
      <button
        type="button"
        onClick={dismiss}
        title="Disable animations"
        aria-label="Disable animations"
        className="fixed bottom-20 right-3 z-[70] rounded-full bg-black/40 px-2 py-1 text-[10px] text-white/60 backdrop-blur-sm transition-opacity hover:opacity-100 opacity-40 md:bottom-4"
      >
        ✕ animations
      </button>
    </>
  );
}
