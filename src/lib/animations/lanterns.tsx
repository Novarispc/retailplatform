"use client";
import { useEffect, useRef } from "react";

interface Lantern { x: number; y: number; w: number; h: number; speed: number; sway: number; swayT: number; hue: number; glow: number; glowDir: number }

export default function FloatingLanterns() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let W = 0, H = 0;
    const lanterns: Lantern[] = [];

    function resize() { W = canvas!.width = window.innerWidth; H = canvas!.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 18; i++) {
      lanterns.push({
        x: Math.random() * W,
        y: H + Math.random() * H,
        w: Math.random() * 16 + 12,
        h: Math.random() * 22 + 18,
        speed: Math.random() * 0.6 + 0.3,
        sway: Math.random() * 0.8 + 0.3,
        swayT: Math.random() * Math.PI * 2,
        hue: Math.random() * 40 + 5,
        glow: Math.random() * 0.4 + 0.5,
        glowDir: Math.random() > 0.5 ? 1 : -1,
      });
    }

    function drawLantern(ctx: CanvasRenderingContext2D, l: Lantern) {
      ctx.save();
      ctx.translate(l.x, l.y);
      // Glow
      const radGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, l.w * 2.5);
      radGrad.addColorStop(0, `hsla(${l.hue},100%,70%,${l.glow * 0.4})`);
      radGrad.addColorStop(1, `hsla(${l.hue},100%,60%,0)`);
      ctx.fillStyle = radGrad;
      ctx.beginPath();
      ctx.arc(0, 0, l.w * 2.5, 0, Math.PI * 2);
      ctx.fill();
      // Body
      ctx.fillStyle = `hsla(${l.hue},90%,55%,${l.glow * 0.9})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, l.w / 2, l.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Highlight
      ctx.fillStyle = `hsla(${l.hue},100%,85%,${l.glow * 0.5})`;
      ctx.beginPath();
      ctx.ellipse(-l.w * 0.12, -l.h * 0.15, l.w * 0.15, l.h * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fill();
      // String
      ctx.strokeStyle = `rgba(255,200,100,0.5)`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, -l.h / 2);
      ctx.lineTo(0, -l.h / 2 - 10);
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const l of lanterns) {
        drawLantern(ctx, l);
        l.y -= l.speed;
        l.swayT += 0.015;
        l.x += Math.sin(l.swayT) * l.sway;
        l.glow += 0.01 * l.glowDir;
        if (l.glow > 0.95 || l.glow < 0.4) l.glowDir *= -1;
        if (l.y < -l.h * 2) { l.y = H + l.h; l.x = Math.random() * W; }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60]" />;
}
