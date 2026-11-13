import { cn } from "@/lib/utils";

export function DifficultyMeter({ level, label }: { level: number; label: string }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Difficulty ${level} of 5: ${label}`}>
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={cn(
              "h-3 w-1.5 rounded-full",
              i < level ? (level >= 5 ? "bg-neon-red" : level >= 3 ? "bg-neon-amber" : "bg-neon-green") : "bg-foreground/15",
            )}
          />
        ))}
      </div>
      <span className="font-mono text-[0.68rem] uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  );
}
