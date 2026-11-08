/**
 * activities.routes.ts
 * -------------------------------------------------
 * REST route definitions for Module 3: Activity & Event Management.
 *
 * All routes under /api/activities require:
 *  1. requireAuth    — Valid JWT session (user must be logged in)
 *  2. requireRole    — Only specific roles can access each endpoint
 *  3. validateBody   — Zod schema validation on POST/PATCH request bodies
 *
 * RBAC Summary:
 *  - GET  (read)    → Cell Coordinator, College Admin, Super Admin can all read
 *  - POST (create)  → Cell Coordinator ONLY
 *  - PATCH (status) → Cell Coordinator ONLY
 *  - DELETE         → Cell Coordinator ONLY
 * -------------------------------------------------
 */

import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole, requireCellAccess } from "../middleware/rbac.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createActivitySchema } from "@almalink/shared";
import { Role } from "@almalink/shared";
import * as ActivitiesController from "../controllers/activities.controller.js";

const router = Router();

// All activity routes require a valid login session
router.use(requireAuth);

// ─── Category lookup (used by the Create Activity form dropdown) ──────────────
// GET /api/activities/categories
// Who can call this: Any logged-in staff or coordinator
router.get(
  "/categories",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  ActivitiesController.listCategories
);

// ─── List activities for a cell ───────────────────────────────────────────────
// GET /api/activities?cellId=1&status=DRAFT
// Coordinators are further restricted by requireCellAccess (must own the cell)
router.get(
  "/",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  requireCellAccess,
  ActivitiesController.listActivities
);

// ─── Get single activity detail ───────────────────────────────────────────────
// GET /api/activities/:id
router.get(
  "/:id",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  ActivitiesController.getActivity
);

// ─── Create new activity ──────────────────────────────────────────────────────
// POST /api/activities
// RESTRICTED to Cell Coordinator ONLY — This is the "Add Event" button guard
// validateBody runs the Zod createActivitySchema before the controller fires
router.post(
  "/",
  requireRole(Role.CELL_COORDINATOR),  // ← Only coordinators can add events
  requireCellAccess,
  validateBody(createActivitySchema),
  ActivitiesController.createActivity
);

// ─── Update activity status (lifecycle transition) ────────────────────────────
// PATCH /api/activities/:id/status
// Body: { status: "PUBLISHED" | "ONGOING" | "COMPLETED" }
router.patch(
  "/:id/status",
  requireRole(Role.CELL_COORDINATOR),  // ← Only coordinators can publish events
  ActivitiesController.updateActivityStatus
);

// ─── Delete a DRAFT activity ──────────────────────────────────────────────────
// DELETE /api/activities/:id
router.delete(
  "/:id",
  requireRole(Role.CELL_COORDINATOR),  // ← Only coordinators can delete their drafts
  ActivitiesController.deleteActivity
);

export default router;
