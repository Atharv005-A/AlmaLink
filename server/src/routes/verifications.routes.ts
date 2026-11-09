import { Router } from "express";
import { VerificationsController } from "../controllers/verifications.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import { Role } from "@almalink/shared";

const router = Router();

// All verification queue actions are strictly restricted to College & Super Admins
router.use(requireAuth, requireRole(Role.SUPER_ADMIN, Role.COLLEGE_ADMIN));

router.get("/", VerificationsController.getQueue);
router.get("/:id", VerificationsController.getById);
router.post("/:id/approve", VerificationsController.approve);
router.post("/:id/request-changes", VerificationsController.requestChanges);
router.post("/:id/reject", VerificationsController.reject);

export default router;

