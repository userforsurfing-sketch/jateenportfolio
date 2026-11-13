import { ParticleField } from "./ParticleField";

/** Midnight base + animated aurora lighting + grid + particles, fixed behind every section. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-20 overflow-hidden bg-background">
      <div className="absolute -inset-[10%] bg-aurora animate-aurora" />
      <div className="absolute inset-0 grid-lines opacity-60" />
      <div className="absolute -left-40 top-1/3 h-[32rem] w-[32rem] rounded-full bg-accent/20 blur-[120px] animate-pulse-glow" />
      <div className="absolute -right-40 top-10 h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-[120px] animate-pulse-glow [animation-delay:1.5s]" />
      <ParticleField />
    </div>
  );
}
