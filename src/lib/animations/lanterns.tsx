"use client";
import { useEffect, useRef } from "react";

interface Lantern {
  x: number; y: number;
  w: number; h: number;
  speed: number;
  sway: number; swayT: number; swaySpeed: number;
  hue: number;
  glow: number; glowT: number; glowSpeed: number;
  flicker: number;
}

export default function FloatingLanterns() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let W = 0, H = 0;
    const lanterns: Lantern[] = [];
    const COUNT = 8;

    function resize() { W = canvas!.width = window.innerWidth; H = canvas!.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    function make(initial: boolean): Lantern {
      const w = Math.random() * 9 + 11;
      return {
        x: Math.random() * W,
        y: initial ? Math.random() * H : H + Math.random() * 120 + 40,
        w,
        h: w * 1.35,
        speed: Math.random() * 0.5 + 0.25,
        sway: Math.random() * 14 + 8,
        swayT: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.008 + 0.005,
        hue: Math.random() * 28 + 8, // warm orange→amber
        glow: Math.random() * 0.3 + 0.6,
        glowT: Math.random() * Math.PI * 2,
        glowSpeed: Math.random() * 0.04 + 0.02,
        flicker: 0,
      };
    }
    for (let i = 0; i < COUNT; i++) lanterns.push(make(true));

    function drawLantern(l: Lantern) {
      const baseX = l.x + Math.sin(l.swayT) * l.sway;
      const y = l.y;
      const w = l.w, h = l.h;
      // Smooth glow pulse + occasional flicker.
      const pulse = 0.78 + Math.sin(l.glowT) * 0.12 + l.flicker;
      const glow = Math.max(0.4, Math.min(1, l.glow * pulse));

      ctx.save();
      ctx.translate(baseX, y);

      // Outer warm halo.
      const halo = ctx.createRadialGradient(0, 0, w * 0.2, 0, 0, w * 2.6);
      halo.addColorStop(0, `hsla(${l.hue}, 100%, 68%, ${glow * 0.45})`);
      halo.addColorStop(0.5, `hsla(${l.hue}, 100%, 60%, ${glow * 0.15})`);
      halo.addColorStop(1, `hsla(${l.hue}, 100%, 55%, 0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, w * 2.6, 0, Math.PI * 2);
      ctx.fill();

      // Top cap.
      ctx.fillStyle = `hsla(${l.hue - 5}, 55%, 28%, 0.95)`;
      ctx.beginPath();
      ctx.ellipse(0, -h * 0.5, w * 0.34, h * 0.07, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lantern body — rounded barrel with vertical gradient.
      const body = ctx.createLinearGradient(0, -h * 0.5, 0, h * 0.5);
      body.addColorStop(0, `hsla(${l.hue}, 95%, 62%, ${glow})`);
      body.addColorStop(0.5, `hsla(${l.hue + 4}, 100%, 56%, ${glow})`);
      body.addColorStop(1, `hsla(${l.hue - 4}, 90%, 46%, ${glow})`);
      ctx.fillStyle = body;
      ctx.beginPath();
      // Barrel silhouette via bezier sides.
      ctx.moveTo(-w * 0.32, -h * 0.46);
      ctx.quadraticCurveTo(-w * 0.55, 0, -w * 0.32, h * 0.46);
      ctx.lineTo(w * 0.32, h * 0.46);
      ctx.quadraticCurveTo(w * 0.55, 0, w * 0.32, -h * 0.46);
      ctx.closePath();
      ctx.fill();

      // Vertical ribs.
      ctx.strokeStyle = `hsla(${l.hue - 8}, 70%, 38%, ${glow * 0.5})`;
      ctx.lineWidth = 0.8;
      for (const f of [-0.18, 0, 0.18]) {
        ctx.beginPath();
        ctx.moveTo(w * f, -h * 0.44);
        ctx.quadraticCurveTo(w * f * 1.4, 0, w * f, h * 0.44);
        ctx.stroke();
      }
      // Top & bottom rim bands.
      ctx.strokeStyle = `hsla(${l.hue - 10}, 60%, 32%, ${glow * 0.8})`;
      ctx.lineWidth = 1.4;
      for (const ry of [-h * 0.42, h * 0.42]) {
        ctx.beginPath();
        ctx.moveTo(-w * 0.33, ry);
        ctx.lineTo(w * 0.33, ry);
        ctx.stroke();
      }

      // Inner candle highlight.
      const core = ctx.createRadialGradient(0, h * 0.05, 0, 0, h * 0.05, w * 0.4);
      core.addColorStop(0, `hsla(50, 100%, 90%, ${glow * 0.8})`);
      core.addColorStop(1, `hsla(${l.hue}, 100%, 70%, 0)`);
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.ellipse(0, h * 0.05, w * 0.22, h * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bottom base.
      ctx.fillStyle = `hsla(${l.hue - 5}, 55%, 26%, 0.95)`;
      ctx.beginPath();
      ctx.ellipse(0, h * 0.5, w * 0.26, h * 0.05, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tassel.
      ctx.strokeStyle = `hsla(${l.hue}, 80%, 50%, ${glow * 0.7})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.54);
      ctx.lineTo(0, h * 0.54 + 8 + Math.sin(l.swayT * 2) * 2);
      ctx.stroke();

      // Hanging string up top.
      ctx.strokeStyle = `hsla(${l.hue}, 50%, 60%, 0.35)`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, -h * 0.56);
      ctx.lineTo(0, -h * 0.56 - 14);
      ctx.stroke();

      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const l of lanterns) {
        // Random subtle flicker.
        l.flicker = Math.random() < 0.04 ? (Math.random() - 0.5) * 0.25 : l.flicker * 0.85;
        l.glowT += l.glowSpeed;
        l.swayT += l.swaySpeed;
        l.y -= l.speed;
        drawLantern(l);
        if (l.y < -l.h * 3) Object.assign(l, make(false));
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60]" />;
}
