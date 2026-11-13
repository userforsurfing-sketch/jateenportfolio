/** Best scores and arcade settings, stored in the visitor's browser (localStorage). */

const bestKey = (gameId: string) => `jateen-arcade:best:${gameId}`;
const SOUND_KEY = "jateen-arcade:sound";

function safeStorage(): Storage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function getBest(gameId: string): number {
  const raw = safeStorage()?.getItem(bestKey(gameId));
  const value = raw == null ? 0 : Number(raw);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

/** Saves `score` only when it beats the stored best. Higher is always better. */
export function submitScore(gameId: string, score: number): { best: number; isNewBest: boolean } {
  const previous = getBest(gameId);
  const clean = Math.max(0, Math.floor(score));
  if (clean > previous) {
    safeStorage()?.setItem(bestKey(gameId), String(clean));
    return { best: clean, isNewBest: true };
  }
  return { best: previous, isNewBest: false };
}

export function getSoundEnabled(): boolean {
  return safeStorage()?.getItem(SOUND_KEY) !== "off";
}

export function setSoundEnabled(on: boolean) {
  safeStorage()?.setItem(SOUND_KEY, on ? "on" : "off");
}
