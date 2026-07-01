"use client";
import { useEffect, useRef } from "react";

interface Fly {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  hue: number;
  // Blink cycle.
  phase: number; speed: number;
  // Wander steering.
  wanderT: number; wanderSpeed: number;
}

export default function Fireflies() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let W = 0, H = 0;
    const flies: Fly[] = [];
    const COUNT = 26;

    function resize() { W = canvas!.width = window.innerWidth; H = canvas!.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < COUNT; i++) {
      flies.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.6 + 1,
        hue: Math.random() * 30 + 50, // warm yellow-green glow
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.025 + 0.012,
        wanderT: Math.random() * Math.PI * 2,
        wanderSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter"; // additive glow blending
      for (const f of flies) {
        // Organic wandering — steer velocity with smooth noise.
        f.wanderT += f.wanderSpeed;
        f.vx += Math.cos(f.wanderT) * 0.02;
        f.vy += Math.sin(f.wanderT * 1.3) * 0.02;
        // Damp + clamp speed.
        f.vx *= 0.96; f.vy *= 0.96;
        const sp = Math.hypot(f.vx, f.vy);
        const max = 0.7;
        if (sp > max) { f.vx = (f.vx / sp) * max; f.vy = (f.vy / sp) * max; }
        f.x += f.vx; f.y += f.vy;
        // Wrap around edges.
        if (f.x < -10) f.x = W + 10; if (f.x > W + 10) f.x = -10;
        if (f.y < -10) f.y = H + 10; if (f.y > H + 10) f.y = -10;

        // Soft blink — brightness eases in/out, never fully gone.
        f.phase += f.speed;
        const glow = 0.25 + (Math.sin(f.phase) * 0.5 + 0.5) * 0.75;

        // Halo.
        const halo = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 7);
        halo.addColorStop(0, `hsla(${f.hue}, 100%, 75%, ${glow * 0.5})`);
        halo.addColorStop(0.4, `hsla(${f.hue}, 100%, 65%, ${glow * 0.18})`);
        halo.addColorStop(1, `hsla(${f.hue}, 100%, 60%, 0)`);
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r * 7, 0, Math.PI * 2);
        ctx.fill();

        // Bright core.
        ctx.fillStyle = `hsla(${f.hue}, 100%, 92%, ${glow})`;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60]" />;
}
