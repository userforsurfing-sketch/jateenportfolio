import { ArrowUp, Github, Instagram, Linkedin, Mail } from "lucide-react";
import { navItems, profile } from "@/content/profile";
import { Logo } from "./Logo";

export function Footer() {
  const { email, github, linkedin, instagram } = profile.contact;
  const socials = [
    { icon: Mail, label: "Email", href: email ? `mailto:${email}` : null },
    { icon: Instagram, label: "Instagram", href: instagram },
    { icon: Github, label: "GitHub", href: github },
    { icon: Linkedin, label: "LinkedIn", href: linkedin },
  ];
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-glass-border px-4 pb-10 pt-14 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm text-muted-foreground">My digital space. {profile.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-10 gap-y-2 sm:grid-cols-4">
            {navItems.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <ul className="flex gap-2" aria-label="Social links">
            {socials.map((s) => (
              <li key={s.label}>
                {s.href ? (
                  <a
                    href={s.href}
                    aria-label={s.label}
                    {...(s.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="glass glass-hover flex size-11 items-center justify-center rounded-2xl"
                  >
                    <s.icon className="size-4" />
                  </a>
                ) : (
                  <span
                    className="glass flex size-11 items-center justify-center rounded-2xl text-muted-foreground/50"
                    title={`${s.label} — coming soon`}
                    aria-label={`${s.label} — coming soon`}
                    role="img"
                  >
                    <s.icon className="size-4" />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl items-center justify-between gap-4 border-t border-glass-border pt-6">
        <p className="font-mono text-xs text-muted-foreground">© {year} Jateen. All rights reserved.</p>
        <a
          href="#home"
          className="glass glass-hover flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
        >
          <ArrowUp className="size-3.5" /> Back to top
        </a>
      </div>
    </footer>
  );
}
