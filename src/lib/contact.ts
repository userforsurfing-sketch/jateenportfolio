import { z } from "zod";

/** Shared by the contact form (browser) and the server function that stores submissions. */
export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name.").max(100, "Name must be under 100 characters."),
  email: z.string().trim().email("Please enter a valid email.").max(255, "Email must be under 255 characters."),
  message: z
    .string()
    .trim()
    .min(10, "Message should be at least 10 characters.")
    .max(2000, "Message must be under 2000 characters."),
});

export type ContactInput = z.infer<typeof contactSchema>;
