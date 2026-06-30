"use client";
import { useEffect, useRef } from "react";

interface Streak { x: number; y: number; len: number; speed: number; opacity: number; width: number }

export default function WindEffect() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let W = 0, H = 0;
    const streaks: Streak[] = [];

    function resize() { W = canvas!.width = window.innerWidth; H = canvas!.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 80; i++) {
      streaks.push({
        x: Math.random() * W,
        y: Math.random() * H,
        len: Math.random() * 120 + 40,
        speed: Math.random() * 6 + 3,
        opacity: Math.random() * 0.15 + 0.03,
        width: Math.random() * 1.5 + 0.3,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const s of streaks) {
        const grad = ctx.createLinearGradient(s.x, s.y, s.x + s.len, s.y);
        grad.addColorStop(0, `rgba(200,220,255,0)`);
        grad.addColorStop(0.5, `rgba(200,220,255,${s.opacity})`);
        grad.addColorStop(1, `rgba(200,220,255,0)`);
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.len, s.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = s.width;
        ctx.stroke();
        s.x += s.speed;
        if (s.x > W + s.len) { s.x = -s.len; s.y = Math.random() * H; }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60]" />;
}
