import { beforeEach, describe, expect, it } from "vitest";
import { getBest, submitScore } from "@/lib/arcade/storage";
import { memoryScore, shuffledDeck } from "@/components/arcade/games/memory-logic";
import { COLS, LEVELS, ROWS, findTile } from "@/components/arcade/games/devil-trap-levels";
import { GAMES } from "@/components/arcade/registry";

describe("high scores (localStorage)", () => {
  beforeEach(() => localStorage.clear());

  it("saves a first score as the best", () => {
    expect(submitScore("snake-x", 120)).toEqual({ best: 120, isNewBest: true });
    expect(getBest("snake-x")).toBe(120);
  });

  it("keeps the higher best when a lower score comes in", () => {
    submitScore("snake-x", 300);
    expect(submitScore("snake-x", 90)).toEqual({ best: 300, isNewBest: false });
    expect(getBest("snake-x")).toBe(300);
  });

  it("stores bests per game", () => {
    submitScore("neon-jump", 50);
    expect(getBest("cyber-racer")).toBe(0);
  });
});

describe("arcade lineup", () => {
  it("has exactly the five required games", () => {
    expect(GAMES.map((g) => g.id)).toEqual(["neon-jump", "devil-trap", "cyber-racer", "memory-match", "snake-x"]);
  });
});

describe("memory match", () => {
  it("deals two cards of every symbol", () => {
    const deck = shuffledDeck(8, 14);
    expect(deck).toHaveLength(16);
    const counts = new Map<number, number>();
    deck.forEach((c) => counts.set(c.symbol, (counts.get(c.symbol) ?? 0) + 1));
    expect([...counts.values()].every((n) => n === 2)).toBe(true);
  });

  it("gives a perfect fast game the full bonus and never drops below 100 per pair", () => {
    expect(memoryScore(6, 6, 0)).toBe(6 * 100 + 6 * 60);
    expect(memoryScore(6, 200, 999)).toBe(600);
  });
});

describe("devil trap levels", () => {
  it("has at least five levels", () => {
    expect(LEVELS.length).toBeGreaterThanOrEqual(5);
  });

  it.each(LEVELS.map((l, i) => [i + 1, l] as const))("level %i is a full grid with a start and an exit", (_n, level) => {
    expect(level.map).toHaveLength(ROWS);
    level.map.forEach((row) => expect(row).toHaveLength(COLS));
    expect(findTile(level.map, "S")).not.toBeNull();
    expect(findTile(level.map, "E")).not.toBeNull();
  });
});
