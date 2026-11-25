import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import { Role } from "@almalink/shared";
import { ReportsController } from "../controllers/reports.controller.js";

const router = Router();

router.use(requireAuth);
router.use(requireRole(Role.SUPER_ADMIN, Role.COLLEGE_ADMIN, Role.CELL_COORDINATOR));

router.get("/summary", ReportsController.getSummary);
router.get("/export/csv", ReportsController.exportCsv);

export default router;
