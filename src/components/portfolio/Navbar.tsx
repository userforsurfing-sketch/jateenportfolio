import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { navItems } from "@/content/profile";
import { useActiveSection } from "@/hooks/use-active-section";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const ids = navItems.map((n) => n.id);

export function Navbar() {
  const active = useActiveSection(ids);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-4">
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex max-w-6xl items-center justify-between rounded-full px-3 py-2 transition-all duration-500 sm:px-4",
          scrolled ? "glass-strong" : "glass",
        )}
      >
        <a href="#home" className="rounded-full px-2 py-1" aria-label="JATEEN — back to top">
          <Logo />
        </a>

        <ul className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "relative block rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300",
                    isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {isActive && <span className="absolute inset-0 -z-10 rounded-full bg-brand opacity-90 shadow-glow" />}
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>

        <a
          href="#games"
          className="hidden rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-glow transition-all hover:bg-primary/20 hover:shadow-glow lg:inline-flex"
        >
          Play games
        </a>

        <button
          type="button"
          className="flex size-10 items-center justify-center rounded-full text-foreground hover:bg-glass lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={cn(
          "glass-strong mx-auto mt-2 max-w-6xl origin-top overflow-hidden rounded-3xl transition-all duration-500 lg:hidden",
          open ? "max-h-[32rem] opacity-100" : "pointer-events-none max-h-0 border-transparent opacity-0",
        )}
      >
        <ul className="grid gap-1 p-3">
          {navItems.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                aria-current={active === item.id ? "true" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-2xl px-4 py-3 text-base font-medium transition-colors",
                  active === item.id ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:bg-glass hover:text-foreground",
                )}
              >
                {item.label}
                {active === item.id && <span className="size-2 rounded-full bg-primary shadow-glow" />}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
