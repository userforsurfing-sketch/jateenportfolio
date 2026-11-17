import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CircleHelp, Pause, Play, RotateCcw, Trophy, Volume2, VolumeX, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSfx } from "@/lib/arcade/sfx";
import { getBest, getSoundEnabled, setSoundEnabled, submitScore } from "@/lib/arcade/storage";
import { cn } from "@/lib/utils";
import type { GameMeta } from "./registry";
import type { GameResult } from "./types";
import { DifficultyMeter } from "./DifficultyMeter";

type Phase = "intro" | "playing" | "paused" | "over";

interface GameModalProps {
  game: GameMeta;
  onClose: () => void;
  onBestChange: (gameId: string, best: number) => void;
}

const SCROLL_KEYS = new Set(["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "PageUp", "PageDown"]);

export function GameModal({ game, onClose, onBestChange }: GameModalProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [help, setHelp] = useState(false);
  const [runId, setRunId] = useState(0);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => getBest(game.id));
  const [result, setResult] = useState<(GameResult & { isNewBest: boolean }) | null>(null);
  const [sound, setSound] = useState(() => getSoundEnabled());
  const sfx = useMemo(() => createSfx(getSoundEnabled()), []);
  const dialogRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const Game = game.Component;

  useEffect(() => {
    sfx.setEnabled(sound);
    setSoundEnabled(sound);
  }, [sound, sfx]);

  const focusStage = () => {
    (document.activeElement as HTMLElement | null)?.blur?.();
    if (game.capturesKeys) stageRef.current?.focus({ preventScroll: true });
  };

  const start = useCallback(() => {
    setHelp(false);
    setPhase("playing");
    sfx.play("start");
    requestAnimationFrame(focusStage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sfx]);

  const restart = useCallback(() => {
    setResult(null);
    setScore(0);
    setRunId((r) => r + 1);
    start();
  }, [start]);

  const pause = useCallback(() => {
    if (phaseRef.current === "playing") setPhase("paused");
  }, []);

  const resume = useCallback(() => {
    if (phaseRef.current === "paused") start();
  }, [start]);

  const handleGameOver = useCallback(
    (r: GameResult) => {
      const saved = submitScore(game.id, r.score);
      setBest(saved.best);
      onBestChange(game.id, saved.best);
      setResult({ ...r, isNewBest: saved.isNewBest });
      setScore(r.score);
      setPhase("over");
      setHelp(false);
    },
    [game.id, onBestChange],
  );

  // Lock page scroll, restore focus on close.
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    dialogRef.current?.focus({ preventScroll: true });
    return () => {
      html.style.overflow = prevOverflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, []);

  // Keyboard: keep game keys from scrolling the page, Esc/P for pause.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const current = phaseRef.current;
      if (e.code === "Escape") {
        e.preventDefault();
        if (current === "playing") pause();
        else if (current === "paused") resume();
        else onClose();
        return;
      }
      if (e.code === "KeyP" && (current === "playing" || current === "paused")) {
        e.preventDefault();
        if (current === "playing") pause();
        else resume();
        return;
      }
      if (game.capturesKeys && current === "playing" && SCROLL_KEYS.has(e.code)) e.preventDefault();
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [game.capturesKeys, onClose, pause, resume]);

  // Auto-pause when the tab is hidden.
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) pause();
    };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", pause);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", pause);
    };
  }, [pause]);

  const isPlaying = phase === "playing";
  const showHelp = help || phase === "intro";

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="arcade-game-title"
      tabIndex={-1}
      className="fixed inset-0 z-[100] flex flex-col bg-background/95 outline-none backdrop-blur-xl animate-in fade-in duration-300"
    >
      <div className="pointer-events-none absolute inset-0 bg-aurora opacity-60" />

      <header className="relative z-10 flex flex-wrap items-center gap-2 border-b border-glass-border px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
        <div className="mr-auto min-w-0">
          <p className="eyebrow !text-[0.6rem] sm:!text-[0.68rem]">{game.tagline}</p>
          <h2 id="arcade-game-title" className="truncate text-base font-bold sm:text-xl">
            {game.title}
          </h2>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs sm:text-sm" aria-live="polite">
          <span className="glass rounded-xl px-3 py-1.5">
            <span className="text-muted-foreground">Score </span>
            <strong className="tabular-nums text-foreground">{score}</strong>
          </span>
          <span className="glass flex items-center gap-1.5 rounded-xl px-3 py-1.5">
            <Trophy className="size-3.5 text-neon-amber" aria-hidden />
            <span className="sr-only">Best </span>
            <strong className="tabular-nums text-foreground">{best}</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {phase === "playing" || phase === "paused" ? (
            <Button
              variant="hud"
              size="sm"
              onClick={isPlaying ? pause : resume}
              aria-label={isPlaying ? "Pause game" : "Resume game"}
            >
              {isPlaying ? <Pause /> : <Play />}
              <span className="hidden sm:inline">{isPlaying ? "Pause" : "Resume"}</span>
            </Button>
          ) : null}
          <Button variant="hud" size="sm" onClick={restart} aria-label="Restart game">
            <RotateCcw />
            <span className="hidden sm:inline">Restart</span>
          </Button>
          <Button
            variant="hud"
            size="icon"
            onClick={() => setSound((s) => !s)}
            aria-label={sound ? "Mute sound" : "Turn sound on"}
            aria-pressed={sound}
          >
            {sound ? <Volume2 /> : <VolumeX />}
          </Button>
          <Button
            variant="hud"
            size="icon"
            onClick={() => {
              pause();
              setHelp(true);
            }}
            aria-label="Show instructions"
            disabled={phase === "intro"}
          >
            <CircleHelp />
          </Button>
          <Button variant="hud" size="sm" onClick={onClose} aria-label="Exit game">
            <X />
            <span className="hidden sm:inline">Exit</span>
          </Button>
        </div>
      </header>

      {game.wide && (
        <p className="relative z-10 hidden px-4 pt-3 text-center font-mono text-[0.68rem] uppercase tracking-widest text-muted-foreground portrait:max-md:block">
          Tip: rotate your phone for a bigger screen
        </p>
      )}
      <div className="relative z-10 flex min-h-0 flex-1 items-stretch justify-center p-3 sm:p-6">
        <div
          ref={stageRef}
          tabIndex={-1}
          className="relative flex h-full w-full max-w-6xl min-h-0 outline-none"
        >
          <Game paused={!isPlaying} runId={runId} sfx={sfx} onScore={setScore} onGameOver={handleGameOver} />

          {phase !== "playing" && (
            <div className="absolute inset-0 z-10 flex overflow-y-auto overscroll-contain rounded-2xl bg-background/60 p-3 backdrop-blur-sm animate-in fade-in duration-200 sm:p-4">
              <div className="glass-strong m-auto w-full max-w-md rounded-3xl p-5 text-center sm:p-8">
                {phase === "over" && result ? (
                  <>
                    <p className="eyebrow">{result.won ? "You did it" : "Game over"}</p>
                    <h3 className="mt-3 text-3xl font-extrabold sm:text-4xl">
                      <span className="text-gradient">{result.score}</span>
                    </h3>
                    {result.detail && <p className="mt-2 text-sm text-muted-foreground">{result.detail}</p>}
                    <p
                      className={cn(
                        "mx-auto mt-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-xs",
                        result.isNewBest ? "bg-neon-amber/15 text-neon-amber" : "glass text-muted-foreground",
                      )}
                    >
                      <Trophy className="size-3.5" aria-hidden />
                      {result.isNewBest ? "New best score!" : `Best: ${best}`}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <Button variant="hero" size="lg" onClick={restart} autoFocus>
                        <RotateCcw /> Play again
                      </Button>
                      <Button variant="glass" size="lg" onClick={onClose}>
                        Exit
                      </Button>
                    </div>
                  </>
                ) : showHelp ? (
                  <Instructions
                    game={game}
                    action={
                      phase === "intro" ? (
                        <Button variant="hero" size="lg" onClick={start} autoFocus>
                          <Play /> Start game
                        </Button>
                      ) : (
                        <Button variant="hero" size="lg" onClick={resume} autoFocus>
                          <Play /> Resume
                        </Button>
                      )
                    }
                  />
                ) : (
                  <>
                    <p className="eyebrow">Paused</p>
                    <h3 className="mt-3 text-2xl font-bold">Take a breather</h3>
                    <p className="mt-2 text-sm text-muted-foreground">Press Esc or P to resume.</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <Button variant="hero" size="lg" onClick={resume} autoFocus>
                        <Play /> Resume
                      </Button>
                      <Button variant="glass" size="lg" onClick={restart}>
                        <RotateCcw /> Restart
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Instructions({ game, action }: { game: GameMeta; action: ReactNode }) {
  return (
    <div className="text-left">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow">How to play</p>
        <DifficultyMeter level={game.difficulty} label={game.difficultyLabel} />
      </div>
      <h3 className="mt-3 text-2xl font-bold">{game.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{game.goal}</p>
      <div className="mt-5 space-y-2">
        <p className="font-mono text-[0.68rem] uppercase tracking-widest text-muted-foreground">Keyboard</p>
        <ul className="space-y-1 text-sm">
          {game.keyboard.map((k) => (
            <li key={k} className="glass rounded-lg px-3 py-1.5 font-mono text-xs">
              {k}
            </li>
          ))}
          <li className="glass rounded-lg px-3 py-1.5 font-mono text-xs">Esc / P — pause</li>
        </ul>
        <p className="pt-2 font-mono text-[0.68rem] uppercase tracking-widest text-muted-foreground">Touch</p>
        <p className="text-sm text-muted-foreground">{game.touch}</p>
      </div>
      <div className="mt-6 flex justify-center">{action}</div>
    </div>
  );
}
