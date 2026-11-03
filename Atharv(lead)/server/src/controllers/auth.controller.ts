import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthService } from "../services/auth.service.js";
import {
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UserSession,
  Role,
  UserStatus,
} from "@almalink/shared";

export class AuthController {
  /**
   * POST /api/auth/login
   * Authenticates user, verifies password, and sets HTTP-only session cookie
   */
  static async login(req: Request, res: Response): Promise<void> {
    const { email, password }: LoginInput = req.body;

    // 1. Fetch user by email including role and coordinator info
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
        cellCoordinator: true,
        alumniProfile: {
          select: { verificationStatus: true, alumniId: true },
        },
      },
    });

    if (!user) {
      res.status(401).json({
        status: "fail",
        message: "Invalid email or password.",
      });
      return;
    }

    // 2. Check if account is archived
    if (user.status === "ARCHIVED") {
      res.status(403).json({
        status: "fail",
        message: "This account has been archived. Please contact IMCC college administration.",
      });
      return;
    }

    // 3. Verify password hash
    const isPasswordValid = await AuthService.comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        status: "fail",
        message: "Invalid email or password.",
      });
      return;
    }

    // 4. Extract role and assigned cell if coordinator
    const userRole = user.role.name as Role;
    const cellId = user.cellCoordinator?.cellId || null;

    // 5. Generate signed JWT token
    const token = AuthService.generateToken({
      userId: user.userId,
      email: user.email,
      role: userRole,
      cellId,
    });

    // 6. Set HTTP-only cookie
    AuthService.setAuthCookie(res, token);

    // 7. Format clean session DTO
    const session: UserSession = {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: userRole,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      cellId,
      status: user.status as UserStatus,
    };

    res.status(200).json({
      status: "success",
      message: "Authentication successful.",
      data: {
        user: session,
        token, // Included for non-browser / mobile / API clients
        alumniVerificationStatus: user.alumniProfile?.verificationStatus || null,
      },
    });
  }

  /**
   * GET /api/auth/me
   * Restores authenticated user profile from active session token
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ status: "fail", message: "Not authenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { userId: req.user.userId },
      include: {
        role: true,
        cellCoordinator: {
          include: { cell: true },
        },
        alumniProfile: {
          select: {
            alumniId: true,
            enrollmentNo: true,
            program: true,
            graduationYear: true,
            verificationStatus: true,
            profileCompleted: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ status: "fail", message: "User account not found." });
      return;
    }

    const session: UserSession = {
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      role: user.role.name as Role,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      cellId: user.cellCoordinator?.cellId || null,
      status: user.status as UserStatus,
    };

    res.status(200).json({
      status: "success",
      data: {
        user: session,
        coordinatorCell: user.cellCoordinator?.cell || null,
        alumniProfile: user.alumniProfile || null,
      },
    });
  }

  /**
   * POST /api/auth/logout
   * Clears the HTTP-only session cookie
   */
  static async logout(_req: Request, res: Response): Promise<void> {
    AuthService.clearAuthCookie(res);
    res.status(200).json({
      status: "success",
      message: "Successfully signed out.",
    });
  }

  /**
   * POST /api/auth/forgot-password
   * Dispatches a secure password recovery token
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email }: ForgotPasswordInput = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    // We respond with a generic success message even if email is not found to prevent user enumeration
    if (!user) {
      res.status(200).json({
        status: "success",
        message: "If that email is registered, password recovery instructions have been sent.",
      });
      return;
    }

    const resetToken = AuthService.generateTemporaryToken(
      { userId: user.userId, email: user.email },
      "1h"
    );

    // In local development, return the preview URL in console/response for effortless testing
    const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password?token=${resetToken}`;
    console.log(`[DEV] Password reset link for ${email}: ${resetLink}`);

    res.status(200).json({
      status: "success",
      message: "If that email is registered, password recovery instructions have been sent.",
      devResetLink: process.env.NODE_ENV === "development" ? resetLink : undefined,
    });
  }

  /**
   * POST /api/auth/reset-password
   * Sets new password using a validated recovery token
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password }: ResetPasswordInput = req.body;

    const decoded = AuthService.verifyToken(token) as { userId: number; email: string } | null;
    if (!decoded || !decoded.userId) {
      res.status(400).json({
        status: "fail",
        message: "Password reset link is invalid or has expired.",
      });
      return;
    }

    const newHash = await AuthService.hashPassword(password);

    await prisma.user.update({
      where: { userId: decoded.userId },
      data: { passwordHash: newHash },
    });

    res.status(200).json({
      status: "success",
      message: "Password updated successfully. You may now sign in.",
    });
  }
}

