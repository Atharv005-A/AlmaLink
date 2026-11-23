/**
 * participations.routes.ts
 * -------------------------------------------------
 * REST route definitions for Module 6: Attendance Recording & Scoring Engine.
 * -------------------------------------------------
 */

import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { recordParticipationSchema, updateScoringPolicySchema, Role } from "@almalink/shared";
import * as ParticipationsController from "../controllers/participations.controller.js";

const router = Router();

// All participation routes require a valid login session
router.use(requireAuth);

// Record alumni attendance & award contribution points (Coordinators & Admins)
router.post(
  "/",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  validateBody(recordParticipationSchema),
  ParticipationsController.recordAttendance
);

// Get activity participation roster
router.get(
  "/activity/:activityId",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  ParticipationsController.getByActivity
);

// Get alumni verified points history
router.get(
  "/alumni/:alumniId",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN, Role.ALUMNI),
  ParticipationsController.getByAlumni
);

// Get scoring rubric policies (Admin & Coordinators)
router.get(
  "/rubric",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  ParticipationsController.getScoringRubric
);

// Update scoring rubric policy (College Admin only)
router.put(
  "/rubric",
  requireRole(Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  validateBody(updateScoringPolicySchema),
  ParticipationsController.updateScoringPolicy
);

export default router;
