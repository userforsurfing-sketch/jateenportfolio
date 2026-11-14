import { ArrowRight, Gamepad2, MessageCircle, Sparkles, Code2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile } from "@/content/profile";

export function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="home-title"
      className="relative flex min-h-svh items-center overflow-hidden px-4 pb-20 pt-32 sm:px-6"
    >
      <div className="mx-auto grid w-full max-w-6xl items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
        <div className="text-center lg:text-left">
          <p className="eyebrow animate-rise">
            <span className="mr-2 inline-block size-1.5 translate-y-[-2px] rounded-full bg-primary shadow-glow" />
            {profile.tagline}
          </p>
          <h1
            id="home-title"
            className="mt-6 text-[2.6rem] font-extrabold leading-[1.02] animate-rise [animation-delay:120ms] sm:text-6xl lg:text-7xl"
          >
            HI, I&apos;M <span className="text-gradient-brand">JATEEN.</span>
          </h1>
          <p className="mt-6 font-mono text-xs uppercase tracking-[0.2em] text-primary-glow animate-rise [animation-delay:220ms] sm:text-sm">
            {profile.roles}
          </p>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground animate-rise [animation-delay:320ms] sm:text-lg lg:mx-0">
            {profile.intro}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 animate-rise [animation-delay:440ms] lg:justify-start">
            <Button asChild variant="hero" size="xl">
              <a href="#projects">
                Explore My Work <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="neon" size="xl">
              <a href="#games">
                <Gamepad2 /> Play Games
              </a>
            </Button>
            <Button asChild variant="glass" size="xl">
              <a href="#contact">
                <MessageCircle /> Let&apos;s Connect
              </a>
            </Button>
          </div>
        </div>

        <HeroOrb />
      </div>

      <a
        href="#about"
        aria-label="Scroll to About"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground sm:flex"
      >
        Scroll
        <span className="h-10 w-px overflow-hidden bg-foreground/10">
          <span className="block h-1/2 w-full bg-primary animate-float" />
        </span>
      </a>
    </section>
  );
}

function HeroOrb() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[22rem] animate-rise [animation-delay:300ms] sm:max-w-[26rem]" aria-hidden>
      <div className="absolute inset-0 rounded-full bg-accent/25 blur-[90px]" />
      <div className="absolute inset-[2%] orb-ring animate-spin-slow">
        <span className="absolute left-1/2 top-0 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan shadow-glow" />
      </div>
      <div className="absolute inset-[13%] orb-ring rotate-[60deg] animate-spin-slower">
        <span className="absolute bottom-0 left-1/2 size-2 -translate-x-1/2 translate-y-1/2 rounded-full bg-accent shadow-glow-accent" />
      </div>
      <div className="absolute inset-[24%] orb animate-float" />

      <div className="glass absolute -left-2 top-[18%] flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold animate-float [animation-delay:-2s] sm:-left-6">
        <Code2 className="size-4 text-primary-glow" /> Building
      </div>
      <div className="glass absolute -right-1 top-[44%] flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold animate-float [animation-delay:-4s] sm:-right-4">
        <Gamepad2 className="size-4 text-neon-pink" /> 5 games
      </div>
      <div className="glass absolute bottom-[10%] left-[12%] flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold animate-float [animation-delay:-1s]">
        <Sparkles className="size-4 text-neon-amber" /> Learning
      </div>
      <div className="glass absolute right-[12%] top-[6%] flex size-10 items-center justify-center rounded-2xl animate-float [animation-delay:-3s]">
        <Rocket className="size-4 text-neon-cyan" />
      </div>
    </div>
  );
}
