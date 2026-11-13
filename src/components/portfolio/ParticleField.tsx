import { useEffect, useRef } from "react";
import { alpha, readPalette } from "@/lib/arcade/palette";

/** Fixed ambient particle layer behind the whole page. Static when reduced motion is on. */
export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pal = readPalette();
    const colors = [pal.primary, pal.accent, pal.cyan, pal.fg];
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let raf = 0;
    type Dot = { x: number; y: number; r: number; vx: number; vy: number; c: string; tw: number };
    let dots: Dot[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, (w * h) / 18000));
      dots = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(Math.random() * 0.25 + 0.05),
        c: colors[Math.floor(Math.random() * colors.length)],
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        if (!reduce) {
          d.x += d.vx;
          d.y += d.vy;
          if (d.y < -10) {
            d.y = h + 10;
            d.x = Math.random() * w;
          }
          if (d.x < -10) d.x = w + 10;
          if (d.x > w + 10) d.x = -10;
        }
        const a = 0.35 + Math.sin(t / 900 + d.tw) * 0.25;
        ctx.fillStyle = alpha(d.c, Math.max(0.08, a));
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = (t: number) => {
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    resize();
    if (reduce) draw(0);
    else raf = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10" />;
}
