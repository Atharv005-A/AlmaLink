import bcrypt from "bcryptjs";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { Response } from "express";
import { JwtPayload, Role } from "@almalink/shared";

const JWT_SECRET: Secret = process.env.JWT_SECRET || "almalink_fallback_jwt_secret_imcc_2026";
const TOKEN_EXPIRY: SignOptions["expiresIn"] = "7d";
export const AUTH_COOKIE_NAME = "almalink_session";

export class AuthService {
  /**
   * Hashes a raw password with a salt round of 10
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Compares a raw password against an existing bcrypt hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Mints a signed JWT containing identity and role data
   */
  static generateToken(payload: {
    userId: number;
    email: string;
    role: Role;
    cellId?: number | null;
  }): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });
  }

  /**
   * Verifies and decodes a signed JWT token
   */
  static verifyToken(token: string): JwtPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      return null;
    }
  }

  /**
   * Generates a temporary reset or onboarding token (expires in 1 hour by default)
   */
  static generateTemporaryToken(
    payload: Record<string, unknown>,
    expiresIn: SignOptions["expiresIn"] = "1h"
  ): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  }

  /**
   * Sets a tamper-proof HTTP-only cookie in the user's browser
   */
  static setAuthCookie(res: Response, token: string): void {
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  /**
   * Clears the HTTP-only cookie upon logout
   */
  static clearAuthCookie(res: Response): void {
    res.clearCookie(AUTH_COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
}
