import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, ChevronsDown, ChevronsUp } from "lucide-react";
import {
  burst,
  drawParticles,
  prepareCanvas,
  rand,
  startLoop,
  updateParticles,
  useFitCanvas,
  useLatest,
  type Particle,
} from "@/lib/arcade/engine";
import { alpha, readPalette, type Palette } from "@/lib/arcade/palette";
import { TouchButton, TouchControls } from "../TouchButton";
import type { GameProps } from "../types";

const W = 420;
const H = 640;
const ROAD_L = 40;
const ROAD_R = 380;
const LANES = 4;
const LANE_W = (ROAD_R - ROAD_L) / LANES;
const CAR_W = 44;
const CAR_H = 78;

interface Car {
  x: number;
  y: number;
  speed: number;
  color: keyof Pick<Palette, "pink" | "amber" | "accent" | "green">;
  passed: boolean;
}

type Control = "left" | "right" | "gas" | "brake";

export function CyberRacer({ paused, runId, sfx, onScore, onGameOver }: GameProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useLatest(paused);
  const sfxRef = useLatest(sfx);
  const onScoreRef = useLatest(onScore);
  const onOverRef = useLatest(onGameOver);
  const held = useRef<Record<Control, boolean>>({ left: false, right: false, gas: false, brake: false });
  const pointerX = useRef<number | null>(null);

  useFitCanvas(wrapRef, canvasRef, W, H);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = prepareCanvas(canvas, W, H);
    const pal = readPalette();
    held.current = { left: false, right: false, gas: false, brake: false };

    const player = { x: W / 2 - CAR_W / 2, y: H - 130, vx: 0 };
    const cars: Car[] = [];
    const particles: Particle[] = [];
    const streaks = Array.from({ length: 24 }, () => ({ x: rand(0, W), y: rand(0, H), l: rand(20, 60) }));
    let speed = 320;
    let time = 0;
    let distance = 0;
    let bonus = 0;
    let score = 0;
    let over = false;
    let nextSpawn = 200;
    let lineOffset = 0;

    onScoreRef.current(0);

    const colors: Car["color"][] = ["pink", "amber", "accent", "green"];

    const spawn = () => {
      const lane = Math.floor(Math.random() * LANES);
      const x = ROAD_L + lane * LANE_W + (LANE_W - CAR_W) / 2;
      const blocked = cars.some((c) => c.y < 40 && Math.abs(c.x - x) < CAR_W);
      if (blocked) return;
      // Never fill every lane in the same band — always leave an escape route.
      const band = cars.filter((c) => c.y < 120);
      const bandLanes = new Set(band.map((c) => Math.round((c.x - ROAD_L) / LANE_W - 0.25)));
      bandLanes.add(lane);
      if (bandLanes.size >= LANES) return;
      cars.push({
        x,
        y: -CAR_H - 20,
        speed: rand(150, 250) + Math.min(120, time * 2),
        color: colors[Math.floor(Math.random() * colors.length)] ?? "pink",
        passed: false,
      });
    };

    const update = (dt: number) => {
      time += dt;
      const cruise = Math.min(720, 320 + time * 7);
      const h = held.current;
      const target = h.gas ? cruise + 220 : h.brake ? 170 : cruise;
      speed += (target - speed) * Math.min(1, dt * (h.brake ? 3 : 1.6));

      let steer = (h.right ? 1 : 0) - (h.left ? 1 : 0);
      if (pointerX.current != null) {
        const diff = pointerX.current - (player.x + CAR_W / 2);
        steer = Math.abs(diff) < 6 ? 0 : Math.sign(diff);
      }
      const targetVx = steer * 340;
      player.vx += (targetVx - player.vx) * Math.min(1, dt * 12);
      player.x = Math.max(ROAD_L + 4, Math.min(ROAD_R - CAR_W - 4, player.x + player.vx * dt));

      distance += speed * dt;
      lineOffset = (lineOffset + speed * dt) % 60;
      for (const s of streaks) {
        s.y += speed * dt * 1.6;
        if (s.y > H) {
          s.y = -s.l;
          s.x = rand(0, W);
        }
      }

      nextSpawn -= speed * dt;
      if (nextSpawn <= 0) {
        spawn();
        if (Math.random() < Math.min(0.45, time / 120)) spawn();
        nextSpawn = Math.max(150, 330 - time * 2.5) + rand(0, 140);
      }

      const pBox = { x: player.x + 6, y: player.y + 6, w: CAR_W - 12, h: CAR_H - 10 };
      for (let i = cars.length - 1; i >= 0; i--) {
        const c = cars[i]!;
        c.y += (speed - c.speed) * dt;
        if (c.y > H + 120 || c.y < -400) {
          cars.splice(i, 1);
          continue;
        }
        if (!c.passed && c.y > player.y + CAR_H) {
          c.passed = true;
          bonus += 25;
          sfxRef.current.play("score");
        }
        const b = { x: c.x + 6, y: c.y + 6, w: CAR_W - 12, h: CAR_H - 10 };
        if (pBox.x < b.x + b.w && pBox.x + pBox.w > b.x && pBox.y < b.y + b.h && pBox.y + pBox.h > b.y) {
          over = true;
          burst(particles, player.x + CAR_W / 2, player.y + 10, pal.amber, 40, 320);
          burst(particles, player.x + CAR_W / 2, player.y + 10, pal.cyan, 30, 260);
          sfxRef.current.play("hit");
          onOverRef.current({ score, detail: `${Math.floor(distance / 10)} m driven` });
          return;
        }
      }

      const next = Math.floor(distance / 10) + bonus;
      if (next !== score) {
        score = next;
        onScoreRef.current(score);
      }
    };

    const drawCar = (x: number, y: number, body: string, isPlayer: boolean) => {
      ctx.save();
      ctx.shadowColor = body;
      ctx.shadowBlur = isPlayer ? 26 : 14;
      ctx.fillStyle = alpha(body, 0.25);
      ctx.strokeStyle = body;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(x, y, CAR_W, CAR_H, 12);
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = alpha(pal.bg, 0.85);
      ctx.beginPath();
      ctx.roundRect(x + 8, y + (isPlayer ? 18 : 30), CAR_W - 16, 26, 6);
      ctx.fill();
      // lights: player shows headlights at the top, traffic shows taillights at the bottom
      ctx.fillStyle = isPlayer ? pal.fg : pal.red;
      const ly = isPlayer ? y + 3 : y + CAR_H - 7;
      ctx.fillRect(x + 6, ly, 10, 4);
      ctx.fillRect(x + CAR_W - 16, ly, 10, 4);
      ctx.restore();
    };

    const draw = () => {
      ctx.fillStyle = pal.bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = pal.road;
      ctx.fillRect(ROAD_L, 0, ROAD_R - ROAD_L, H);

      ctx.strokeStyle = alpha(pal.fg, 0.08);
      ctx.lineWidth = 2;
      for (const s of streaks) {
        if (s.x > ROAD_L && s.x < ROAD_R) continue;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x, s.y + s.l);
        ctx.stroke();
      }

      ctx.strokeStyle = alpha(pal.primary, 0.55);
      ctx.lineWidth = 3;
      ctx.setLineDash([30, 30]);
      ctx.lineDashOffset = -lineOffset;
      for (let i = 1; i < LANES; i++) {
        const x = ROAD_L + i * LANE_W;
        ctx.beginPath();
        ctx.moveTo(x, -60);
        ctx.lineTo(x, H + 60);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      ctx.shadowBlur = 18;
      ctx.lineWidth = 4;
      ctx.shadowColor = pal.cyan;
      ctx.strokeStyle = pal.cyan;
      ctx.beginPath();
      ctx.moveTo(ROAD_L, 0);
      ctx.lineTo(ROAD_L, H);
      ctx.stroke();
      ctx.shadowColor = pal.pink;
      ctx.strokeStyle = pal.pink;
      ctx.beginPath();
      ctx.moveTo(ROAD_R, 0);
      ctx.lineTo(ROAD_R, H);
      ctx.stroke();
      ctx.shadowBlur = 0;

      for (const c of cars) drawCar(c.x, c.y, pal[c.color], false);
      if (!over) {
        // exhaust glow
        ctx.fillStyle = alpha(pal.cyan, 0.25 + Math.random() * 0.15);
        ctx.fillRect(player.x + 10, player.y + CAR_H, 8, 10 + speed / 60);
        ctx.fillRect(player.x + CAR_W - 18, player.y + CAR_H, 8, 10 + speed / 60);
        drawCar(player.x, player.y, pal.cyan, true);
      }
      drawParticles(ctx, particles);

      ctx.fillStyle = alpha(pal.bg, 0.6);
      ctx.beginPath();
      ctx.roundRect(ROAD_L + 8, 10, 120, 46, 10);
      ctx.fill();
      ctx.fillStyle = pal.fg;
      ctx.font = "700 20px 'JetBrains Mono', monospace";
      ctx.fillText(`${Math.round(speed / 3)}`, ROAD_L + 18, 36);
      ctx.fillStyle = pal.muted;
      ctx.font = "600 10px 'JetBrains Mono', monospace";
      ctx.fillText("KM/H", ROAD_L + 70, 36);
      ctx.fillText(`${Math.floor(distance / 10)} M`, ROAD_L + 18, 50);
    };

    const stop = startLoop((dt) => {
      if (!pausedRef.current && !over) update(dt);
      updateParticles(particles, dt);
      draw();
    });

    const keyMap: Record<string, Control> = {
      ArrowLeft: "left",
      KeyA: "left",
      ArrowRight: "right",
      KeyD: "right",
      ArrowUp: "gas",
      KeyW: "gas",
      ArrowDown: "brake",
      KeyS: "brake",
    };
    const down = (e: KeyboardEvent) => {
      const c = keyMap[e.code];
      if (c) held.current[c] = true;
    };
    const up = (e: KeyboardEvent) => {
      const c = keyMap[e.code];
      if (c) held.current[c] = false;
    };
    const toLocal = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return ((e.clientX - rect.left) / rect.width) * W;
    };
    const pDown = (e: PointerEvent) => {
      canvas.setPointerCapture?.(e.pointerId);
      pointerX.current = toLocal(e);
    };
    const pMove = (e: PointerEvent) => {
      if (pointerX.current != null) pointerX.current = toLocal(e);
    };
    const pUp = () => {
      pointerX.current = null;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    canvas.addEventListener("pointerdown", pDown);
    canvas.addEventListener("pointermove", pMove);
    canvas.addEventListener("pointerup", pUp);
    canvas.addEventListener("pointercancel", pUp);
    return () => {
      stop();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      canvas.removeEventListener("pointerdown", pDown);
      canvas.removeEventListener("pointermove", pMove);
      canvas.removeEventListener("pointerup", pUp);
      canvas.removeEventListener("pointercancel", pUp);
      pointerX.current = null;
    };
  }, [runId, pausedRef, sfxRef, onScoreRef, onOverRef]);

  const hold = (c: Control) => ({
    onPress: () => {
      held.current[c] = true;
    },
    onRelease: () => {
      held.current[c] = false;
    },
  });

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={wrapRef} className="flex min-h-0 flex-1 items-center justify-center">
        <canvas
          ref={canvasRef}
          className="touch-none rounded-2xl border border-glass-border"
          role="img"
          aria-label="Cyber Racer road. Steer with arrow keys or A and D, accelerate with up, brake with down."
        />
      </div>
      <TouchControls>
        <TouchButton label="Steer left" {...hold("left")}>
          <ArrowLeft />
        </TouchButton>
        <TouchButton label="Brake" {...hold("brake")}>
          <ChevronsDown />
        </TouchButton>
        <TouchButton label="Boost" {...hold("gas")}>
          <ChevronsUp />
        </TouchButton>
        <TouchButton label="Steer right" {...hold("right")}>
          <ArrowRight />
        </TouchButton>
      </TouchControls>
    </div>
  );
}
