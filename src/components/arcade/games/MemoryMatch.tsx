import { useCallback, useEffect, useRef, useState } from "react";
import {
  Atom,
  Crown,
  Diamond,
  Flame,
  Gamepad2,
  Gem,
  Ghost,
  Heart,
  Moon,
  Music,
  Rocket,
  Star,
  Sun,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLatest } from "@/lib/arcade/engine";
import { DIFFICULTIES, memoryScore, shuffledDeck, type Difficulty } from "./memory-logic";
import type { GameProps } from "../types";

const SYMBOLS: LucideIcon[] = [Star, Zap, Diamond, Heart, Gamepad2, Rocket, Music, Moon, Sun, Flame, Ghost, Crown, Atom, Gem];

interface Card {
  id: number;
  symbol: number;
}

export function MemoryMatch({ paused, runId, sfx, onScore, onGameOver }: GameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [deck, setDeck] = useState<Card[]>(() => shuffledDeck(DIFFICULTIES.easy.pairs, SYMBOLS.length));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const lockRef = useRef(false);
  const onScoreRef = useLatest(onScore);
  const onOverRef = useLatest(onGameOver);

  const pairs = DIFFICULTIES[difficulty].pairs;

  const reset = useCallback(
    (level: Difficulty) => {
      setDeck(shuffledDeck(DIFFICULTIES[level].pairs, SYMBOLS.length));
      setOpen([]);
      setMatched(new Set());
      setMoves(0);
      setSeconds(0);
      setStarted(false);
      setDone(false);
      lockRef.current = false;
      onScoreRef.current(0);
    },
    [onScoreRef],
  );

  // Restart from the shell keeps the chosen difficulty.
  const difficultyRef = useLatest(difficulty);
  useEffect(() => {
    reset(difficultyRef.current);
  }, [runId, reset, difficultyRef]);

  // Timer: only runs while the game is active.
  useEffect(() => {
    if (!started || done || paused) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [started, done, paused]);

  const flip = (index: number) => {
    if (paused || done || lockRef.current) return;
    if (open.includes(index) || matched.has(index)) return;
    if (!started) setStarted(true);
    sfx.play("flip");
    const nextOpen = [...open, index];
    setOpen(nextOpen);
    if (nextOpen.length < 2) return;

    const nextMoves = moves + 1;
    setMoves(nextMoves);
    const a = nextOpen[0]!;
    const b = nextOpen[1]!;
    if (deck[a]?.symbol === deck[b]?.symbol) {
      const nextMatched = new Set(matched);
      nextMatched.add(a);
      nextMatched.add(b);
      setMatched(nextMatched);
      setOpen([]);
      sfx.play("match");
      const found = nextMatched.size / 2;
      onScoreRef.current(found * 100);
      if (found === pairs) {
        setDone(true);
        const final = memoryScore(pairs, nextMoves, seconds);
        onScoreRef.current(final);
        window.setTimeout(() => {
          sfx.play("win");
          onOverRef.current({
            score: final,
            won: true,
            detail: `${DIFFICULTIES[difficulty].label} · ${nextMoves} moves · ${seconds}s`,
          });
        }, 500);
      }
    } else {
      lockRef.current = true;
      window.setTimeout(() => {
        setOpen([]);
        lockRef.current = false;
        sfx.play("miss");
      }, 750);
    }
  };

  const cols = difficulty === "hard" ? "grid-cols-4 sm:grid-cols-6" : "grid-cols-4";
  const width = difficulty === "hard" ? "max-w-[min(100%,34rem)] sm:max-w-[min(100%,46rem)]" : "max-w-[min(100%,30rem)]";

  return (
    <div className="flex h-full w-full flex-col items-center gap-4 overflow-y-auto py-1">
      <div className="flex w-full flex-wrap items-center justify-center gap-2 sm:justify-between">
        <div role="radiogroup" aria-label="Difficulty" className="glass flex rounded-full p-1">
          {(Object.keys(DIFFICULTIES) as Difficulty[]).map((level) => (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={difficulty === level}
              onClick={() => {
                setDifficulty(level);
                reset(level);
              }}
              className={cn(
                "rounded-full px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors",
                difficulty === level ? "bg-brand text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {DIFFICULTIES[level].label}
            </button>
          ))}
        </div>
        <div className="flex gap-2 font-mono text-xs">
          <span className="glass rounded-full px-3 py-1.5">
            Moves <strong className="ml-1 text-foreground">{moves}</strong>
          </span>
          <span className="glass rounded-full px-3 py-1.5">
            Time <strong className="ml-1 text-foreground">{seconds}s</strong>
          </span>
          <span className="glass rounded-full px-3 py-1.5">
            Pairs <strong className="ml-1 text-foreground">{matched.size / 2}/{pairs}</strong>
          </span>
        </div>
      </div>

      <div className={cn("grid w-full gap-2 sm:gap-3", cols, width)}>
        {deck.map((card, index) => {
          const Icon = SYMBOLS[card.symbol] ?? Star;
          const isMatched = matched.has(index);
          const faceUp = isMatched || open.includes(index);
          return (
            <button
              key={`${runId}-${card.id}`}
              type="button"
              onClick={() => flip(index)}
              disabled={isMatched}
              aria-label={faceUp ? `Card ${index + 1}, face up` : `Card ${index + 1}, face down`}
              className="group aspect-square perspective-distant disabled:cursor-default"
            >
              <span
                className={cn(
                  "relative block h-full w-full transition-transform duration-500 transform-3d",
                  faceUp && "rotate-y-180",
                )}
              >
                <span className="glass absolute inset-0 flex items-center justify-center rounded-xl backface-hidden group-hover:border-primary/50 group-focus-visible:border-primary">
                  <span className="h-1/3 w-1/3 rounded-full border border-primary/30 bg-primary/10" />
                </span>
                <span
                  className={cn(
                    "absolute inset-0 flex rotate-y-180 items-center justify-center rounded-xl border backface-hidden",
                    isMatched
                      ? "border-success/60 bg-success/10 text-success shadow-glow"
                      : "border-accent/60 bg-accent/15 text-primary-glow shadow-glow-accent",
                  )}
                >
                  <Icon className="h-1/2 w-1/2" strokeWidth={1.75} />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
