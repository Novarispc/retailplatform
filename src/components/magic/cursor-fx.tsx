"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

// Custom pointer flourish: a soft accent glow that trails the cursor with spring
// physics, plus a crisp dot that tracks instantly. The cricket-bat cursor itself
// is set in CSS (body). Disabled on touch / coarse pointers and reduced-motion.
export function CursorFx() {
  const [enabled, setEnabled] = useState(false);
  const [active, setActive] = useState(false); // hovering a clickable

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 320, damping: 28, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 320, damping: 28, mass: 0.6 });

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    setEnabled(true);

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const el = e.target as HTMLElement | null;
      setActive(!!el?.closest("a, button, [role='button'], input, select, textarea, label"));
    };
    const leave = () => {
      x.set(-100);
      y.set(-100);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
    };
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* trailing glow ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden md:block"
        style={{ x: ringX, y: ringY }}
      >
        <motion.div
          className="rounded-full"
          animate={{
            width: active ? 52 : 30,
            height: active ? 52 : 30,
            opacity: active ? 0.55 : 0.32,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          style={{
            marginLeft: "-50%",
            marginTop: "-50%",
            background:
              "radial-gradient(circle, color-mix(in oklab, var(--accent) 65%, transparent), transparent 70%)",
            filter: "blur(2px)",
          }}
        />
      </motion.div>
      {/* instant core dot */}
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-2)] md:block"
        style={{ x, y }}
      />
    </>
  );
}
