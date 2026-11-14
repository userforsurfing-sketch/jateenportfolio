import { Atom, Braces, FileCode2, Lightbulb, Palette, PenTool, Puzzle, Terminal, type LucideIcon } from "lucide-react";
import { skills, type SkillIcon } from "@/content/profile";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";

const ICONS: Record<SkillIcon, LucideIcon> = {
  html: FileCode2,
  css: Palette,
  js: Braces,
  react: Atom,
  python: Terminal,
  design: PenTool,
  puzzle: Puzzle,
  spark: Lightbulb,
};

export function Skills() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="skills"
          eyebrow="02 — Skills"
          title="What I'm working with"
          description="The tools and strengths I'm building up. Levels appear here once they're confirmed."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {skills.map((skill, i) => {
            const Icon = ICONS[skill.icon];
            return (
              <Reveal key={skill.name} delay={(i % 4) * 90}>
                <TiltCard className="glass glass-hover group h-full rounded-3xl p-6 transition-transform duration-300">
                  <div className="flex items-start justify-between">
                    <span className="flex size-12 items-center justify-center rounded-2xl border border-glass-border bg-primary/10 text-primary-glow transition-all duration-500 group-hover:bg-brand group-hover:text-foreground group-hover:shadow-glow">
                      <Icon className="size-6" />
                    </span>
                    {skill.level == null && (
                      <span className="rounded-full border border-dashed border-muted-foreground/40 px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">
                        Placeholder
                      </span>
                    )}
                  </div>
                  <h3 className="mt-5 text-lg font-bold">{skill.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{skill.note}</p>
                  <SkillBar level={skill.level} name={skill.name} />
                </TiltCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function SkillBar({ level, name }: { level: number | null; name: string }) {
  if (level == null) {
    return (
      <div className="mt-6">
        <div className="flex justify-between font-mono text-[0.68rem] uppercase tracking-wider text-muted-foreground">
          <span>Level</span>
          <span>Not set yet</span>
        </div>
        <div
          className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10"
          role="img"
          aria-label={`${name} proficiency not set yet`}
        >
          <span className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-brand opacity-60 animate-shimmer" />
        </div>
      </div>
    );
  }
  const value = Math.max(0, Math.min(100, level));
  return (
    <div className="mt-6">
      <div className="flex justify-between font-mono text-[0.68rem] uppercase tracking-wider text-muted-foreground">
        <span>Level</span>
        <span className="text-foreground">{value}%</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10"
        role="progressbar"
        aria-label={`${name} proficiency`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span
          className="block h-full origin-left scale-x-0 rounded-full bg-brand shadow-glow transition-transform duration-[1400ms] ease-out [.is-visible_&]:scale-x-100"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
