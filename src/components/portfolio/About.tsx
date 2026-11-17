import { Compass, Heart, Lightbulb, Target } from "lucide-react";
import { about } from "@/content/profile";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const pillars = [
  { icon: Heart, title: "Passion for code", text: "Technology is where curiosity turns into something real." },
  { icon: Lightbulb, title: "Interactive ideas", text: "Websites and experiences that feel alive when you use them." },
  { icon: Compass, title: "Learning mindset", text: "Every project is a lesson; every bug is a puzzle." },
];

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative px-4 py-16 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="about" eyebrow="01 — About me" title="A curious builder" />

        <div className="grid gap-6 lg:grid-cols-5">
          <Reveal className="glass glass-hover rounded-3xl p-7 sm:p-10 lg:col-span-3">
            <div className="space-y-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              {about.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <div className="mt-8 flex items-start gap-4 rounded-2xl border border-primary/25 bg-primary/5 p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand shadow-glow">
                <Target className="size-5" />
              </span>
              <div>
                <p className="font-display text-sm font-bold">Future goals</p>
                <p className="mt-1 text-sm text-muted-foreground">{about.goals}</p>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-6 lg:col-span-2">
            {pillars.map((pillar, i) => (
              <Reveal key={pillar.title} delay={i * 120} className="glass glass-hover flex gap-4 rounded-3xl p-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-glass-border bg-accent/15 text-primary-glow">
                  <pillar.icon className="size-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold">{pillar.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{pillar.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {about.highlights.map((h, i) => (
            <Reveal key={h.label} delay={i * 100} className="glass rounded-3xl p-6 text-center">
              <p className="font-display text-2xl font-extrabold text-gradient-brand sm:text-3xl">{h.value}</p>
              <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">{h.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
