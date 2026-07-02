"use client";

import { useEffect, useState, useRef, useCallback, lazy, Suspense, type ComponentType } from "react";
import { ANIMATION_REGISTRY, type AnimationId } from "./registry";

const STORAGE_KEY = "nova-no-animations";
const FADE_MS = 1400; // fade-in / fade-out duration

// Build lazy components ONCE at module load — never inside render.
const LAZY_COMPONENTS: Record<string, ComponentType> = Object.fromEntries(
  ANIMATION_REGISTRY.map((a) => [a.id, lazy(a.load)]),
);

// Wraps a single animation canvas with CSS opacity fade-in.
// When `leaving` becomes true, fades out then calls onDone to unmount.
function AnimationWrapper({
  id,
  leaving,
  onDone,
}: {
  id: AnimationId;
  leaving: boolean;
  onDone: () => void;
}) {
  const [opacity, setOpacity] = useState(0);
  const doneRef = useRef(onDone);
  useEffect(() => { doneRef.current = onDone; });

  // Fade in on mount.
  useEffect(() => {
    const t = setTimeout(() => setOpacity(1), 40); // next-frame trigger
    return () => clearTimeout(t);
  }, []);

  // Fade out when leaving, then signal unmount.
  useEffect(() => {
    if (!leaving) return;
    setOpacity(0);
    const t = setTimeout(() => doneRef.current(), FADE_MS + 50);
    return () => clearTimeout(t);
  }, [leaving]);

  const LazyComp = LAZY_COMPONENTS[id];
  if (!LazyComp) return null;

  return (
    <div
      style={{
        opacity,
        transition: `opacity ${FADE_MS}ms ease`,
      }}
    >
      <Suspense fallback={null}>
        <LazyComp />
      </Suspense>
    </div>
  );
}

interface Props {
  active: AnimationId[];
}

export function AnimationLayer({ active }: Props) {
  const [enabled, setEnabled] = useState(false); // false until client check
  const [mounted, setMounted] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  // Track what's on screen (may include fading-out items not in `active` anymore).
  const [rendering, setRendering] = useState<AnimationId[]>([]);
  const [leaving, setLeaving] = useState<Set<AnimationId>>(new Set());
  const prevActive = useRef<AnimationId[]>([]);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Clear any pending dismiss timeout if the layer unmounts mid-fade.
  useEffect(() => () => { if (dismissTimer.current) clearTimeout(dismissTimer.current); }, []);

  useEffect(() => {
    setMounted(true);

    // User's stored opt-out.
    try {
      if (localStorage.getItem(STORAGE_KEY) === "true") return;
    } catch {}

    // OS reduced-motion.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const onChange = () => { if (mq.matches) { setEnabled(false); } };
    mq.addEventListener("change", onChange);

    setEnabled(true);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Sync `active` prop → rendering/leaving lifecycle.
  useEffect(() => {
    if (!enabled) return;
    const prev = new Set(prevActive.current);
    const next = new Set(active);

    const added = active.filter((id) => !prev.has(id));
    const removed = prevActive.current.filter((id) => !next.has(id));

    if (added.length) {
      setRendering((r) => [...r.filter((id) => !added.includes(id)), ...added]);
    }
    if (removed.length) {
      setLeaving((l) => new Set([...l, ...removed]));
    }

    prevActive.current = active;
  }, [active, enabled]);

  // Seed initial rendering list when enabled first kicks in.
  useEffect(() => {
    if (!enabled || active.length === 0) return;
    setRendering(active);
    prevActive.current = active;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  const handleDone = useCallback((id: AnimationId) => {
    setRendering((r) => r.filter((x) => x !== id));
    setLeaving((l) => { const n = new Set(l); n.delete(id); return n; });
  }, []);

  function dismiss() {
    if (dismissing) return;
    setDismissing(true);
    try { localStorage.setItem(STORAGE_KEY, "true"); } catch {}
    // Fade out all currently rendering, then disable.
    setLeaving(new Set(rendering));
    dismissTimer.current = setTimeout(() => setEnabled(false), FADE_MS + 100);
  }

  if (!mounted || !enabled || (rendering.length === 0 && !dismissing)) return null;

  return (
    <>
      {rendering.map((id) => (
        <AnimationWrapper
          key={id}
          id={id}
          leaving={leaving.has(id)}
          onDone={() => handleDone(id)}
        />
      ))}
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
