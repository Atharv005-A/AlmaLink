/**
 * awards.controller.ts
 * -------------------------------------------------
 * HTTP controllers for Module 7:
 * Private Leaderboard, Seasonal Award Nominations & Staff Voting
 * -------------------------------------------------
 */

import { Request, Response } from "express";
import { AwardsService } from "../services/awards.service.js";

// GET /api/leaderboard
export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const academicYear = (req.query.academicYear as string) || "2026-27";
    const cellId = req.query.cellId ? parseInt(req.query.cellId as string, 10) : undefined;
    const batch = req.query.batch ? parseInt(req.query.batch as string, 10) : undefined;

    const data = await AwardsService.getLeaderboard({ academicYear, cellId, batch });

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve leaderboard data",
    });
  }
}

// GET /api/awards/nominations
export async function getNominations(req: Request, res: Response): Promise<void> {
  try {
    const academicYear = (req.query.academicYear as string) || "2026-27";
    const cellId = req.query.cellId ? parseInt(req.query.cellId as string, 10) : undefined;

    const data = await AwardsService.getNominations({ academicYear, cellId });

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve nominations",
    });
  }
}

// POST /api/awards/nominations
export async function createNomination(req: Request, res: Response): Promise<void> {
  try {
    const nominatedById = req.user?.userId ?? 1;
    const data = await AwardsService.createNomination(req.body, nominatedById);

    res.status(201).json({
      status: "success",
      message: "Nomination submitted successfully.",
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      status: "error",
      message: error.message || "Failed to submit nomination",
    });
  }
}

// GET /api/awards/shortlist
export async function getShortlist(req: Request, res: Response): Promise<void> {
  try {
    const academicYear = (req.query.academicYear as string) || "2026-27";
    const data = await AwardsService.getShortlist(academicYear);

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve shortlist",
    });
  }
}

// POST /api/awards/shortlist
export async function updateShortlist(req: Request, res: Response): Promise<void> {
  try {
    const { academicYear, nominationIds } = req.body;
    if (!academicYear || !Array.isArray(nominationIds)) {
      res.status(400).json({
        status: "error",
        message: "academicYear and nominationIds array are required",
      });
      return;
    }

    const data = await AwardsService.updateShortlist(academicYear, nominationIds);

    res.status(200).json({
      status: "success",
      message: "Shortlist updated successfully.",
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      status: "error",
      message: error.message || "Failed to update shortlist",
    });
  }
}

// POST /api/awards/vote
export async function castVote(req: Request, res: Response): Promise<void> {
  try {
    const voterId = req.user?.userId ?? 1;
    const result = await AwardsService.castVote(req.body, voterId);

    res.status(200).json({
      status: "success",
      message: result.message,
      data: { voteId: result.voteId },
    });
  } catch (error: any) {
    res.status(400).json({
      status: "error",
      message: error.message || "Failed to cast vote",
    });
  }
}

// GET /api/awards/voting-status
export async function getVotingStatus(req: Request, res: Response): Promise<void> {
  try {
    const academicYear = (req.query.academicYear as string) || "2026-27";
    const voterId = req.user?.userId ?? 1;

    const data = await AwardsService.getVotingStatus(academicYear, voterId);

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to check voting status",
    });
  }
}

// POST /api/awards/winner
export async function confirmWinner(req: Request, res: Response): Promise<void> {
  try {
    const adminUserId = req.user?.userId ?? 1;
    const nominationId = parseInt(req.body.nominationId, 10);

    if (isNaN(nominationId)) {
      res.status(400).json({
        status: "error",
        message: "Valid nominationId is required",
      });
      return;
    }

    const data = await AwardsService.confirmWinner(nominationId, adminUserId);

    res.status(200).json({
      status: "success",
      message: "Annual Alumni of the Year winner confirmed and certificate generated.",
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      status: "error",
      message: error.message || "Failed to confirm award winner",
    });
  }
}

// GET /api/awards/winner
export async function getWinner(req: Request, res: Response): Promise<void> {
  try {
    const academicYear = (req.query.academicYear as string) || "2026-27";
    const data = await AwardsService.getWinner(academicYear);

    res.status(200).json({
      status: "success",
      data,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve award winner",
    });
  }
}
