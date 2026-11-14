import { ExternalLink, Github, Lock, Plus } from "lucide-react";
import portfolioImg from "@/assets/project-portfolio.jpg";
import arcadeImg from "@/assets/game-neon-jump.jpg";
import { Button } from "@/components/ui/button";
import { projects, type Project } from "@/content/profile";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { TiltCard } from "./TiltCard";

const IMAGES = { portfolio: portfolioImg, arcade: arcadeImg } as const;

function ProjectLink({ url, label, icon }: { url: string | null; label: string; icon: "demo" | "source" }) {
  const Icon = icon === "demo" ? ExternalLink : Github;
  if (!url) {
    return (
      <Button variant="glass" size="sm" disabled title={`${label} link not added yet`}>
        <Lock /> {icon === "demo" ? "Demo soon" : "Source soon"}
      </Button>
    );
  }
  const external = /^https?:\/\//.test(url);
  return (
    <Button asChild variant={icon === "demo" ? "hero" : "glass"} size="sm">
      <a href={url} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        <Icon /> {label}
      </a>
    </Button>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <TiltCard className="glass glass-hover group flex h-full flex-col overflow-hidden rounded-3xl transition-transform duration-300">
      <div className="relative aspect-[16/10] overflow-hidden">
        {project.image ? (
          <img
            src={IMAGES[project.image]}
            alt={`${project.title} preview`}
            loading="lazy"
            width={1024}
            height={640}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-aurora">
            <span className="flex size-16 items-center justify-center rounded-2xl border border-dashed border-muted-foreground/40 text-muted-foreground">
              <Plus className="size-7" />
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
        {project.placeholder && (
          <span className="absolute left-4 top-4 rounded-full border border-dashed border-muted-foreground/50 bg-background/60 px-3 py-1 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
            Placeholder
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-bold">{project.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
        <ul className="mt-5 flex flex-wrap gap-2" aria-label="Technologies">
          {project.tags.map((tag) => (
            <li key={tag} className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 font-mono text-[0.68rem] text-primary-glow">
              {tag}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-2">
          <ProjectLink url={project.liveUrl} label="Live Demo" icon="demo" />
          <ProjectLink url={project.sourceUrl} label="Source Code" icon="source" />
        </div>
      </div>
    </TiltCard>
  );
}

export function Projects() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="projects"
          eyebrow="03 — Projects"
          title="Things I've built"
          description="A growing collection. Every link here goes somewhere real — the rest unlock when they're published."
        />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <Reveal key={project.title} delay={i * 120}>
              <ProjectCard project={project} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
