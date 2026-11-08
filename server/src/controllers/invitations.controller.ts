/**
 * invitations.controller.ts
 * -------------------------------------------------
 * HTTP controllers for Module 4: Matchmaking and Invitations.
 *
 * Endpoints handled:
 *  - GET   /api/invitations/match/:activityId   -> get ranked alumni recommendations
 *  - POST  /api/invitations/dispatch            -> dispatch invitations in bulk
 *  - GET   /api/invitations/activity/:id        -> get activity invitation tracking roster
 *  - GET   /api/invitations/my                  -> get invitations for logged in alumnus
 *  - PATCH /api/invitations/:id/rsvp            -> accept or decline invitation
 * -------------------------------------------------
 */

import { Request, Response } from "express";
import * as MatchmakingService from "../services/matchmaking.service.js";

// GET /api/invitations/match/:activityId
export async function getRecommendations(req: Request, res: Response): Promise<void> {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    if (isNaN(activityId)) {
      res.status(400).json({ status: "fail", message: "Invalid activity ID" });
      return;
    }

    const matches = await MatchmakingService.getMatchRecommendations(activityId);
    res.status(200).json({
      status: "success",
      count: matches.length,
      data: matches,
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message || "Failed to calculate matches" });
  }
}

// POST /api/invitations/dispatch
export async function dispatch(req: Request, res: Response): Promise<void> {
  try {
    const senderUserId = req.user!.userId;
    const result = await MatchmakingService.bulkDispatchInvitations(req.body, senderUserId);

    res.status(201).json({
      status: "success",
      message: `Successfully dispatched ${result.length} invitations.`,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message || "Failed to dispatch invitations" });
  }
}

// GET /api/invitations/activity/:activityId
export async function getByActivity(req: Request, res: Response): Promise<void> {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    if (isNaN(activityId)) {
      res.status(400).json({ status: "fail", message: "Invalid activity ID" });
      return;
    }

    const roster = await MatchmakingService.getActivityInvitations(activityId);
    res.status(200).json({
      status: "success",
      count: roster.length,
      data: roster,
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message || "Failed to fetch invitation roster" });
  }
}

// GET /api/invitations/my
export async function getMyInvitations(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const invitations = await MatchmakingService.getAlumniInvitations(userId);

    res.status(200).json({
      status: "success",
      count: invitations.length,
      data: invitations,
    });
  } catch (error: any) {
    res.status(500).json({ status: "error", message: error.message || "Failed to fetch your invitations" });
  }
}

// PATCH /api/invitations/:id/rsvp
export async function submitRsvp(req: Request, res: Response): Promise<void> {
  try {
    const invitationId = parseInt(req.params.id, 10);
    if (isNaN(invitationId)) {
      res.status(400).json({ status: "fail", message: "Invalid invitation ID" });
      return;
    }

    const updated = await MatchmakingService.rsvpInvitation(invitationId, req.body);
    res.status(200).json({
      status: "success",
      message: `Invitation marked as ${updated.status}.`,
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ status: "fail", message: error.message || "Failed to submit RSVP" });
  }
}
