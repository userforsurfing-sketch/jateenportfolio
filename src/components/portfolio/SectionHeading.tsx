import { Reveal } from "./Reveal";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
}

export function SectionHeading({ id, eyebrow, title, description }: SectionHeadingProps) {
  return (
    <Reveal className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={`${id}-title`} className="mt-4 text-3xl font-bold sm:text-5xl">
        <span className="text-gradient">{title}</span>
      </h2>
      {description && <p className="mt-4 text-base text-muted-foreground sm:text-lg">{description}</p>}
    </Reveal>
  );
}
