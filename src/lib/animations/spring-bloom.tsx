"use client";
import { useEffect, useRef } from "react";

const PETAL_COLORS = ["#ffb7c5","#ff8fab","#ffc8dd","#ffafcc","#ffd6e7","#fff0f3","#f9c74f","#f4a261"];
interface Petal { x: number; y: number; r: number; angle: number; spin: number; speed: number; sway: number; swayT: number; color: string; opacity: number; petals: number }

export default function SpringBloom() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let W = 0, H = 0;
    const petals: Petal[] = [];

    function resize() { W = canvas!.width = window.innerWidth; H = canvas!.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 32; i++) {
      petals.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 4 + 2.5,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.04,
        speed: Math.random() * 1.2 + 0.3,
        sway: Math.random() * 1.5 + 0.5,
        swayT: Math.random() * Math.PI * 2,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        opacity: Math.random() * 0.5 + 0.3,
        petals: Math.floor(Math.random() * 3) + 4,
      });
    }

    function drawFlower(ctx: CanvasRenderingContext2D, p: Petal) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.opacity;
      for (let i = 0; i < p.petals; i++) {
        ctx.save();
        ctx.rotate((Math.PI * 2 / p.petals) * i);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(p.r * 0.8, 0, p.r * 0.7, p.r * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = "#fffbe6";
      ctx.beginPath();
      ctx.arc(0, 0, p.r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of petals) {
        drawFlower(ctx, p);
        p.y += p.speed;
        p.swayT += 0.02;
        p.x += Math.sin(p.swayT) * p.sway;
        p.angle += p.spin;
        if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60]" />;
}
