import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import {
  burst,
  drawParticles,
  overlaps,
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
import { COLS, LEVELS, ROWS, TILE, findTile } from "./devil-trap-levels";

const W = COLS * TILE;
const H = ROWS * TILE;
const PW = 18;
const PH = 22;
const RUN = 220;
const GRAVITY = 1800;
const JUMP_V = 560;
const MAX_FALL = 900;
const STEP = 1 / 120;
const CRUMBLE_DELAY = 0.35;
const MOVER_H = 12;

type Rect = { x: number; y: number; w: number; h: number };
interface Mover extends Rect {
  x0: number;
  y0: number;
  axis: "x" | "y";
  range: number;
  omega: number;
  phase: number;
  dx: number;
  dy: number;
}
type Phase = "play" | "dying" | "clear" | "won";
type Control = "left" | "right" | "jump";

export function DevilTrap({ paused, runId, sfx, onScore, onGameOver }: GameProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pausedRef = useLatest(paused);
  const sfxRef = useLatest(sfx);
  const onScoreRef = useLatest(onScore);
  const onOverRef = useLatest(onGameOver);
  const controls = useRef({ press: (_c: Control) => {}, release: (_c: Control) => {} });

  useFitCanvas(wrapRef, canvasRef, W, H);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = prepareCanvas(canvas, W, H);
    const pal = readPalette();

    const held = { left: false, right: false, jump: false };
    const particles: Particle[] = [];
    const p = { x: 0, y: 0, vx: 0, vy: 0, face: 1 };
    let levelIndex = 0;
    let map: string[] = [];
    let movers: Mover[] = [];
    let respawn = { x: 0, y: 0 };
    let crumble = new Map<string, number>(); // key -> seconds since touched; >= delay means gone
    let popped = new Map<string, number>(); // hidden spikes -> pop animation 0..1
    let checkpoints = new Set<string>();
    let grounded = false;
    let riding: Mover | null = null;
    let coyote = 0;
    let jumpBuffer = 0;
    let phase: Phase = "play";
    let phaseTimer = 0;
    let deaths = 0;
    let cleared = 0;
    let score = 0;
    let acc = 0;
    let flash = 0;

    const key = (c: number, r: number) => `${c},${r}`;
    const tileAt = (c: number, r: number) => (r < 0 || r >= ROWS || c < 0 || c >= COLS ? "#" : map[r][c]);

    const pushScore = () => {
      const next = Math.max(0, cleared * 1000 - deaths * 25);
      if (next !== score) {
        score = next;
        onScoreRef.current(score);
      }
    };

    const placeAt = (c: number, r: number) => ({ x: c * TILE + (TILE - PW) / 2, y: (r + 1) * TILE - PH });

    const resetPlayer = () => {
      p.x = respawn.x;
      p.y = respawn.y;
      p.vx = 0;
      p.vy = 0;
      grounded = false;
      riding = null;
      crumble = new Map();
      popped = new Map();
    };

    const loadLevel = (i: number) => {
      levelIndex = i;
      const def = LEVELS[i];
      map = def.map;
      movers = def.movers.map((m) => {
        const x0 = m.tx * TILE;
        const y0 = m.ty * TILE;
        return {
          x: x0,
          y: y0,
          w: m.w * TILE,
          h: MOVER_H,
          x0,
          y0,
          axis: m.axis,
          range: m.range * TILE,
          omega: (Math.PI * m.speed) / (Math.abs(m.range) * TILE),
          phase: 0,
          dx: 0,
          dy: 0,
        };
      });
      const s = findTile(map, "S") ?? { c: 2, r: 15 };
      respawn = placeAt(s.c, s.r);
      checkpoints = new Set();
      resetPlayer();
      phase = "play";
    };

    onScoreRef.current(0);
    loadLevel(0);

    const solidsNear = (box: Rect): (Rect & { mover?: Mover })[] => {
      const out: (Rect & { mover?: Mover })[] = [];
      const c0 = Math.floor(box.x / TILE) - 1;
      const c1 = Math.floor((box.x + box.w) / TILE) + 1;
      const r0 = Math.floor(box.y / TILE) - 1;
      const r1 = Math.floor((box.y + box.h) / TILE) + 1;
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          if (r >= ROWS) continue;
          const t = tileAt(c, r);
          const solid = t === "#" || (t === "d" && (crumble.get(key(c, r)) ?? 0) < CRUMBLE_DELAY);
          if (solid) out.push({ x: c * TILE, y: r * TILE, w: TILE, h: TILE });
        }
      }
      for (const m of movers) out.push({ x: m.x, y: m.y, w: m.w, h: m.h, mover: m });
      return out;
    };

    const die = () => {
      if (phase !== "play") return;
      phase = "dying";
      phaseTimer = 0.75;
      deaths++;
      flash = 1;
      burst(particles, p.x + PW / 2, p.y + PH / 2, pal.cyan, 36, 300);
      burst(particles, p.x + PW / 2, p.y + PH / 2, pal.red, 16, 220);
      sfxRef.current.play("hit");
      pushScore();
    };

    const physics = (dt: number) => {
      // Moving platforms
      for (const m of movers) {
        m.phase += m.omega * dt;
        const offset = ((1 - Math.cos(m.phase)) / 2) * m.range;
        const nx = m.axis === "x" ? m.x0 + offset : m.x0;
        const ny = m.axis === "y" ? m.y0 + offset : m.y0;
        m.dx = nx - m.x;
        m.dy = ny - m.y;
        m.x = nx;
        m.y = ny;
      }
      if (riding && p.x + PW > riding.x && p.x < riding.x + riding.w) {
        p.x += riding.dx;
        p.y += riding.dy;
      }
      // A platform moving into the player shoves them out instead of trapping them.
      for (const m of movers) {
        if (m === riding || !overlaps({ x: p.x, y: p.y, w: PW, h: PH }, m)) continue;
        if (m.dy < 0 && p.y + PH - m.y < 14) p.y = m.y - PH;
        else if (m.dx > 0) p.x = m.x + m.w;
        else if (m.dx < 0) p.x = m.x - PW;
        else if (m.dy > 0) p.y = m.y + m.h;
      }

      const dir = (held.right ? 1 : 0) - (held.left ? 1 : 0);
      if (dir !== 0) p.face = dir;
      p.vx = dir * RUN;

      coyote = grounded ? 0.08 : Math.max(0, coyote - dt);
      jumpBuffer = Math.max(0, jumpBuffer - dt);
      if (jumpBuffer > 0 && coyote > 0) {
        p.vy = -JUMP_V;
        coyote = 0;
        jumpBuffer = 0;
        grounded = false;
        riding = null;
        sfxRef.current.play("jump");
      }
      if (!held.jump && p.vy < -220) p.vy = -220;
      p.vy = Math.min(MAX_FALL, p.vy + GRAVITY * dt);

      // X axis
      p.x += p.vx * dt;
      for (const s of solidsNear({ x: p.x, y: p.y, w: PW, h: PH })) {
        if (!overlaps({ x: p.x, y: p.y, w: PW, h: PH }, s)) continue;
        if (p.vx > 0) p.x = s.x - PW;
        else if (p.vx < 0) p.x = s.x + s.w;
      }
      // Y axis
      grounded = false;
      riding = null;
      p.y += p.vy * dt;
      for (const s of solidsNear({ x: p.x, y: p.y, w: PW, h: PH })) {
        if (!overlaps({ x: p.x, y: p.y, w: PW, h: PH }, s)) continue;
        if (p.vy > 0) {
          p.y = s.y - PH;
          p.vy = 0;
          grounded = true;
          if (s.mover) riding = s.mover;
        } else if (p.vy < 0) {
          p.y = s.y + s.h;
          p.vy = 0;
        }
      }
      // Crumbling floor under the feet
      if (grounded && !riding) {
        const r = Math.floor((p.y + PH + 1) / TILE);
        for (let c = Math.floor(p.x / TILE); c <= Math.floor((p.x + PW - 1) / TILE); c++) {
          if (tileAt(c, r) === "d" && !crumble.has(key(c, r))) crumble.set(key(c, r), 0);
        }
      }
      for (const [k, t] of crumble) {
        if (t < CRUMBLE_DELAY) {
          const next = t + dt;
          crumble.set(k, next);
          if (next >= CRUMBLE_DELAY) {
            const [c, r] = k.split(",").map(Number);
            burst(particles, c * TILE + TILE / 2, r * TILE + 6, pal.solidEdge, 10, 120);
          }
        }
      }

      // Tiles touching the player
      const box = { x: p.x, y: p.y, w: PW, h: PH };
      const cx = p.x + PW / 2;
      const feet = p.y + PH;
      for (let r = Math.floor(p.y / TILE) - 3; r <= Math.floor(feet / TILE) + 3; r++) {
        for (let c = Math.floor(p.x / TILE) - 3; c <= Math.floor((p.x + PW) / TILE) + 3; c++) {
          if (r < 0 || r >= ROWS || c < 0 || c >= COLS) continue;
          const t = map[r][c];
          const tx = c * TILE;
          const ty = r * TILE;
          if (t === "h" && !popped.has(key(c, r))) {
            if (Math.abs(cx - (tx + TILE / 2)) < 55 && Math.abs(feet - (ty + TILE)) < 50) {
              popped.set(key(c, r), 0);
              sfxRef.current.play("trap");
            }
          }
          const isSpike = t === "^" || (t === "h" && popped.has(key(c, r)));
          if (isSpike && overlaps(box, { x: tx + 4, y: ty + 11, w: 17, h: 14 })) return die();
          if (t === "v" && overlaps(box, { x: tx + 4, y: ty, w: 17, h: 14 })) return die();
          if (t === "C" && overlaps(box, { x: tx, y: ty, w: TILE, h: TILE }) && !checkpoints.has(key(c, r))) {
            checkpoints.add(key(c, r));
            respawn = placeAt(c, r);
            sfxRef.current.play("checkpoint");
            burst(particles, tx + TILE / 2, ty, pal.green, 18, 160);
          }
          if (t === "E" && overlaps(box, { x: tx + 4, y: ty - 10, w: TILE - 8, h: TILE + 10 })) {
            cleared++;
            pushScore();
            sfxRef.current.play("level");
            burst(particles, tx + TILE / 2, ty, pal.accent, 40, 260);
            phase = levelIndex === LEVELS.length - 1 ? "won" : "clear";
            phaseTimer = phase === "won" ? 1.2 : 2.6;
            return;
          }
        }
      }
      for (const [k, v] of popped) if (v < 1) popped.set(k, Math.min(1, v + dt * 14));

      if (p.y > H + 40) die();
    };

    const update = (dt: number) => {
      flash = Math.max(0, flash - dt * 2.5);
      if (phase === "play") {
        acc += dt;
        while (acc >= STEP && phase === "play") {
          acc -= STEP;
          physics(STEP);
        }
      } else if (phase === "dying") {
        phaseTimer -= dt;
        if (phaseTimer <= 0) {
          resetPlayer();
          phase = "play";
          acc = 0;
        }
      } else if (phase === "clear") {
        phaseTimer -= dt;
        if (phaseTimer <= 0) loadLevel(levelIndex + 1);
      } else if (phase === "won") {
        phaseTimer -= dt;
        if (phaseTimer <= 0 && phaseTimer > -100) {
          phaseTimer = -1000;
          sfxRef.current.play("win");
          onOverRef.current({
            score,
            won: true,
            detail: `All ${LEVELS.length} levels cleared · ${deaths} death${deaths === 1 ? "" : "s"}`,
          });
        }
      }
      updateParticles(particles, dt, 500);
    };

    const drawSpike = (x: number, y: number, down: boolean, scale = 1) => {
      ctx.beginPath();
      if (down) {
        ctx.moveTo(x + 2, y);
        ctx.lineTo(x + TILE / 2, y + 18 * scale);
        ctx.lineTo(x + TILE - 2, y);
      } else {
        ctx.moveTo(x + 2, y + TILE);
        ctx.lineTo(x + TILE / 2, y + TILE - 18 * scale);
        ctx.lineTo(x + TILE - 2, y + TILE);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    const draw = (time: number) => {
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, pal.bg);
      bg.addColorStop(1, alpha(pal.red, 0.18));
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = pal.grid;
      ctx.lineWidth = 1;
      for (let x = 0; x <= W; x += TILE * 2) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 0);
        ctx.lineTo(x + 0.5, H);
        ctx.stroke();
      }

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const t = map[r][c];
          const x = c * TILE;
          const y = r * TILE;
          if (t === "#" || t === "f" || t === "d") {
            const ct = crumble.get(key(c, r));
            if (t === "d" && ct != null && ct >= CRUMBLE_DELAY) continue;
            const shake = t === "d" && ct != null ? (Math.random() - 0.5) * 3 : 0;
            ctx.fillStyle = pal.solid;
            ctx.fillRect(x + shake, y, TILE, TILE);
            const above = r > 0 ? map[r - 1][c] : "#";
            if (above !== "#" && above !== "f" && above !== "d") {
              ctx.fillStyle = pal.solidEdge;
              ctx.fillRect(x + shake, y, TILE, 3);
            }
            if (t === "d") {
              ctx.strokeStyle = alpha(pal.fg, 0.35);
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(x + 5 + shake, y + 4);
              ctx.lineTo(x + 11 + shake, y + 13);
              ctx.lineTo(x + 8 + shake, y + 22);
              ctx.moveTo(x + 17 + shake, y + 5);
              ctx.lineTo(x + 14 + shake, y + 14);
              ctx.stroke();
            }
          }
        }
      }

      ctx.shadowColor = pal.red;
      ctx.shadowBlur = 12;
      ctx.fillStyle = alpha(pal.red, 0.35);
      ctx.strokeStyle = pal.red;
      ctx.lineWidth = 2;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const t = map[r][c];
          if (t === "^") drawSpike(c * TILE, r * TILE, false);
          else if (t === "v") drawSpike(c * TILE, r * TILE, true);
          else if (t === "h") {
            const v = popped.get(key(c, r));
            if (v != null) drawSpike(c * TILE, r * TILE, false, v);
          }
        }
      }
      ctx.shadowBlur = 0;

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const t = map[r][c];
          const x = c * TILE;
          const y = r * TILE;
          if (t === "C") {
            const on = checkpoints.has(key(c, r));
            ctx.fillStyle = alpha(pal.fg, 0.6);
            ctx.fillRect(x + 6, y - 14, 2, TILE + 14);
            ctx.fillStyle = on ? pal.green : alpha(pal.muted, 0.6);
            ctx.shadowColor = pal.green;
            ctx.shadowBlur = on ? 14 : 0;
            ctx.beginPath();
            ctx.moveTo(x + 8, y - 14);
            ctx.lineTo(x + 22, y - 8);
            ctx.lineTo(x + 8, y - 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else if (t === "E") {
            const pulse = 0.6 + Math.sin(time * 4) * 0.25;
            ctx.save();
            ctx.shadowColor = pal.accent;
            ctx.shadowBlur = 24;
            ctx.strokeStyle = pal.accent;
            ctx.lineWidth = 3;
            ctx.fillStyle = alpha(pal.accent, 0.25 * pulse + 0.1);
            ctx.beginPath();
            ctx.ellipse(x + TILE / 2, y + 2, 10, 22, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
          }
        }
      }

      for (const m of movers) {
        ctx.shadowColor = pal.cyan;
        ctx.shadowBlur = 14;
        ctx.fillStyle = alpha(pal.cyan, 0.35);
        ctx.strokeStyle = pal.cyan;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(m.x + 1, m.y, m.w - 2, m.h, 4);
        ctx.fill();
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      if (phase === "play" || phase === "clear") {
        ctx.save();
        ctx.shadowColor = pal.cyan;
        ctx.shadowBlur = 16;
        ctx.fillStyle = alpha(pal.cyan, 0.35);
        ctx.strokeStyle = pal.cyan;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(p.x, p.y, PW, PH, 4);
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = pal.fg;
        const ex = p.face > 0 ? 9 : 3;
        ctx.fillRect(p.x + ex, p.y + 6, 3, 6);
        ctx.fillRect(p.x + ex + 5, p.y + 6, 3, 6);
        ctx.restore();
      }
      drawParticles(ctx, particles);

      if (flash > 0) {
        ctx.fillStyle = alpha(pal.red, flash * 0.25);
        ctx.fillRect(0, 0, W, H);
      }

      // HUD
      ctx.fillStyle = alpha(pal.bg, 0.65);
      ctx.beginPath();
      ctx.roundRect(34, 34, 260, 40, 10);
      ctx.fill();
      ctx.font = "700 12px 'JetBrains Mono', monospace";
      ctx.fillStyle = pal.fg;
      ctx.fillText(`LEVEL ${levelIndex + 1}/${LEVELS.length} · ${LEVELS[levelIndex].name.toUpperCase()}`, 46, 52);
      ctx.fillStyle = pal.red;
      ctx.fillText(`DEATHS ${deaths}`, 46, 67);

      if (pausedRef.current && phase === "play" && deaths === 0 && cleared === 0) {
        ctx.fillStyle = alpha(pal.fg, 0.7);
        ctx.font = "600 14px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillText(LEVELS[levelIndex].hint, W / 2, 140);
        ctx.textAlign = "left";
      }

      if (phase === "clear") {
        ctx.fillStyle = alpha(pal.bg, 0.72);
        ctx.fillRect(0, 0, W, H);
        ctx.textAlign = "center";
        ctx.fillStyle = pal.fg;
        ctx.font = "800 34px Unbounded, sans-serif";
        ctx.fillText(`LEVEL ${levelIndex + 1} CLEARED`, W / 2, H / 2 - 20);
        ctx.font = "600 14px 'JetBrains Mono', monospace";
        ctx.fillStyle = pal.muted;
        ctx.fillText(`Next: ${LEVELS[levelIndex + 1].name} — "${LEVELS[levelIndex + 1].hint}"`, W / 2, H / 2 + 16);
        ctx.fillStyle = pal.cyan;
        ctx.fillText("Press jump to continue", W / 2, H / 2 + 46);
        ctx.textAlign = "left";
      }
    };

    const stop = startLoop((dt, time) => {
      if (!pausedRef.current) update(dt);
      draw(time);
    });

    const press = (c: Control) => {
      if (pausedRef.current) return;
      if (c === "jump") {
        if (phase === "clear") {
          loadLevel(levelIndex + 1);
          return;
        }
        if (!held.jump) jumpBuffer = 0.12;
      }
      held[c] = true;
    };
    const release = (c: Control) => {
      held[c] = false;
    };
    controls.current = { press, release };

    const keyMap: Record<string, Control> = {
      ArrowLeft: "left",
      KeyA: "left",
      ArrowRight: "right",
      KeyD: "right",
      ArrowUp: "jump",
      KeyW: "jump",
      Space: "jump",
    };
    const onDown = (e: KeyboardEvent) => {
      if (e.code === "Enter" && phase === "clear" && !pausedRef.current) loadLevel(levelIndex + 1);
      const c = keyMap[e.code];
      if (c && !e.repeat) press(c);
    };
    const onUp = (e: KeyboardEvent) => {
      const c = keyMap[e.code];
      if (c) release(c);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      stop();
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [runId, pausedRef, sfxRef, onScoreRef, onOverRef]);

  const hold = (c: Control) => ({
    onPress: () => controls.current.press(c),
    onRelease: () => controls.current.release(c),
  });

  return (
    <div className="flex h-full w-full flex-col">
      <div ref={wrapRef} className="flex min-h-0 flex-1 items-center justify-center">
        <canvas
          ref={canvasRef}
          className="touch-none rounded-2xl border border-glass-border"
          role="img"
          aria-label="Devil Trap level. Move with arrow keys or A and D, jump with space."
        />
      </div>
      <TouchControls className="justify-between px-2">
        <div className="flex gap-3">
          <TouchButton label="Move left" {...hold("left")}>
            <ArrowLeft />
          </TouchButton>
          <TouchButton label="Move right" {...hold("right")}>
            <ArrowRight />
          </TouchButton>
        </div>
        <TouchButton label="Jump" {...hold("jump")} className="w-28">
          <ArrowUp /> JUMP
        </TouchButton>
      </TouchControls>
    </div>
  );
}
