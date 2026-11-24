/**
 * awards.routes.ts
 * -------------------------------------------------
 * REST route definitions for Module 7:
 * Private Leaderboard, Seasonal Award Nominations & Staff Voting
 * -------------------------------------------------
 */

import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/rbac.middleware.js";
import { validateBody } from "../middleware/validate.middleware.js";
import { createAwardNominationSchema, castAwardVoteSchema, Role } from "@almalink/shared";
import * as AwardsController from "../controllers/awards.controller.js";

const router = Router();

// All leaderboard and award routes require a valid authenticated session
router.use(requireAuth);

// ─── Private Internal Leaderboard (Staff Only) ──────────────────────────
router.get(
  "/leaderboard",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  AwardsController.getLeaderboard
);

// ─── Award Nominations ──────────────────────────────────────────────────
router.get(
  "/nominations",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  AwardsController.getNominations
);

router.post(
  "/nominations",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  validateBody(createAwardNominationSchema),
  AwardsController.createNomination
);

// ─── Top 5 Shortlist Draft ──────────────────────────────────────────────
router.get(
  "/shortlist",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  AwardsController.getShortlist
);

router.post(
  "/shortlist",
  requireRole(Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  AwardsController.updateShortlist
);

// ─── Staff Voting Round ─────────────────────────────────────────────────
router.post(
  "/vote",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  validateBody(castAwardVoteSchema),
  AwardsController.castVote
);

router.get(
  "/voting-status",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  AwardsController.getVotingStatus
);

// ─── Winner Approval & Certificates ─────────────────────────────────────
router.get(
  "/winner",
  requireRole(Role.CELL_COORDINATOR, Role.COLLEGE_ADMIN, Role.SUPER_ADMIN, Role.ALUMNI),
  AwardsController.getWinner
);

router.post(
  "/winner",
  requireRole(Role.COLLEGE_ADMIN, Role.SUPER_ADMIN),
  AwardsController.confirmWinner
);

export default router;
