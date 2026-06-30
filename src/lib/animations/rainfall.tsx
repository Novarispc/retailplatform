"use client";
import { useEffect, useRef } from "react";

interface Drop { x: number; y: number; len: number; speed: number; opacity: number }

export default function Rainfall() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let W = 0, H = 0;
    const drops: Drop[] = [];

    function resize() { W = canvas!.width = window.innerWidth; H = canvas!.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 200; i++) {
      drops.push({
        x: Math.random() * W,
        y: Math.random() * H,
        len: Math.random() * 18 + 8,
        speed: Math.random() * 8 + 6,
        opacity: Math.random() * 0.25 + 0.08,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const d of drops) {
        const grad = ctx.createLinearGradient(d.x, d.y, d.x - d.len * 0.2, d.y + d.len);
        grad.addColorStop(0, `rgba(174,214,241,0)`);
        grad.addColorStop(1, `rgba(174,214,241,${d.opacity})`);
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * 0.2, d.y + d.len);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.stroke();
        d.y += d.speed;
        d.x -= d.speed * 0.2;
        if (d.y > H + d.len) { d.y = -d.len; d.x = Math.random() * (W + 40); }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60]" />;
}
