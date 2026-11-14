import { useEffect, useRef, type RefObject } from "react";

/** Sizes the canvas backing store for crisp drawing and returns a context in logical units. */
export function prepareCanvas(canvas: HTMLCanvasElement, width: number, height: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not supported in this browser");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/** requestAnimationFrame loop with clamped delta time (seconds). Returns a stop function. */
export function startLoop(step: (dt: number, time: number) => void) {
  let raf = 0;
  let last = performance.now();
  let alive = true;
  const tick = (now: number) => {
    if (!alive) return;
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    step(dt, now / 1000);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    alive = false;
    cancelAnimationFrame(raf);
  };
}

/** Scales the canvas (CSS size) to fit its wrapper while keeping the aspect ratio. */
export function useFitCanvas(
  wrapRef: RefObject<HTMLElement | null>,
  canvasRef: RefObject<HTMLCanvasElement | null>,
  width: number,
  height: number,
) {
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const fit = () => {
      const scale = Math.min(wrap.clientWidth / width, wrap.clientHeight / height);
      if (!Number.isFinite(scale) || scale <= 0) return;
      canvas.style.width = `${Math.floor(width * scale)}px`;
      canvas.style.height = `${Math.floor(height * scale)}px`;
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [wrapRef, canvasRef, width, height]);
}

/** Keeps the latest value in a ref so long-lived game loops never read stale props. */
export function useLatest<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

export function overlaps(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
}

export function burst(list: Particle[], x: number, y: number, color: string, count = 24, speed = 260) {
  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = rand(speed * 0.3, speed);
    const life = rand(0.4, 0.9);
    list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life, max: life, color, size: rand(2, 4.5) });
  }
}

export function updateParticles(list: Particle[], dt: number, gravity = 0) {
  for (let i = list.length - 1; i >= 0; i--) {
    const p = list[i]!;
    p.life -= dt;
    if (p.life <= 0) {
      list.splice(i, 1);
      continue;
    }
    p.vy += gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  }
}

export function drawParticles(ctx: CanvasRenderingContext2D, list: Particle[]) {
  for (const p of list) {
    ctx.globalAlpha = Math.max(0, p.life / p.max);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
