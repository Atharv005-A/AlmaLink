import { Router } from "express";
import { StaffCellsController } from "../controllers/staff-cells.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import { Role } from "@almalink/shared";

const router = Router();

// Staff and cells management is restricted to Super Admin and College Admin (Dr. Anjali Joshi)
router.use(requireAuth, requireRole(Role.SUPER_ADMIN, Role.COLLEGE_ADMIN));

// Cell endpoints
router.get("/cells", StaffCellsController.getCells);
router.post("/cells", StaffCellsController.createCell);
router.patch("/cells/:id/toggle", StaffCellsController.toggleCellStatus);
router.patch("/cells/:id/assign", StaffCellsController.assignCoordinator);

// Staff endpoints
router.get("/staff", StaffCellsController.getStaff);
router.post("/staff/invite", StaffCellsController.inviteStaff);
router.patch("/staff/:id/status", StaffCellsController.updateStaffStatus);
router.post("/staff/:id/resend", StaffCellsController.resendInvitation);

export default router;
