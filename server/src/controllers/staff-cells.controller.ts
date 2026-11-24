import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { EmailService } from "../services/email.service.js";
import { AuthService } from "../services/auth.service.js";
import {
  Role,
  AuditAction,
  createCellSchema,
  assignCoordinatorSchema,
  inviteStaffSchema,
} from "@almalink/shared";

export class StaffCellsController {
  /**
   * GET /api/staff-cells/cells
   * Lists all college cells with coordinator details, upcoming activities, and approved records count
   */
  static async getCells(req: Request, res: Response): Promise<void> {
    try {
      const cells = await prisma.cell.findMany({
        orderBy: { cellId: "asc" },
        include: {
          headStaff: {
            select: { userId: true, fullName: true, email: true },
          },
          coordinators: {
            include: {
              user: {
                select: { userId: true, fullName: true, email: true, status: true },
              },
            },
          },
          activities: {
            select: {
              activityId: true,
              status: true,
              startAt: true,
              participations: {
                select: { participationId: true, attended: true },
              },
            },
          },
        },
      });

      const formatted = cells.map((cell) => {
        // Derive upcoming activities (status = PUBLISHED or date >= now)
        const upcomingCount = cell.activities.filter((a) => a.status === "PUBLISHED").length;

        // Derive approved records (attended participations)
        const approvedRecordsCount = cell.activities.reduce((acc, a) => {
          return acc + a.participations.filter((p) => p.attended).length;
        }, 0);

        // Derive focus summary
        let focus = "General Campus Engagement";
        if (cell.code === "TECH") focus = "Workshops · Hackathons";
        else if (cell.code === "PLACE") focus = "Interviews · Career Guidance";
        else if (cell.code === "CULT") focus = "Arts · Cultural Events";
        else if (cell.code === "SPORTS") focus = "Sports · Coaching";
        else if (cell.code === "ECELL") focus = "Founders · Mentoring";
        else if (cell.description) {
          focus = cell.description.slice(0, 32) + "...";
        }

        return {
          cellId: cell.cellId,
          name: cell.name,
          code: cell.code,
          description: cell.description,
          isActive: cell.isActive,
          headStaffId: cell.headStaffId,
          headStaffName: cell.headStaff?.fullName || null,
          focus,
          upcomingCount,
          approvedRecordsCount,
          coordinators: cell.coordinators.map((c) => ({
            userId: c.user.userId,
            fullName: c.user.fullName,
            email: c.user.email,
            status: c.user.status,
            assignedOn: c.assignedOn.toISOString(),
          })),
        };
      });

      res.status(200).json({ status: "success", success: true, data: formatted });
    } catch (error) {
      console.error("[GET CELLS ERROR]:", error);
      res.status(500).json({ status: "error", success: false, message: "Failed to fetch cells" });
    }
  }

  /**
   * POST /api/staff-cells/cells
   * Creates a new engagement cell and optionally assigns a coordinator
   */
  static async createCell(req: Request, res: Response): Promise<void> {
    try {
      const parsed = createCellSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          status: "fail",
          success: false,
          message: "Invalid cell data",
          errors: parsed.error.format(),
        });
        return;
      }

      const { name, code, description, headStaffId, coordinatorUserId } = parsed.data;

      // Check unique name and code
      const existing = await prisma.cell.findFirst({
        where: {
          OR: [
            { name: { equals: name, mode: "insensitive" } },
            { code: { equals: code, mode: "insensitive" } },
          ],
        },
      });

      if (existing) {
        res.status(409).json({
          status: "fail",
          success: false,
          message: `A cell with code "${code}" or name "${name}" already exists.`,
        });
        return;
      }

      const newCell = await prisma.cell.create({
        data: {
          name,
          code: code.toUpperCase(),
          description: description || null,
          headStaffId: headStaffId || null,
          isActive: true,
        },
      });

      // If coordinator assignment is requested
      if (coordinatorUserId) {
        // Enforce 1-coordinator-to-1-cell rule
        await prisma.cellCoordinator.deleteMany({
          where: { userId: coordinatorUserId },
        });

        await prisma.cellCoordinator.create({
          data: {
            cellId: newCell.cellId,
            userId: coordinatorUserId,
          },
        });
      }

      // Record in Audit Log
      const actorId = req.user?.userId || headStaffId || null;
      if (actorId) {
        await prisma.auditLog
          .create({
            data: {
              userId: actorId,
              action: AuditAction.CELL_CREATED,
              entityType: "CELL",
              entityId: newCell.cellId,
              details: `Created cell "${name}" (${code})`,
              ipAddress: req.ip || "127.0.0.1",
            },
          })
          .catch(() => {});
      }

      res.status(201).json({
        status: "success",
        success: true,
        message: "Cell created successfully",
        data: newCell,
      });
    } catch (error) {
      console.error("[CREATE CELL ERROR]:", error);
      res.status(500).json({ status: "error", success: false, message: "Failed to create cell" });
    }
  }

  /**
   * PATCH /api/staff-cells/cells/:id/toggle
   * Toggles active/inactive status of a cell
   */
  static async toggleCellStatus(req: Request, res: Response): Promise<void> {
    try {
      const cellId = parseInt(req.params.id, 10);
      if (isNaN(cellId)) {
        res.status(400).json({ status: "fail", success: false, message: "Invalid cell ID" });
        return;
      }

      const cell = await prisma.cell.findUnique({ where: { cellId } });
      if (!cell) {
        res.status(404).json({ status: "fail", success: false, message: "Cell not found" });
        return;
      }

      const updated = await prisma.cell.update({
        where: { cellId },
        data: { isActive: !cell.isActive },
      });

      // Audit Log
      const actorId = req.user?.userId;
      if (actorId) {
        await prisma.auditLog
          .create({
            data: {
              userId: actorId,
              action: AuditAction.CELL_UPDATED,
              entityType: "CELL",
              entityId: cellId,
              details: `Toggled cell "${cell.name}" status to ${updated.isActive ? "ACTIVE" : "INACTIVE"}`,
              ipAddress: req.ip || "127.0.0.1",
            },
          })
          .catch(() => {});
      }

      res.status(200).json({
        status: "success",
        success: true,
        message: `Cell status updated to ${updated.isActive ? "Active" : "Inactive"}`,
        data: updated,
      });
    } catch (error) {
      console.error("[TOGGLE CELL ERROR]:", error);
      res
        .status(500)
        .json({ status: "error", success: false, message: "Failed to update cell status" });
    }
  }

  /**
   * PATCH /api/staff-cells/cells/:id/assign
   * Assigns or updates a coordinator for a cell
   */
  static async assignCoordinator(req: Request, res: Response): Promise<void> {
    try {
      const cellId = parseInt(req.params.id, 10);
      const parsed = assignCoordinatorSchema.safeParse({
        cellId,
        userId: req.body.userId,
      });

      if (!parsed.success) {
        res.status(400).json({
          status: "fail",
          success: false,
          message: "Invalid assignment data",
          errors: parsed.error.format(),
        });
        return;
      }

      const { userId } = parsed.data;

      // Enforce 1-coordinator-to-1-cell rule
      await prisma.cellCoordinator.deleteMany({
        where: { userId },
      });

      const assignment = await prisma.cellCoordinator.create({
        data: { cellId, userId },
        include: {
          user: { select: { fullName: true, email: true } },
          cell: { select: { name: true } },
        },
      });

      // Audit Log
      const actorId = req.user?.userId;
      if (actorId) {
        await prisma.auditLog
          .create({
            data: {
              userId: actorId,
              action: AuditAction.COORDINATOR_ASSIGNED,
              entityType: "CELL_COORDINATOR",
              entityId: cellId,
              details: `Assigned ${assignment.user.fullName} to ${assignment.cell.name}`,
              ipAddress: req.ip || "127.0.0.1",
            },
          })
          .catch(() => {});
      }

      res.status(200).json({
        status: "success",
        success: true,
        message: "Coordinator assigned successfully",
        data: assignment,
      });
    } catch (error) {
      console.error("[ASSIGN COORDINATOR ERROR]:", error);
      res
        .status(500)
        .json({ status: "error", success: false, message: "Failed to assign coordinator" });
    }
  }

  /**
   * GET /api/staff-cells/staff
   * Lists college staff members with role, cell assignments, and status
   */
  static async getStaff(req: Request, res: Response): Promise<void> {
    try {
      const search = (req.query.search as string)?.trim() || "";
      const roleFilter = (req.query.role as string) || "ALL";
      const cellFilter = (req.query.cell as string) || "ALL";
      const statusFilter = (req.query.status as string) || "ALL";

      // 1. Fetch staff roles (COLLEGE_ADMIN, SUPER_ADMIN, CELL_COORDINATOR)
      const staffRoles = await prisma.role.findMany({
        where: {
          name: { in: ["COLLEGE_ADMIN", "SUPER_ADMIN", "CELL_COORDINATOR"] },
        },
      });
      const roleIds = staffRoles.map((r) => r.roleId);

      const where: any = {
        roleId: { in: roleIds },
      };

      if (search) {
        where.OR = [
          { fullName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ];
      }

      if (roleFilter !== "ALL") {
        if (roleFilter === "ADMIN") {
          const adminRoles = staffRoles
            .filter((r) => r.name === "COLLEGE_ADMIN" || r.name === "SUPER_ADMIN")
            .map((r) => r.roleId);
          where.roleId = { in: adminRoles };
        } else if (roleFilter === "COORDINATOR") {
          const coordRole = staffRoles.find((r) => r.name === "CELL_COORDINATOR");
          if (coordRole) where.roleId = coordRole.roleId;
        }
      }

      if (statusFilter !== "ALL") {
        where.status = statusFilter;
      }

      const users = await prisma.user.findMany({
        where,
        orderBy: { createdAt: "asc" },
        include: {
          role: true,
          cellCoordinator: {
            include: { cell: true },
          },
        },
      });

      const formatted = users
        .map((u) => {
          const isCollegeAdmin = u.role.name === "COLLEGE_ADMIN" || u.role.name === "SUPER_ADMIN";
          const assignedCellId = u.cellCoordinator?.cellId || null;
          const assignedCellName = isCollegeAdmin
            ? "All cells"
            : u.cellCoordinator?.cell?.name || "Unassigned";

          // Format display role
          const displayRole = isCollegeAdmin ? "Admin · HOD" : "Coordinator";

          return {
            userId: u.userId,
            fullName: u.fullName,
            email: u.email,
            phone: u.phone,
            role: displayRole,
            roleId: u.roleId,
            assignedCellId,
            assignedCellName,
            status: u.status as "ACTIVE" | "INVITED" | "INACTIVE" | "ARCHIVED",
            createdAt: u.createdAt.toISOString(),
            lastLogin: u.updatedAt.toISOString(),
          };
        })
        .filter((staff) => {
          if (cellFilter === "ALL") return true;
          if (cellFilter === "UNASSIGNED") return staff.assignedCellName === "Unassigned";
          return (
            staff.assignedCellId?.toString() === cellFilter ||
            staff.assignedCellName?.toLowerCase().includes(cellFilter.toLowerCase())
          );
        });

      res.status(200).json({ status: "success", success: true, data: formatted });
    } catch (error) {
      console.error("[GET STAFF ERROR]:", error);
      res
        .status(500)
        .json({ status: "error", success: false, message: "Failed to fetch staff directory" });
    }
  }

  /**
   * POST /api/staff-cells/staff/invite
   * Invites a new staff coordinator and dispatches an onboarding email
   */
  static async inviteStaff(req: Request, res: Response): Promise<void> {
    try {
      const parsed = inviteStaffSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          status: "fail",
          success: false,
          message: "Invalid invitation data",
          errors: parsed.error.format(),
        });
        return;
      }

      const { fullName, email, cellId, role, sendEmailImmediately } = parsed.data;

      // 1. Check if cell exists
      const targetCell = await prisma.cell.findUnique({ where: { cellId } });
      if (!targetCell) {
        res.status(404).json({ status: "fail", success: false, message: "Target cell not found" });
        return;
      }

      // 2. Fetch target role record
      const roleRecord = await prisma.role.findUnique({
        where: { name: role },
      });
      if (!roleRecord) {
        res.status(400).json({ status: "fail", success: false, message: "Invalid role selected" });
        return;
      }

      // 3. Find or create user
      let user = await prisma.user.findUnique({ where: { email } });
      const defaultPasswordHash = await bcrypt.hash("TempPass@" + Date.now(), 10);

      if (user) {
        if (user.status === "ACTIVE") {
          res.status(409).json({
            status: "fail",
            success: false,
            message: `User with email ${email} is already active in the system.`,
          });
          return;
        }

        // Update invited user
        user = await prisma.user.update({
          where: { email },
          data: {
            fullName,
            roleId: roleRecord.roleId,
            status: "INVITED",
          },
        });
      } else {
        user = await prisma.user.create({
          data: {
            email,
            fullName,
            phone: req.body.phone || "0000000000",
            passwordHash: defaultPasswordHash,
            roleId: roleRecord.roleId,
            status: "INVITED",
          },
        });
      }

      // 4. Assign to cell (enforcing 1 coordinator per cell)
      await prisma.cellCoordinator.deleteMany({
        where: { userId: user.userId },
      });
      await prisma.cellCoordinator.create({
        data: {
          cellId,
          userId: user.userId,
        },
      });

      // 5. Generate secure onboarding token
      const onboardingToken = AuthService.generateToken({
        userId: user.userId,
        email: user.email,
        role: roleRecord.name as Role,
        cellId,
      });

      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const invitationLink = `${clientUrl}/onboarding/staff?token=${onboardingToken}`;

      // 6. Dispatch transactional email via Brevo
      if (sendEmailImmediately !== false) {
        await EmailService.sendStaffInvitationEmail(
          email,
          fullName,
          targetCell.name,
          invitationLink
        ).catch((err) => {
          console.warn("[INVITE EMAIL WARNING]:", err);
        });
      }

      // 7. Audit Log
      const actorId = req.user?.userId;
      if (actorId) {
        await prisma.auditLog
          .create({
            data: {
              userId: actorId,
              action: AuditAction.STAFF_INVITED,
              entityType: "USER",
              entityId: user.userId,
              details: `Invited ${fullName} (${email}) as coordinator for ${targetCell.name}`,
              ipAddress: req.ip || "127.0.0.1",
            },
          })
          .catch(() => {});
      }

      res.status(201).json({
        status: "success",
        success: true,
        message: `Invitation successfully sent to ${email}`,
        data: {
          userId: user.userId,
          fullName: user.fullName,
          email: user.email,
          assignedCell: targetCell.name,
          status: "INVITED",
          invitationLink,
        },
      });
    } catch (error) {
      console.error("[INVITE STAFF ERROR]:", error);
      res
        .status(500)
        .json({ status: "error", success: false, message: "Failed to invite staff member" });
    }
  }

  /**
   * PATCH /api/staff-cells/staff/:id/status
   * Deactivates or reactivates a staff member
   */
  static async updateStaffStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);
      const { status } = req.body;

      if (!["ACTIVE", "INACTIVE", "ARCHIVED"].includes(status)) {
        res.status(400).json({ status: "fail", success: false, message: "Invalid status value" });
        return;
      }

      const user = await prisma.user.findUnique({ where: { userId } });
      if (!user) {
        res.status(404).json({ status: "fail", success: false, message: "Staff member not found" });
        return;
      }

      const updated = await prisma.user.update({
        where: { userId },
        data: { status },
      });

      // Audit Log
      const actorId = req.user?.userId;
      if (actorId) {
        await prisma.auditLog
          .create({
            data: {
              userId: actorId,
              action: AuditAction.ROLE_CHANGED,
              entityType: "USER",
              entityId: userId,
              details: `Updated ${user.fullName} status to ${status}`,
              ipAddress: req.ip || "127.0.0.1",
            },
          })
          .catch(() => {});
      }

      res.status(200).json({
        status: "success",
        success: true,
        message: `Staff member status updated to ${status}`,
        data: updated,
      });
    } catch (error) {
      console.error("[UPDATE STAFF STATUS ERROR]:", error);
      res
        .status(500)
        .json({ status: "error", success: false, message: "Failed to update staff status" });
    }
  }

  /**
   * POST /api/staff-cells/staff/:id/resend
   * Resends invitation email to an invited staff member
   */
  static async resendInvitation(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await prisma.user.findUnique({
        where: { userId },
        include: {
          role: true,
          cellCoordinator: { include: { cell: true } },
        },
      });

      if (!user || user.status !== "INVITED") {
        res.status(400).json({
          status: "fail",
          success: false,
          message: "User is not in an invited state or does not exist",
        });
        return;
      }

      const cellName = user.cellCoordinator?.cell?.name || "College Cell";
      const cellId = user.cellCoordinator?.cellId || 1;

      const onboardingToken = AuthService.generateToken({
        userId: user.userId,
        email: user.email,
        role: user.role.name as Role,
        cellId,
      });

      const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
      const invitationLink = `${clientUrl}/onboarding/staff?token=${onboardingToken}`;

      await EmailService.sendStaffInvitationEmail(
        user.email,
        user.fullName,
        cellName,
        invitationLink
      );

      res.status(200).json({
        status: "success",
        success: true,
        message: `Invitation email resent to ${user.email}`,
        data: { invitationLink },
      });
    } catch (error) {
      console.error("[RESEND INVITATION ERROR]:", error);
      res
        .status(500)
        .json({ status: "error", success: false, message: "Failed to resend invitation email" });
    }
  }
}
