/** Canvas games read colors from the design tokens in src/styles.css at runtime. */

function token(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** Adds an alpha channel to an `oklch(L C H)` token value. */
export function alpha(color: string, a: number) {
  const match = color.match(/^oklch\(([^)/]+)\)$/);
  return match?.[1] ? `oklch(${match[1].trim()} / ${a})` : color;
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
