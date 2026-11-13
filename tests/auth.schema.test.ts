import { describe, it, expect } from "vitest";
import {
  loginSchema,
  alumniRegisterSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  indianPhoneRegex,
} from "../shared/src/schemas/auth.schema.js";

describe("Authentication & Registration Schemas (Module 1 & 2)", () => {
  describe("loginSchema", () => {
    it("should accept valid credentials", () => {
      const valid = {
        email: "Admin@IMCC.mespune.in",
        password: "SecretPassword123",
      };
      const result = loginSchema.safeParse(valid);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("admin@imcc.mespune.in"); // Normalized to lowercase
      }
    });

    it("should reject invalid email format", () => {
      const invalid = {
        email: "not-an-email",
        password: "SecretPassword123",
      };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const invalid = {
        email: "admin@imcc.mespune.in",
        password: "",
      };
      const result = loginSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Indian Phone Number Regex Validation", () => {
    it("should validate valid 10-digit Indian numbers starting with 6, 7, 8, or 9", () => {
      expect(indianPhoneRegex.test("9822012345")).toBe(true);
      expect(indianPhoneRegex.test("8765432109")).toBe(true);
      expect(indianPhoneRegex.test("7020011223")).toBe(true);
      expect(indianPhoneRegex.test("6123456789")).toBe(true);
    });

    it("should reject numbers starting with 0-5 or with invalid lengths", () => {
      expect(indianPhoneRegex.test("5123456789")).toBe(false);
      expect(indianPhoneRegex.test("982201234")).toBe(false); // 9 digits
      expect(indianPhoneRegex.test("98220123456")).toBe(false); // 11 digits
      expect(indianPhoneRegex.test("abcdefghij")).toBe(false);
    });
  });

  describe("alumniRegisterSchema", () => {
    const validAlumni = {
      fullName: "Prithviraj Pratap Patil",
      email: "prithvi@example.com",
      phone: "9822012345",
      password: "Password123",
      program: "MCA",
      graduationYear: 2024,
      enrollmentNo: "IMCC-MCA-2022-045",
      consentGiven: true,
    };

    it("should pass for valid alumni details", () => {
      const result = alumniRegisterSchema.safeParse(validAlumni);
      expect(result.success).toBe(true);
    });

    it("should reject password without uppercase letter", () => {
      const result = alumniRegisterSchema.safeParse({
        ...validAlumni,
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without digits", () => {
      const result = alumniRegisterSchema.safeParse({
        ...validAlumni,
        password: "PasswordOnly",
      });
      expect(result.success).toBe(false);
    });

    it("should reject registration if consent is false or missing", () => {
      const result = alumniRegisterSchema.safeParse({
        ...validAlumni,
        consentGiven: false,
      });
      expect(result.success).toBe(false);
    });

    it("should reject graduation year prior to 1980 or in future", () => {
      const pastResult = alumniRegisterSchema.safeParse({
        ...validAlumni,
        graduationYear: 1975,
      });
      expect(pastResult.success).toBe(false);

      const futureResult = alumniRegisterSchema.safeParse({
        ...validAlumni,
        graduationYear: new Date().getFullYear() + 2,
      });
      expect(futureResult.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema & resetPasswordSchema", () => {
    it("should accept valid email for reset password request", () => {
      const result = forgotPasswordSchema.safeParse({ email: "student@imcc.mespune.in" });
      expect(result.success).toBe(true);
    });

    it("should validate reset token and strong password", () => {
      const result = resetPasswordSchema.safeParse({
        token: "secure-jwt-token-xyz",
        password: "NewPassword2026",
      });
      expect(result.success).toBe(true);
    });
  });
});
