"use client";
import { useEffect, useRef } from "react";

interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; hue: number; r: number }
interface Shell { x: number; y: number; vy: number; hue: number }

export default function Fireworks() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let W = 0, H = 0;
    const particles: Particle[] = [];
    const shells: Shell[] = [];
    let tick = 0;

    function resize() { W = canvas!.width = window.innerWidth; H = canvas!.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    function burst(x: number, y: number, hue: number) {
      const count = Math.floor(Math.random() * 40) + 40;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
        const speed = Math.random() * 4 + 1.5;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          maxLife: Math.random() * 60 + 40,
          hue: hue + Math.random() * 30 - 15,
          r: Math.random() * 2 + 1,
        });
      }
    }

    function draw() {
      // Trail fade: reduce alpha of existing pixels via destination-out so the
      // overlay canvas stays transparent (filling black would black out the page).
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = "rgba(0,0,0,0.18)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";

      // Launch new shells periodically.
      tick++;
      if (tick % 80 === 0) {
        shells.push({
          x: Math.random() * W * 0.8 + W * 0.1,
          y: H,
          vy: -(Math.random() * 8 + 10),
          hue: Math.random() * 360,
        });
      }

      // Move shells upward.
      for (let i = shells.length - 1; i >= 0; i--) {
        const s = shells[i];
        s.y += s.vy;
        s.vy += 0.3; // gravity
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${s.hue},100%,80%)`;
        ctx.fill();
        if (s.vy >= 0) {
          burst(s.x, s.y, s.hue);
          shells.splice(i, 1);
        }
      }

      // Draw particles.
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.vx *= 0.97;
        p.life -= 1 / p.maxLife;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue},100%,65%,${p.life * 0.8})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    }

    // Initial clear so trail-fade doesn't compound with page bg.
    ctx.clearRect(0, 0, W, H);
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60]" />;
}
