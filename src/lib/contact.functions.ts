import { createServerFn } from "@tanstack/react-start";
import { contactSchema } from "./contact";

/**
 * Public endpoint: anyone can submit the contact form.
 * Input is validated here; the row is written with server credentials because the
 * table has no public policies (visitors can never read submissions back).
 */
export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const raw = (input ?? {}) as Record<string, unknown>;
    // Honeypot: real visitors never fill the hidden "website" field.
    const bot = typeof raw["website"] === "string" && raw["website"].length > 0;
    return { ...contactSchema.parse(raw), bot };
  })
  .handler(async ({ data }) => {
    if (data.bot) return { ok: true as const };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("contact_submissions")
      .insert({ name: data.name, email: data.email, message: data.message });
    if (error) {
      console.error("contact_submissions insert failed:", error.message);
      throw new Error("Your message couldn't be saved. Please try again.");
    }
    return { ok: true as const };
  });
