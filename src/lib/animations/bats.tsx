"use client";
import { useEffect, useRef } from "react";

interface Bat {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  flap: number; flapSpeed: number;
  wanderT: number; wanderSpeed: number;
  baseY: number; bobAmp: number;
}

export default function HalloweenBats() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let W = 0, H = 0;
    const bats: Bat[] = [];
    const COUNT = 9;

    function resize() { W = canvas!.width = window.innerWidth; H = canvas!.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < COUNT; i++) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const baseY = Math.random() * H * 0.6 + H * 0.05;
      bats.push({
        x: Math.random() * W,
        y: baseY,
        vx: dir * (Math.random() * 0.5 + 0.5), // steady horizontal glide
        vy: 0,
        size: Math.random() * 4 + 6, // lean, smaller bats
        flap: Math.random() * Math.PI * 2,
        flapSpeed: Math.random() * 0.08 + 0.14, // calmer wing beat
        wanderT: Math.random() * Math.PI * 2,
        wanderSpeed: Math.random() * 0.006 + 0.004,
        baseY,
        bobAmp: Math.random() * 18 + 10,
      });
    }

    // Clean, premium bat silhouette centered at origin, facing +x.
    // `wing` in -1..1 drives a smooth up/down flap.
    function drawBat(b: Bat, wing: number) {
      const s = b.size;
      const up = wing * s * 0.55;

      // Soft drop shadow for depth.
      ctx.save();
      ctx.translate(0, s * 0.12);
      ctx.globalAlpha = 0.18;
      paintBody(s, up);
      ctx.restore();

      // Main silhouette — deep charcoal, subtle vertical sheen.
      const grad = ctx.createLinearGradient(0, -s * 0.6, 0, s * 0.6);
      grad.addColorStop(0, "#1a1a20");
      grad.addColorStop(1, "#0a0a0d");
      ctx.fillStyle = grad;
      paintBody(s, up);

      // Small red glowing eyes.
      const eyeY = -s * 0.34;
      const eyeX = s * 0.09;
      const eyeR = Math.max(0.6, s * 0.04);
      for (const sx of [-eyeX, eyeX]) {
        const glow = ctx.createRadialGradient(sx, eyeY, 0, sx, eyeY, eyeR * 3);
        glow.addColorStop(0, "rgba(255,50,35,0.9)");
        glow.addColorStop(0.5, "rgba(220,20,20,0.35)");
        glow.addColorStop(1, "rgba(180,0,0,0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(sx, eyeY, eyeR * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#ff5236";
        ctx.beginPath();
        ctx.arc(sx, eyeY, eyeR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Cohesive body+wings path — one smooth silhouette (no scalloped clutter).
    function paintBody(s: number, up: number) {
      ctx.beginPath();
      // Slim head with two fine pointed ears.
      ctx.moveTo(-s * 0.12, -s * 0.34);
      ctx.lineTo(-s * 0.07, -s * 0.54);
      ctx.lineTo(-s * 0.015, -s * 0.36);
      ctx.quadraticCurveTo(0, -s * 0.4, s * 0.015, -s * 0.36);
      ctx.lineTo(s * 0.07, -s * 0.54);
      ctx.lineTo(s * 0.12, -s * 0.34);

      // Right wing: long lean sweep, thin membrane, subtle single notch.
      ctx.quadraticCurveTo(s * 0.4, -s * 0.42 - up, s * 0.85, -s * 0.52 - up);
      ctx.quadraticCurveTo(s * 1.25, -s * 0.42 - up * 0.7, s * 1.5, -s * 0.12 - up * 0.4);
      ctx.quadraticCurveTo(s * 1.15, -s * 0.16, s * 0.9, s * 0.06);
      ctx.quadraticCurveTo(s * 0.72, -s * 0.08, s * 0.42, s * 0.06);
      ctx.quadraticCurveTo(s * 0.26, s * 0.14, s * 0.12, s * 0.14);
      // Slim body taper.
      ctx.quadraticCurveTo(0, s * 0.3, -s * 0.12, s * 0.14);
      // Left wing (mirror).
      ctx.quadraticCurveTo(-s * 0.26, s * 0.14, -s * 0.42, s * 0.06);
      ctx.quadraticCurveTo(-s * 0.72, -s * 0.08, -s * 0.9, s * 0.06);
      ctx.quadraticCurveTo(-s * 1.15, -s * 0.16, -s * 1.5, -s * 0.12 - up * 0.4);
      ctx.quadraticCurveTo(-s * 1.25, -s * 0.42 - up * 0.7, -s * 0.85, -s * 0.52 - up);
      ctx.quadraticCurveTo(-s * 0.4, -s * 0.42 - up, -s * 0.12, -s * 0.34);
      ctx.closePath();
      ctx.fill();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const b of bats) {
        b.flap += b.flapSpeed;
        b.wanderT += b.wanderSpeed;
        // Smooth vertical bob around baseY (no jitter) + slow drift of baseY.
        b.baseY += Math.sin(b.wanderT * 0.5) * 0.15;
        b.x += b.vx;
        b.y = b.baseY + Math.sin(b.wanderT) * b.bobAmp;

        // Wrap horizontally; keep baseY within band.
        if (b.x < -b.size * 2.2) b.x = W + b.size * 2.2;
        if (b.x > W + b.size * 2.2) b.x = -b.size * 2.2;
        if (b.baseY < H * 0.05) b.baseY = H * 0.05;
        if (b.baseY > H * 0.7) b.baseY = H * 0.7;

        const wing = Math.sin(b.flap);
        ctx.save();
        ctx.translate(b.x, b.y);
        if (b.vx < 0) ctx.scale(-1, 1);
        // Gentle bank into the flap for lifelike glide.
        ctx.rotate(wing * 0.05 * (b.vx < 0 ? -1 : 1));
        drawBat(b, wing);
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60]" />;
}
