import { useEffect, useRef } from "react";
import { ArrowUp } from "lucide-react";
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
import { TouchButton, TouchControls } from "../TouchButton";
import type { GameProps } from "../types";

const W = 800;
const H = 400;
const GROUND = 320;
const GRAVITY = 2600;
const JUMP_V = 860;
const START_SPEED = 380;
const MAX_SPEED = 920;

interface Obstacle {
  x: number;
  w: number;
  h: number;
  kind: "spike" | "block";
  count: number;
}

export function NeonJump({ paused, runId, sfx, onScore, onGameOver }: GameProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useLatest(paused);
  const sfxRef = useLatest(sfx);
  const onScoreRef = useLatest(onScore);
  const onOverRef = useLatest(onGameOver);
  const input = useRef({ press: () => {}, release: () => {} });

  useFitCanvas(wrapRef, canvasRef, W, H);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = prepareCanvas(canvas, W, H);
    const pal = readPalette();

    const player = { x: 110, y: GROUND - 34, w: 34, h: 34, vy: 0, onGround: true, rot: 0 };
    const obstacles: Obstacle[] = [];
    const particles: Particle[] = [];
    const trail: { x: number; y: number; life: number }[] = [];
    let speed = START_SPEED;
    let distance = 0;
    let nextSpawn = 520;
    let score = 0;
    let over = false;
    let jumpBuffer = 0;
    let coyote = 0;
    let holding = false;
    let bgOffset = 0;

    onScoreRef.current(0);

    const press = () => {
      if (pausedRef.current || over) return;
      holding = true;
      jumpBuffer = 0.12;
    };
    const release = () => {
      holding = false;
      if (player.vy < -320) player.vy = -320;
    };
    input.current = { press, release };

    const spawn = () => {
      const roll = Math.random();
      if (roll < 0.55) {
        const count = 1 + Math.floor(Math.random() * (speed > 600 ? 3 : 2));
        obstacles.push({ x: W + 20, w: count * 26, h: 34, kind: "spike", count });
      } else {
        const h = 40 + Math.random() * (speed > 560 ? 34 : 22);
        obstacles.push({ x: W + 20, w: 34 + Math.random() * 22, h, kind: "block", count: 1 });
      }
      const minGap = speed * 0.62 + 150;
      nextSpawn = minGap + Math.random() * speed * 0.75;
    };

    const update = (dt: number) => {
      speed = Math.min(MAX_SPEED, speed + 14 * dt);
      const dx = speed * dt;
      distance += dx;
      bgOffset = (bgOffset + dx) % 48;
      nextSpawn -= dx;
      if (nextSpawn <= 0) spawn();

      jumpBuffer = Math.max(0, jumpBuffer - dt);
      coyote = player.onGround ? 0.08 : Math.max(0, coyote - dt);
      if (jumpBuffer > 0 && coyote > 0) {
        player.vy = -JUMP_V;
        player.onGround = false;
        jumpBuffer = 0;
        coyote = 0;
        sfxRef.current.play("jump");
        if (!holding) player.vy = -JUMP_V * 0.78;
      }

      player.vy += GRAVITY * dt;
      player.y += player.vy * dt;
      if (player.y + player.h >= GROUND) {
        player.y = GROUND - player.h;
        player.vy = 0;
        if (!player.onGround) player.rot = Math.round(player.rot / (Math.PI / 2)) * (Math.PI / 2);
        player.onGround = true;
      } else {
        player.onGround = false;
        player.rot += dt * 7.2;
      }

      trail.push({ x: player.x + player.w / 2, y: player.y + player.h / 2, life: 0.35 });
      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].x -= dx;
        trail[i].life -= dt;
        if (trail[i].life <= 0) trail.splice(i, 1);
      }

      const box = { x: player.x + 5, y: player.y + 5, w: player.w - 10, h: player.h - 6 };
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const o = obstacles[i];
        o.x -= dx;
        if (o.x + o.w < -40) {
          obstacles.splice(i, 1);
          continue;
        }
        const hit =
          o.kind === "spike"
            ? { x: o.x + 6, y: GROUND - o.h + 12, w: o.w - 12, h: o.h - 12 }
            : { x: o.x, y: GROUND - o.h, w: o.w, h: o.h };
        if (box.x < hit.x + hit.w && box.x + box.w > hit.x && box.y < hit.y + hit.h && box.y + box.h > hit.y) {
          over = true;
          burst(particles, player.x + player.w / 2, player.y + player.h / 2, pal.cyan, 40, 340);
          burst(particles, player.x + player.w / 2, player.y + player.h / 2, pal.pink, 20, 260);
          sfxRef.current.play("hit");
          onOverRef.current({ score });
          return;
        }
      }

      const nextScore = Math.floor(distance / 20);
      if (nextScore !== score) {
        if (Math.floor(nextScore / 100) > Math.floor(score / 100)) sfxRef.current.play("score");
        score = nextScore;
        onScoreRef.current(score);
      }
    };

    const draw = (time: number) => {
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, pal.bg);
      sky.addColorStop(0.8, alpha(pal.accent, 0.28));
      sky.addColorStop(1, pal.bg);
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Synth sun
      const sunX = 620;
      const sunY = GROUND - 20;
      const sun = ctx.createLinearGradient(0, sunY - 90, 0, sunY);
      sun.addColorStop(0, pal.amber);
      sun.addColorStop(1, pal.pink);
      ctx.save();
      ctx.beginPath();
      ctx.arc(sunX, sunY, 90, Math.PI, 0);
      ctx.fillStyle = sun;
      ctx.globalAlpha = 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = pal.bg;
      for (let i = 0; i < 6; i++) ctx.fillRect(sunX - 95, sunY - 12 - i * 13, 190, 3 + i * 0.4);
      ctx.restore();

      // Floor grid
      ctx.fillStyle = pal.bg;
      ctx.fillRect(0, GROUND, W, H - GROUND);
      ctx.strokeStyle = alpha(pal.primary, 0.35);
      ctx.lineWidth = 1;
      for (let x = -bgOffset; x < W + 48; x += 48) {
        ctx.beginPath();
        ctx.moveTo(x, GROUND);
        ctx.lineTo(W / 2 + (x - W / 2) * 2.4, H);
        ctx.stroke();
      }
      for (let i = 1; i < 6; i++) {
        const y = GROUND + (i * i * (H - GROUND)) / 25;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
      ctx.shadowColor = pal.primary;
      ctx.shadowBlur = 14;
      ctx.strokeStyle = pal.primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, GROUND);
      ctx.lineTo(W, GROUND);
      ctx.stroke();

      // Obstacles
      for (const o of obstacles) {
        ctx.shadowColor = pal.pink;
        ctx.shadowBlur = 16;
        ctx.strokeStyle = pal.pink;
        ctx.fillStyle = alpha(pal.pink, 0.22);
        ctx.lineWidth = 2.5;
        if (o.kind === "spike") {
          for (let i = 0; i < o.count; i++) {
            const sx = o.x + i * 26;
            ctx.beginPath();
            ctx.moveTo(sx, GROUND);
            ctx.lineTo(sx + 13, GROUND - o.h);
            ctx.lineTo(sx + 26, GROUND);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
          }
        } else {
          ctx.strokeStyle = pal.accent;
          ctx.shadowColor = pal.accent;
          ctx.fillStyle = alpha(pal.accent, 0.25);
          ctx.beginPath();
          ctx.roundRect(o.x, GROUND - o.h, o.w, o.h, 4);
          ctx.fill();
          ctx.stroke();
        }
      }

      // Trail
      ctx.shadowBlur = 0;
      for (const t of trail) {
        ctx.globalAlpha = (t.life / 0.35) * 0.5;
        ctx.fillStyle = pal.cyan;
        const s = 26 * (t.life / 0.35);
        ctx.fillRect(t.x - s / 2, t.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;

      // Player
      if (!over) {
        ctx.save();
        ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
        ctx.rotate(player.rot);
        ctx.shadowColor = pal.cyan;
        ctx.shadowBlur = 24;
        ctx.fillStyle = alpha(pal.cyan, 0.3);
        ctx.strokeStyle = pal.cyan;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-player.w / 2, -player.h / 2, player.w, player.h, 6);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = pal.fg;
        ctx.fillRect(-8, -7, 5, 10);
        ctx.fillRect(4, -7, 5, 10);
        ctx.restore();
      }

      ctx.shadowBlur = 0;
      drawParticles(ctx, particles);

      // Speed meter
      ctx.fillStyle = alpha(pal.fg, 0.7);
      ctx.font = "600 13px 'JetBrains Mono', monospace";
      ctx.fillText(`SPEED ${Math.round((speed / START_SPEED) * 100)}%`, 16, 26);
      if (pausedRef.current && !over && distance === 0) {
        ctx.fillStyle = alpha(pal.fg, 0.5 + Math.sin(time * 4) * 0.2);
        ctx.fillText("READY", player.x - 4, player.y - 14);
      }
    };

    const stop = startLoop((dt, time) => {
      if (!pausedRef.current && !over) update(dt);
      if (over) updateParticles(particles, dt, 600);
      draw(time);
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") press();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") release();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      stop();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [runId, pausedRef, sfxRef, onScoreRef, onOverRef]);

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={wrapRef} className="flex min-h-0 flex-1 items-center justify-center">
        <canvas
          ref={canvasRef}
          className="touch-none rounded-2xl border border-glass-border"
          aria-label="Neon Jump game area. Press space or tap to jump."
          role="img"
          onPointerDown={(e) => {
            e.preventDefault();
            input.current.press();
          }}
          onPointerUp={() => input.current.release()}
        />
      </div>
      <TouchControls>
        <TouchButton
          label="Jump"
          onPress={() => input.current.press()}
          onRelease={() => input.current.release()}
          className="w-40"
        >
          <ArrowUp /> JUMP
        </TouchButton>
      </TouchControls>
    </div>
  );
}
