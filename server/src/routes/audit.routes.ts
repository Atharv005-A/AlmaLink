import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import { Role } from "@almalink/shared";
import { AuditController } from "../controllers/audit.controller.js";

const router = Router();

// Audit logs are read-only and strictly restricted to Super Admin & College Admin
router.use(requireAuth);
router.use(requireRole(Role.SUPER_ADMIN, Role.COLLEGE_ADMIN));

router.get("/", AuditController.getLogs);

export default router;
