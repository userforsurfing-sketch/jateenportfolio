import { useCallback, useEffect, useState } from "react";
import { Gamepad2, HardDrive, Play, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameModal } from "@/components/arcade/GameModal";
import { DifficultyMeter } from "@/components/arcade/DifficultyMeter";
import { GAMES, type GameMeta } from "@/components/arcade/registry";
import { getBest } from "@/lib/arcade/storage";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function GamingZone() {
  const [active, setActive] = useState<GameMeta | null>(null);
  const [bests, setBests] = useState<Record<string, number>>({});

  useEffect(() => {
    setBests(Object.fromEntries(GAMES.map((g) => [g.id, getBest(g.id)])));
  }, []);

  const onBestChange = useCallback((id: string, best: number) => {
    setBests((b) => ({ ...b, [id]: best }));
  }, []);
  const close = useCallback(() => setActive(null), []);

  return (
    <section id="games" aria-labelledby="games-title" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="games"
          eyebrow="04 — Gaming zone"
          title="The Neon Arcade"
          description="Five original games, built from scratch and playable right here — no downloads, no other websites."
        />

        <Reveal className="glass mb-6 grid grid-cols-3 divide-x divide-glass-border rounded-3xl">
          {[
            { icon: Gamepad2, value: "5", label: "Original games" },
            { icon: Zap, value: "0", label: "Downloads needed" },
            { icon: HardDrive, value: "Local", label: "Best scores saved" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 px-2 py-5 text-center sm:flex-row sm:justify-center sm:gap-4 sm:text-left">
              <s.icon className="size-5 text-primary-glow" aria-hidden />
              <div>
                <p className="font-display text-lg font-bold sm:text-xl">{s.value}</p>
                <p className="font-mono text-[0.6rem] uppercase tracking-widest text-muted-foreground sm:text-[0.68rem]">{s.label}</p>
              </div>
            </div>
          ))}
        </Reveal>

        <div className="grid gap-6 md:grid-cols-6">
          {GAMES.map((game, i) => (
            <Reveal key={game.id} delay={(i % 3) * 100} className={cn(i < 2 ? "md:col-span-3" : "md:col-span-2")}>
              <article className="glass glass-hover group flex h-full flex-col overflow-hidden rounded-3xl">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={game.image}
                    alt={`${game.title} cover art`}
                    loading="lazy"
                    width={1024}
                    height={640}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                  <span className="glass absolute left-4 top-4 rounded-full px-3 py-1 font-mono text-[0.62rem] uppercase tracking-widest">
                    {game.tagline}
                  </span>
                  <span className="glass absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs">
                    <Trophy className="size-3.5 text-neon-amber" aria-hidden />
                    <span className="sr-only">Best score</span>
                    {bests[game.id] ?? 0}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-xl font-bold">{game.title}</h3>
                    <DifficultyMeter level={game.difficulty} label={game.difficultyLabel} />
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{game.description}</p>
                  <Button variant="hero" size="lg" className="mt-6 w-full sm:w-auto sm:self-start" onClick={() => setActive(game)}>
                    <Play /> Play Now
                  </Button>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>

      {active && <GameModal key={active.id} game={active} onClose={close} onBestChange={onBestChange} />}
    </section>
  );
}
