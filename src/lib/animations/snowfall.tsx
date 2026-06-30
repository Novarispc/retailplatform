"use client";
import { useEffect, useRef } from "react";

interface Flake { x: number; y: number; r: number; speed: number; drift: number; opacity: number }

export default function Snowfall() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let W = 0, H = 0;
    const flakes: Flake[] = [];

    function resize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 120; i++) {
      flakes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 3 + 1,
        speed: Math.random() * 1.2 + 0.4,
        drift: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const f of flakes) {
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`;
        ctx.fill();
        f.y += f.speed;
        f.x += f.drift;
        if (f.y > H + f.r) { f.y = -f.r; f.x = Math.random() * W; }
        if (f.x > W + f.r) f.x = -f.r;
        if (f.x < -f.r) f.x = W + f.r;
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60]" />;
}
