import { useEffect, useRef, type ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import {
  burst,
  drawParticles,
  prepareCanvas,
  startLoop,
  updateParticles,
  useFitCanvas,
  useLatest,
  type Particle,
} from "@/lib/arcade/engine";
import { alpha, readPalette } from "@/lib/arcade/palette";
import { TouchButton } from "../TouchButton";
import type { GameProps } from "../types";

const COLS = 24;
const ROWS = 16;
const CELL = 30;
const W = COLS * CELL;
const H = ROWS * CELL;

type Vec = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";
const DIRS: Record<Dir, Vec> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};
const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };

export function SnakeX({ paused, runId, sfx, onScore, onGameOver }: GameProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useLatest(paused);
  const sfxRef = useLatest(sfx);
  const onScoreRef = useLatest(onScore);
  const onOverRef = useLatest(onGameOver);
  const turnRef = useRef<(d: Dir) => void>(() => {});

  useFitCanvas(wrapRef, canvasRef, W, H);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = prepareCanvas(canvas, W, H);
    const pal = readPalette();

    let snake: Vec[] = [
      { x: 8, y: 8 },
      { x: 7, y: 8 },
      { x: 6, y: 8 },
      { x: 5, y: 8 },
    ];
    let prev: Vec[] = snake.map((s) => ({ x: s.x - 1, y: s.y }));
    let dir: Dir = "right";
    const queue: Dir[] = [];
    let stepTime = 0.13;
    let acc = 0;
    let score = 0;
    let over = false;
    let food = { x: 16, y: 8 };
    let bonus: (Vec & { ttl: number }) | null = null;
    let eaten = 0;
    const particles: Particle[] = [];

    onScoreRef.current(0);

    const free = (): Vec => {
      for (let tries = 0; tries < 500; tries++) {
        const c = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
        const taken =
          snake.some((s) => s.x === c.x && s.y === c.y) ||
          (food.x === c.x && food.y === c.y) ||
          (bonus && bonus.x === c.x && bonus.y === c.y);
        if (!taken) return c;
      }
      return { x: 0, y: 0 };
    };

    const turn = (d: Dir) => {
      if (pausedRef.current || over) return;
      const last = queue[queue.length - 1] ?? dir;
      if (d === last || d === OPPOSITE[last] || queue.length >= 3) return;
      queue.push(d);
    };
    turnRef.current = turn;

    const step = () => {
      if (queue.length) dir = queue.shift()!;
      const v = DIRS[dir];
      const first = snake[0]!;
      const head = { x: first.x + v.x, y: first.y + v.y };
      const eatsFood = head.x === food.x && head.y === food.y;
      const eatsBonus = !!bonus && head.x === bonus.x && head.y === bonus.y;
      const grows = eatsFood || eatsBonus;
      const body = grows ? snake : snake.slice(0, -1);
      const hitWall = head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS;
      const hitSelf = body.some((s) => s.x === head.x && s.y === head.y);
      if (hitWall || hitSelf) {
        over = true;
        burst(particles, first.x * CELL + CELL / 2, first.y * CELL + CELL / 2, pal.green, 40, 300);
        sfxRef.current.play("hit");
        onOverRef.current({ score, detail: `Length ${snake.length}` });
        return;
      }
      prev = snake.map((s) => ({ ...s }));
      snake = [head, ...body];
      if (grows) prev.push({ ...prev[prev.length - 1]! });

      if (eatsFood) {
        score += 10;
        eaten++;
        stepTime = Math.max(0.065, stepTime - 0.003);
        burst(particles, food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, pal.pink, 16, 160);
        sfxRef.current.play("eat");
        food = free();
        if (!bonus && eaten % 5 === 0) bonus = { ...free(), ttl: 6 };
        onScoreRef.current(score);
      }
      if (eatsBonus && bonus) {
        score += 50;
        burst(particles, bonus.x * CELL + CELL / 2, bonus.y * CELL + CELL / 2, pal.amber, 28, 220);
        sfxRef.current.play("bonus");
        bonus = null;
        onScoreRef.current(score);
      }
    };

    const center = (v: Vec) => ({ x: v.x * CELL + CELL / 2, y: v.y * CELL + CELL / 2 });

    const draw = (time: number) => {
      ctx.fillStyle = pal.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(x * CELL + 0.5, 0);
        ctx.lineTo(x * CELL + 0.5, H);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * CELL + 0.5);
        ctx.lineTo(W, y * CELL + 0.5);
        ctx.stroke();
      }

      // Food
      const pulse = 1 + Math.sin(time * 6) * 0.12;
      const f = center(food);
      ctx.shadowColor = pal.pink;
      ctx.shadowBlur = 20;
      ctx.fillStyle = pal.pink;
      ctx.beginPath();
      ctx.arc(f.x, f.y, 8 * pulse, 0, Math.PI * 2);
      ctx.fill();
      if (bonus) {
        const b = center(bonus);
        ctx.shadowColor = pal.amber;
        ctx.fillStyle = pal.amber;
        ctx.globalAlpha = bonus.ttl < 2 ? 0.5 + 0.5 * Math.sin(time * 18) : 1;
        ctx.beginPath();
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? 12 * pulse : 5;
          const a = (Math.PI / 5) * i - Math.PI / 2 + time;
          ctx.lineTo(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Snake (interpolated between grid steps for smooth motion)
      const t = over ? 1 : Math.min(1, acc / stepTime);
      const pts = snake.map((s, i) => {
        const p = prev[i] ?? s;
        return center({ x: p.x + (s.x - p.x) * t, y: p.y + (s.y - p.y) * t });
      });
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = pal.green;
      ctx.shadowBlur = over ? 0 : 18;
      ctx.strokeStyle = over ? alpha(pal.green, 0.35) : pal.green;
      ctx.lineWidth = CELL * 0.62;
      ctx.beginPath();
      pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = alpha(pal.cyan, 0.55);
      ctx.lineWidth = CELL * 0.22;
      ctx.stroke();

      const head = pts[0]!;
      ctx.fillStyle = pal.cyan;
      ctx.shadowColor = pal.cyan;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(head.x, head.y, CELL * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      const v = DIRS[queue[0] ?? dir];
      ctx.fillStyle = pal.bg;
      const ex = -v.y * 6;
      const ey = v.x * 6;
      ctx.beginPath();
      ctx.arc(head.x + v.x * 4 + ex, head.y + v.y * 4 + ey, 3, 0, Math.PI * 2);
      ctx.arc(head.x + v.x * 4 - ex, head.y + v.y * 4 - ey, 3, 0, Math.PI * 2);
      ctx.fill();

      drawParticles(ctx, particles);
    };

    const stop = startLoop((dt, time) => {
      if (!pausedRef.current && !over) {
        acc += dt;
        while (acc >= stepTime && !over) {
          acc -= stepTime;
          step();
        }
        if (bonus) {
          bonus.ttl -= dt;
          if (bonus.ttl <= 0) bonus = null;
        }
      }
      updateParticles(particles, dt);
      draw(time);
    });

    const keyMap: Record<string, Dir> = {
      ArrowUp: "up",
      KeyW: "up",
      ArrowDown: "down",
      KeyS: "down",
      ArrowLeft: "left",
      KeyA: "left",
      ArrowRight: "right",
      KeyD: "right",
    };
    const onKey = (e: KeyboardEvent) => {
      const d = keyMap[e.code];
      if (d) turn(d);
    };
    window.addEventListener("keydown", onKey);

    let start: Vec | null = null;
    const onDown = (e: PointerEvent) => {
      start = { x: e.clientX, y: e.clientY };
    };
    const onUp = (e: PointerEvent) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      start = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return;
      turn(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);

    return () => {
      stop();
      window.removeEventListener("keydown", onKey);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
    };
  }, [runId, pausedRef, sfxRef, onScoreRef, onOverRef]);

  const pad = (d: Dir, label: string, icon: ReactNode) => (
    <TouchButton label={label} onPress={() => turnRef.current(d)}>
      {icon}
    </TouchButton>
  );

  return (
    <div className="flex h-full w-full flex-col short-landscape:flex-row short-landscape:gap-4">
      <div ref={wrapRef} className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
        <canvas
          ref={canvasRef}
          className="touch-none rounded-2xl border border-glass-border"
          role="img"
          aria-label="Snake X game board. Use arrow keys, WASD or swipe to steer."
        />
      </div>
      <div className="hidden shrink-0 justify-center pt-3 max-md:flex pointer-coarse:flex short-landscape:items-center short-landscape:pt-0">
        <div className="grid grid-cols-3 gap-2">
          <span />
          {pad("up", "Up", <ArrowUp />)}
          <span />
          {pad("left", "Left", <ArrowLeft />)}
          {pad("down", "Down", <ArrowDown />)}
          {pad("right", "Right", <ArrowRight />)}
        </div>
      </div>
    </div>
  );
}
