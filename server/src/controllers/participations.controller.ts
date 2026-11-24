/**
 * participations.controller.ts
 * -------------------------------------------------
 * HTTP controllers for Module 6: Attendance Recording & Scoring Engine.
 *
 * Endpoints:
 *  - POST  /api/participations                  -> record attendance and award points
 *  - GET   /api/participations/activity/:id     -> get activity participation records
 *  - GET   /api/participations/alumni/:alumniId -> get alumni points history
 *  - GET   /api/scoring-rubric                  -> get scoring policies
 *  - PUT   /api/scoring-rubric                  -> update a scoring policy
 * -------------------------------------------------
 */

import { Request, Response } from "express";
import * as ParticipationService from "../services/participations.service.js";

// POST /api/participations
export async function recordAttendance(req: Request, res: Response): Promise<void> {
  try {
    const verifiedById = req.user?.userId ?? 1;
    const record = await ParticipationService.recordAttendance(req.body, verifiedById);

    res.status(201).json({
      status: "success",
      message: "Attendance and contribution points successfully recorded.",
      data: record,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to record participation",
    });
  }
}

// GET /api/participations/activity/:activityId
export async function getByActivity(req: Request, res: Response): Promise<void> {
  try {
    const activityId = parseInt(req.params.activityId, 10);
    if (isNaN(activityId)) {
      res.status(400).json({ status: "fail", message: "Invalid activity ID" });
      return;
    }

    const records = await ParticipationService.getActivityParticipations(activityId);
    res.status(200).json({
      status: "success",
      count: records.length,
      data: records,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve participation records",
    });
  }
}

// GET /api/participations/alumni/:alumniId
export async function getByAlumni(req: Request, res: Response): Promise<void> {
  try {
    const alumniId = parseInt(req.params.alumniId, 10);
    if (isNaN(alumniId)) {
      res.status(400).json({ status: "fail", message: "Invalid alumni ID" });
      return;
    }

    const history = await ParticipationService.getAlumniPointsHistory(alumniId);
    res.status(200).json({
      status: "success",
      data: history,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve alumni points history",
    });
  }
}

// GET /api/scoring-rubric
export async function getScoringRubric(req: Request, res: Response): Promise<void> {
  try {
    const policies = await ParticipationService.getScoringPolicies();
    res.status(200).json({
      status: "success",
      count: policies.length,
      data: policies,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to retrieve scoring rubric",
    });
  }
}

// PUT /api/scoring-rubric
export async function updateScoringPolicy(req: Request, res: Response): Promise<void> {
  try {
    const { activityType, defaultPoints, description } = req.body;
    const updatedById = req.user?.userId ?? 1;

    const policy = await ParticipationService.updateScoringPolicy(
      activityType,
      defaultPoints,
      description,
      updatedById
    );

    res.status(200).json({
      status: "success",
      message: `Scoring policy for '${activityType}' successfully updated.`,
      data: policy,
    });
  } catch (error: any) {
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to update scoring policy",
    });
  }
}
