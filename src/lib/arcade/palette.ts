/** Canvas games read colors from the design tokens in src/styles.css at runtime. */

let probe: CanvasRenderingContext2D | null | undefined;

/**
 * Converts any CSS color to plain rgb()/rgba() by painting one pixel.
 * Older phone browsers can't draw `oklch()` on a canvas — they silently keep the
 * previous color, which made obstacles invisible — so games only ever get rgb.
 */
function toRgb(value: string, fallback: string) {
  if (probe === undefined) {
    probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  }
  const ctx = probe;
  if (!ctx) return fallback;
  const sentinel = "#010203";
  ctx.fillStyle = sentinel;
  ctx.fillStyle = value;
  // Browser rejected the color: use the hex fallback instead.
  if (String(ctx.fillStyle).toLowerCase() === sentinel && value.toLowerCase() !== sentinel) {
    ctx.fillStyle = fallback;
  }
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0, a = 255] = ctx.getImageData(0, 0, 1, 1).data;
  return a >= 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${Math.round((a / 255) * 100) / 100})`;
}

function token(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return toRgb(value || fallback, fallback);
}

/** Adds an alpha channel to an rgb(), rgba() or oklch() color. */
export function alpha(color: string, a: number) {
  const rgb = color.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/);
  if (rgb) return `rgba(${rgb[1]}, ${rgb[2]}, ${rgb[3]}, ${a})`;
  const ok = color.match(/^oklch\(([^)/]+)/);
  return ok?.[1] ? `oklch(${ok[1].trim()} / ${a})` : color;
}

export function readPalette() {
  return {
    bg: token("--game-bg", "#0b0b1e"),
    grid: token("--game-grid", "rgba(140,100,255,0.18)"),
    solid: token("--game-solid", "#2a2645"),
    solidEdge: token("--game-solid-edge", "#6a5acd"),
    road: token("--game-road", "#15152a"),
    hazard: token("--game-hazard", "#f4ff3a"),
    hazardAlt: token("--game-hazard-alt", "#ff4fb0"),
    fg: token("--foreground", "#fafaff"),
    muted: token("--muted-foreground", "#a9a9c8"),
    primary: token("--primary", "#4fa3ff"),
    accent: token("--accent", "#9a5cff"),
    cyan: token("--neon-cyan", "#6ee7ff"),
    pink: token("--neon-pink", "#ff3ea5"),
    green: token("--neon-green", "#4dff9a"),
    amber: token("--neon-amber", "#ffc24d"),
    red: token("--neon-red", "#ff4545"),
  };
}

export type Palette = ReturnType<typeof readPalette>;
