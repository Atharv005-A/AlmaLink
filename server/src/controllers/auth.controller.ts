import { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AuthService } from "../services/auth.service.js";
import { EmailService } from "../services/email.service.js";
import {
  LoginInput,
  AlumniRegisterInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UserSession,
  Role,
  UserStatus,
  AuditAction,
} from "@almalink/shared";

export class AuthController {
  /**
   * POST /api/auth/register
   * Registers a new alumnus with status PENDING and alumniProfile verificationStatus PENDING
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const {
        fullName,
        email,
        phone,
        password,
        program,
        graduationYear,
        enrollmentNo,
      }: AlumniRegisterInput = req.body;

      // 1. Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({
          status: "fail",
          message:
            "An account with this email address already exists. Please sign in or use another email.",
        });
        return;
      }

      // 2. Check if enrollment number is already registered
      const existingAlumni = await prisma.alumniProfile.findUnique({
        where: { enrollmentNo },
      });

      if (existingAlumni) {
        res.status(409).json({
          status: "fail",
          message:
            "An alumni registration with this enrollment number already exists. If this is an error, please contact college administration.",
        });
        return;
      }

      // 3. Find ALUMNI role
      const alumniRole = await prisma.role.findUnique({
        where: { name: Role.ALUMNI },
      });

      if (!alumniRole) {
        res.status(500).json({
          status: "error",
          message: "Alumni role not configured in the system.",
        });
        return;
      }

      // 4. Hash password
      const passwordHash = await AuthService.hashPassword(password);

      // 5. Create user and profile in transaction
      const clientIp =
        (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "127.0.0.1";

      const { user, profile } = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            roleId: alumniRole.roleId,
            email,
            passwordHash,
            fullName,
            phone,
            status: "PENDING",
          },
        });

        const newProfile = await tx.alumniProfile.create({
          data: {
            userId: newUser.userId,
            program,
            graduationYear,
            enrollmentNo,
            consentGiven: true,
            verificationStatus: "PENDING",
            profileCompleted: false,
            willingToParticipate: true,
          },
        });

        await tx.auditLog.create({
          data: {
            userId: newUser.userId,
            action: AuditAction.ALUMNI_REGISTERED,
            entityType: "AlumniProfile",
            entityId: newProfile.alumniId,
            details: JSON.stringify({
              program,
              graduationYear,
              enrollmentNo,
              registeredAt: new Date().toISOString(),
            }),
            ipAddress: clientIp.slice(0, 45),
          },
        });

        return { user: newUser, profile: newProfile };
      });

      const referenceId = `AL-${String(profile.alumniId).padStart(4, "0")}`;

      // 6. Send acknowledgment email asynchronously
      EmailService.sendAlumniRegistrationReceivedEmail(
        user.email,
        user.fullName,
        referenceId
      ).catch((err) => {
        console.error("[EMAIL ERROR] Failed to send registration email:", err);
      });

      res.status(201).json({
        status: "success",
        message: "Registration submitted successfully. College verification is in progress.",
        data: {
          referenceId,
          fullName: user.fullName,
          email: user.email,
          program: profile.program,
          graduationYear: profile.graduationYear,
          submittedAt: profile.createdAt.toISOString(),
        },
      });
    } catch (err: any) {
      console.error("[AUTH REGISTER ERROR]:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to process alumni registration. Please try again.",
      });
    }
  }

  /**
   * POST /api/auth/login
   * Authenticates user, verifies password, and sets HTTP-only session cookie
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
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
    } catch (err: any) {
      console.error("[AUTH LOGIN ERROR]:", err);
      res.status(500).json({
        status: "error",
        message: "Authentication service error. Please try again.",
      });
    }
  }

  /**
   * GET /api/auth/me
   * Restores authenticated user profile from active session token
   */
  static async getCurrentUser(req: Request, res: Response): Promise<void> {
    try {
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
    } catch (err: any) {
      console.error("[AUTH GET CURRENT USER ERROR]:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to retrieve session.",
      });
    }
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
    try {
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

      // Construct reset link dynamically adapting to client origin (localhost:5174 in dev or custom domain in prod)
      const clientOrigin = req.headers.origin || process.env.CLIENT_URL || "http://localhost:5174";
      const resetLink = `${clientOrigin}/reset-password?token=${resetToken}`;
      console.log(`[DEV] Password reset link for ${email}: ${resetLink}`);

      // Dispatch password reset email via Brevo service (or console simulation in dev)
      await EmailService.sendPasswordResetEmail(user.email, user.fullName, resetLink);

      res.status(200).json({
        status: "success",
        message: "If that email is registered, password recovery instructions have been sent.",
        devResetLink: process.env.NODE_ENV === "development" ? resetLink : undefined,
      });
    } catch (err: any) {
      console.error("[AUTH FORGOT PASSWORD ERROR]:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to process password recovery.",
      });
    }
  }

  /**
   * GET /api/auth/invitation/:token
   * Validates a staff onboarding token and returns prefilled coordinator details
   */
  static async verifyInvitation(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;

      if (!token) {
        res.status(400).json({
          status: "fail",
          message: "Invitation token is required.",
        });
        return;
      }

      const decoded = AuthService.verifyToken(token) as { userId: number; email: string } | null;
      if (!decoded || !decoded.userId) {
        res.status(400).json({
          status: "fail",
          message: "This invitation link is invalid or has expired.",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { userId: decoded.userId },
        include: {
          role: true,
          cellCoordinator: {
            include: { cell: true },
          },
        },
      });

      if (!user) {
        res.status(404).json({
          status: "fail",
          message: "Staff account not found.",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: {
          fullName: user.fullName,
          email: user.email,
          role: "Cell Coordinator",
          assignedCell: user.cellCoordinator?.cell?.name || "General Academic Cell",
          cellCode: user.cellCoordinator?.cell?.code || "GENERAL",
        },
      });
    } catch (err: any) {
      console.error("[AUTH VERIFY INVITATION ERROR]:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to verify invitation.",
      });
    }
  }

  /**
   * POST /api/auth/reset-password
   * Sets new password using a validated recovery token
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
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
    } catch (err: any) {
      console.error("[AUTH RESET PASSWORD ERROR]:", err);
      res.status(500).json({
        status: "error",
        message: "Failed to reset password.",
      });
    }
  }

  /**
   * GET /api/auth/registration-status
   * Public check for registration verification status using referenceId or email
   */
  static async getRegistrationStatus(req: Request, res: Response): Promise<void> {
    try {
      const referenceId = (req.query.referenceId as string)?.trim().toUpperCase();
      const email = (req.query.email as string)?.trim().toLowerCase();

      let alumniId: number | null = null;
      if (referenceId && referenceId.startsWith("AL-")) {
        const parsed = parseInt(referenceId.replace("AL-", ""), 10);
        if (!isNaN(parsed)) {
          alumniId = parsed;
        }
      }

      let profile: any = null;

      if (alumniId) {
        profile = await prisma.alumniProfile.findUnique({
          where: { alumniId },
          include: { user: true },
        });
      } else if (email) {
        const user = await prisma.user.findUnique({
          where: { email },
          include: { alumniProfile: true },
        });
        if (user && user.alumniProfile) {
          profile = { ...user.alumniProfile, user };
        }
      }

      if (!profile) {
        res.status(404).json({
          status: "fail",
          message: "Registration record not found.",
        });
        return;
      }

      res.status(200).json({
        status: "success",
        data: {
          referenceId: `AL-${String(profile.alumniId).padStart(4, "0")}`,
          fullName: profile.user.fullName,
          email: profile.user.email,
          program: profile.program,
          graduationYear: profile.graduationYear,
          verificationStatus: profile.verificationStatus,
          verificationNote: profile.verificationNote || null,
          isVerified: profile.verificationStatus === "VERIFIED",
        },
      });
    } catch (err: any) {
      console.error("[REGISTRATION STATUS CHECK ERROR]:", err);
      res.status(500).json({ status: "error", message: "Failed to check status" });
    }
  }
}
