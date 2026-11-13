import type { Sfx } from "@/lib/arcade/sfx";

export interface GameResult {
  score: number;
  won?: boolean;
  /** Extra line for the end screen, e.g. "18 moves · 42s". */
  detail?: string;
}

/** Contract between the arcade shell and every game. */
export interface GameProps {
  /** True whenever the shell is not in the "playing" phase (intro, paused, help, game over). */
  paused: boolean;
  /** Changes on every restart; games reset all internal state when it changes. */
  runId: number;
  sfx: Sfx;
  onScore: (score: number) => void;
  /** Call exactly once per run. */
  onGameOver: (result: GameResult) => void;
}
