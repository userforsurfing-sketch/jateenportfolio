import { useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Github, Instagram, Linkedin, Loader2, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile } from "@/content/profile";
import { contactSchema } from "@/lib/contact";
import { submitContact } from "@/lib/contact.functions";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

type Field = "name" | "email" | "message";
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "sending" | "sent" | "error";

const handle = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

export function Contact() {
  const { email, github, linkedin, instagram } = profile.contact;
  const [values, setValues] = useState({ name: "", email: "", message: "", website: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = contactSchema.safeParse(values);
    if (!parsed.success) {
      const found: Errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as Field;
        if (!found[key]) found[key] = issue.message;
      }
      setErrors(found);
      return;
    }
    setErrors({});
    setStatus("sending");
    setServerError("");
    try {
      await submitContact({ data: { ...parsed.data, website: values.website } });
      setStatus("sent");
      setValues({ name: "", email: "", message: "", website: "" });
    } catch (err) {
      setStatus("error");
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const channels = [
    { icon: Mail, label: "Email", value: email, href: email ? `mailto:${email}` : null },
    { icon: Instagram, label: "Instagram", value: instagram ? `@${handle(instagram).split("/").pop()}` : null, href: instagram },
    { icon: Github, label: "GitHub", value: github ? handle(github) : null, href: github },
    { icon: Linkedin, label: "LinkedIn", value: linkedin ? handle(linkedin) : null, href: linkedin },
  ];

  const field =
    "w-full rounded-2xl border border-input bg-background/40 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative px-4 py-24 sm:px-6 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="contact" eyebrow="06 — Contact" title="Let's connect" description="Have an idea, a question or just want to say hi?" />

        <div className="grid gap-6 lg:grid-cols-5">
          <Reveal className="space-y-4 lg:col-span-2">
            {channels.map((c) => {
              const inner = (
                <>
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-glass-border bg-primary/10 text-primary-glow">
                    <c.icon className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-sm font-bold">{c.label}</span>
                    <span className="block truncate text-sm text-muted-foreground">{c.value ?? "Not added yet"}</span>
                  </span>
                </>
              );
              return c.href ? (
                <a
                  key={c.label}
                  href={c.href}
                  {...(c.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="glass glass-hover flex items-center gap-4 rounded-3xl p-5"
                >
                  {inner}
                </a>
              ) : (
                <div key={c.label} className="glass flex items-center gap-4 rounded-3xl p-5 opacity-80">
                  {inner}
                </div>
              );
            })}
          </Reveal>

          <Reveal delay={120} className="lg:col-span-3">
            <form onSubmit={onSubmit} noValidate className="glass relative rounded-3xl p-6 sm:p-8">
              {/* Honeypot for bots — hidden from people and screen readers */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label htmlFor="contact-website">Website</label>
                <input
                  id="contact-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={values.website}
                  onChange={(e) => setValues((v) => ({ ...v, website: e.target.value }))}
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" error={errors.name} id="contact-name">
                  <input
                    id="contact-name"
                    name="name"
                    autoComplete="name"
                    maxLength={100}
                    value={values.name}
                    onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
                    className={cn(field, errors.name && "border-destructive")}
                    placeholder="Your name"
                    aria-invalid={!!errors.name}
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                  />
                </Field>
                <Field label="Email" error={errors.email} id="contact-email">
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    maxLength={255}
                    value={values.email}
                    onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
                    className={cn(field, errors.email && "border-destructive")}
                    placeholder="you@example.com"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                  />
                </Field>
              </div>
              <div className="mt-5">
                <Field label="Message" error={errors.message} id="contact-message">
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    maxLength={2000}
                    value={values.message}
                    onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
                    className={cn(field, "resize-none", errors.message && "border-destructive")}
                    placeholder="Tell me about your idea…"
                    aria-invalid={!!errors.message}
                    aria-describedby={errors.message ? "contact-message-error" : undefined}
                  />
                </Field>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Button type="submit" variant="hero" size="xl" disabled={status === "sending"}>
                  {status === "sending" ? <Loader2 className="animate-spin" /> : <Send />}
                  {status === "sending" ? "Sending…" : "Send Message"}
                </Button>
                <div aria-live="polite" className="text-sm">
                  {status === "sent" && (
                    <p className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="size-4" /> Thanks! Your message has been sent to Jateen.
                    </p>
                  )}
                  {status === "error" && <p className="text-destructive">{serverError}</p>}
                </div>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({ label, error, id, children }: { label: string; error?: string | undefined; id: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-mono text-[0.7rem] uppercase tracking-widest text-muted-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
