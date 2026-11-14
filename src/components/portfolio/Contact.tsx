import { useState, type FormEvent, type ReactNode } from "react";
import { Github, Info, Linkedin, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { profile } from "@/content/profile";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

type Errors = Partial<Record<"name" | "email" | "message", string>>;

function validate(data: { name: string; email: string; message: string }): Errors {
  const errors: Errors = {};
  if (!data.name.trim()) errors.name = "Please enter your name.";
  else if (data.name.length > 100) errors.name = "Name must be under 100 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) errors.email = "Please enter a valid email.";
  if (data.message.trim().length < 10) errors.message = "Message should be at least 10 characters.";
  else if (data.message.length > 2000) errors.message = "Message must be under 2000 characters.";
  return errors;
}

export function Contact() {
  const { email, github, linkedin } = profile.contact;
  // Sending works through the visitor's email app once a real address is set in the profile.
  const canSend = Boolean(email);
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length || !email) return;
    const subject = encodeURIComponent(`Hello from ${values.name.trim()}`);
    const body = encodeURIComponent(`${values.message.trim()}\n\n— ${values.name.trim()} (${values.email.trim()})`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSent(true);
  };

  const channels = [
    { icon: Mail, label: "Email", value: email, href: email ? `mailto:${email}` : null },
    { icon: Github, label: "GitHub", value: github?.replace(/^https?:\/\//, ""), href: github },
    { icon: Linkedin, label: "LinkedIn", value: linkedin?.replace(/^https?:\/\//, ""), href: linkedin },
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
            <form onSubmit={onSubmit} noValidate className="glass rounded-3xl p-6 sm:p-8" aria-describedby={canSend ? undefined : "contact-status"}>
              {!canSend && (
                <div id="contact-status" className="mb-6 flex gap-3 rounded-2xl border border-neon-amber/30 bg-neon-amber/10 p-4 text-sm">
                  <Info className="mt-0.5 size-4 shrink-0 text-neon-amber" aria-hidden />
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Messaging isn&apos;t switched on yet.</strong> Once Jateen adds a contact
                    email, this form will open your email app with your message ready to send.
                  </p>
                </div>
              )}
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
                <Button type="submit" variant="hero" size="xl" disabled={!canSend}>
                  <Send /> Send Message
                </Button>
                {sent && <p className="text-sm text-success" role="status">Your email app should open with the message ready.</p>}
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
