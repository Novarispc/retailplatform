"use client";
import { useEffect, useRef } from "react";

const COLORS = ["#c0392b","#e67e22","#d35400","#f39c12","#8B4513","#CD853F","#A0522D"];
interface Leaf { x: number; y: number; r: number; angle: number; spin: number; speed: number; drift: number; color: string; opacity: number }

export default function AutumnFall() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    let W = 0, H = 0;
    const leaves: Leaf[] = [];

    function resize() { W = canvas!.width = window.innerWidth; H = canvas!.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 28; i++) {
      leaves.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 5 + 3,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05,
        speed: Math.random() * 1.5 + 0.5,
        drift: (Math.random() - 0.5) * 1.2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: Math.random() * 0.4 + 0.4,
      });
    }

    function drawLeaf(ctx: CanvasRenderingContext2D, leaf: Leaf) {
      ctx.save();
      ctx.translate(leaf.x, leaf.y);
      ctx.rotate(leaf.angle);
      ctx.globalAlpha = leaf.opacity;
      ctx.fillStyle = leaf.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, leaf.r, leaf.r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Stem
      ctx.strokeStyle = leaf.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(leaf.r * 1.2, 0);
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const l of leaves) {
        drawLeaf(ctx, l);
        l.y += l.speed;
        l.x += l.drift + Math.sin(l.angle) * 0.5;
        l.angle += l.spin;
        if (l.y > H + 20) { l.y = -20; l.x = Math.random() * W; }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-[60]" />;
}
