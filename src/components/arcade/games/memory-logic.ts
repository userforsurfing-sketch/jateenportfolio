export type Difficulty = "easy" | "medium" | "hard";

export const DIFFICULTIES: Record<Difficulty, { label: string; pairs: number }> = {
  easy: { label: "Easy", pairs: 6 },
  medium: { label: "Medium", pairs: 8 },
  hard: { label: "Hard", pairs: 12 },
};

/** 100 points per pair, plus an efficiency bonus for few extra moves and a fast time. */
export function memoryScore(pairs: number, moves: number, seconds: number) {
  const bonus = Math.max(0, pairs * 60 - Math.max(0, moves - pairs) * 10 - Math.floor(seconds) * 2);
  return pairs * 100 + bonus;
}

export function shuffledDeck(pairs: number, symbolCount: number, random = Math.random) {
  const symbols = Array.from({ length: symbolCount }, (_, i) => i)
    .sort(() => random() - 0.5)
    .slice(0, pairs);
  const deck = [...symbols, ...symbols].map((symbol, i) => ({ id: i, symbol }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}
