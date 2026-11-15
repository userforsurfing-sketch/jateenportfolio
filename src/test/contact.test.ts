import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/contact";

const valid = { name: "Asha", email: "asha@example.com", message: "Hello, I loved your arcade!" };

describe("contact form rules", () => {
  it("accepts a normal message", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });
  it("requires a name", () => {
    expect(contactSchema.safeParse({ ...valid, name: "   " }).success).toBe(false);
  });
  it("rejects an invalid email", () => {
    expect(contactSchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });
  it("needs at least 10 characters of message and at most 2000", () => {
    expect(contactSchema.safeParse({ ...valid, message: "too short" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, message: "x".repeat(2001) }).success).toBe(false);
  });
});
