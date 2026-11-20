/**
 * invitations.routes.ts
 * -------------------------------------------------
 * Routes for Module 4: Matchmaking & Invitations.
 * -------------------------------------------------
 */

import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { Role } from "@almalink/shared";
import { bulkDispatchInvitationsSchema, rsvpInvitationSchema } from "@almalink/shared";
import * as InvitationsController from "../controllers/invitations.controller.js";

const router = Router();

router.use(requireAuth);

// 1. Get smart matchmaking recommendations for an activity
// GET /api/invitations/match/:activityId
router.get(
  "/match/:activityId",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  InvitationsController.getRecommendations
);

// 2. Bulk dispatch invitations via Email & WhatsApp
// POST /api/invitations/dispatch
router.post(
  "/dispatch",
  requireRole(Role.CELL_COORDINATOR),
  validateBody(bulkDispatchInvitationsSchema),
  InvitationsController.dispatch
);

// 3. Get invitation tracking roster for an activity
// GET /api/invitations/activity/:activityId
router.get(
  "/activity/:activityId",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  InvitationsController.getByActivity
);

// 4. Get invitations for the logged-in alumnus
// GET /api/invitations/my
router.get(
  "/my",
  requireRole(Role.ALUMNI, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  InvitationsController.getMyInvitations
);

// 5. Submit RSVP (Accept / Decline)
// PATCH /api/invitations/:id/rsvp
router.patch(
  "/:id/rsvp",
  requireRole(Role.ALUMNI),
  validateBody(rsvpInvitationSchema),
  InvitationsController.submitRsvp
);

export default router;
