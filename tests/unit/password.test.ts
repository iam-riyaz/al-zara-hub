import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("Argon2id Password Security", () => {
  it("should hash a password and verify successfully", async () => {
    const raw = "SecurePass123!";
    const hashed = await hashPassword(raw);

    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(raw);
    expect(hashed.startsWith("$argon2id$")).toBe(true);

    const isMatch = await verifyPassword(raw, hashed);
    expect(isMatch).toBe(true);
  });

  it("should reject an invalid password", async () => {
    const raw = "MySecretPassword99";
    const hashed = await hashPassword(raw);

    const isMatch = await verifyPassword("WrongPassword!", hashed);
    expect(isMatch).toBe(false);
  });
});
