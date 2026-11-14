import { Flag, Sparkles } from "lucide-react";
import { journey } from "@/content/profile";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

export function Journey() {
  return (
    <section id="journey" aria-labelledby="journey-title" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-4xl">
        <SectionHeading id="journey" eyebrow="05 — My journey" title="Step by step" description="Where it started, where it's going." />

        <ol className="relative">
          <span aria-hidden className="absolute bottom-0 left-5 top-0 w-px bg-gradient-to-b from-primary via-accent to-transparent md:left-1/2" />
          {journey.map((m, i) => {
            const right = i % 2 === 1;
            return (
              <li key={m.title} className="relative pb-12 pl-16 last:pb-0 md:grid md:grid-cols-2 md:gap-12 md:pl-0">
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-5 top-6 flex size-10 -translate-x-1/2 items-center justify-center rounded-full border md:left-1/2",
                    m.future ? "border-accent/60 bg-accent/20 shadow-glow-accent" : "border-primary/60 bg-background shadow-glow",
                  )}
                >
                  {m.future ? <Sparkles className="size-4 text-foreground" /> : <Flag className="size-4 text-primary-glow" />}
                </span>
                <Reveal delay={80} className={cn("md:col-start-1", right && "md:col-start-2")}>
                  <div className={cn("glass glass-hover rounded-3xl p-6", right ? "md:text-left" : "md:text-right")}>
                    <span
                      className={cn(
                        "inline-block rounded-full px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest",
                        m.date ? "bg-primary/15 text-primary-glow" : "border border-dashed border-muted-foreground/40 text-muted-foreground",
                      )}
                    >
                      {m.date ?? "Date to be added"}
                    </span>
                    <h3 className="mt-3 text-lg font-bold">{m.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.description}</p>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
