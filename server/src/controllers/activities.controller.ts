/**
 * activities.controller.ts
 * -------------------------------------------------
 * HTTP request handlers for Module 3: Activity & Event Management.
 *
 * Each function here:
 *  1. Reads from req.params / req.body / req.query
 *  2. Calls the service layer for business logic
 *  3. Sends a structured JSON response
 *
 * Controllers are intentionally kept thin — no Prisma calls here.
 * All database operations live in activities.service.ts
 * -------------------------------------------------
 */

import { Request, Response } from "express";
import * as ActivitiesService from "../services/activities.service.js";

// ─── GET /api/activities/categories ──────────────────────────────────────────
/**
 * Returns all activity categories for the "Create Activity" form dropdown.
 * Example response: ["Guest Lecture", "Hackathon", "Mock Interview", ...]
 * Accessible by: Cell Coordinator, College Admin, Super Admin
 */
export async function listCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await ActivitiesService.getActivityCategories();
    res.status(200).json({ status: "success", data: categories });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch activity categories." });
  }
}

// ─── GET /api/activities?cellId=1&status=DRAFT ───────────────────────────────
/**
 * Lists all activities for a cell, optionally filtered by status.
 *
 * Query parameters:
 *  - cellId (required): The cell whose activities to fetch
 *  - status (optional): DRAFT | PUBLISHED | ONGOING | COMPLETED
 *
 * Accessible by: Cell Coordinator (their own cell only), College Admin, Super Admin
 */
export async function listActivities(req: Request, res: Response): Promise<void> {
  try {
    // Parse cellId from query string; fall back to the coordinator's own cell
    const cellId = parseInt(req.query.cellId as string, 10) || req.user?.cellId;

    if (!cellId) {
      res.status(400).json({ status: "fail", message: "cellId is required." });
      return;
    }

    const status = req.query.status as string | undefined;
    const activities = await ActivitiesService.getActivitiesByCell(cellId, status);

    res.status(200).json({
      status: "success",
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch activities." });
  }
}

// ─── GET /api/activities/:id ──────────────────────────────────────────────────
/**
 * Fetches a single activity with full details (category, cell, creator,
 * invitation count, participation count).
 *
 * Accessible by: Cell Coordinator, College Admin, Super Admin
 */
export async function getActivity(req: Request, res: Response): Promise<void> {
  try {
    const activityId = parseInt(req.params.id, 10);

    if (isNaN(activityId)) {
      res.status(400).json({ status: "fail", message: "Invalid activity ID." });
      return;
    }

    const activity = await ActivitiesService.getActivityById(activityId);

    if (!activity) {
      res.status(404).json({ status: "fail", message: "Activity not found." });
      return;
    }

    res.status(200).json({ status: "success", data: activity });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to fetch activity." });
  }
}

// ─── POST /api/activities ─────────────────────────────────────────────────────
/**
 * Creates a new activity in DRAFT status.
 *
 * Body is validated by Zod `createActivitySchema` via validateBody middleware
 * before this handler is called — so req.body is already clean and typed.
 *
 * Accessible by: Cell Coordinator ONLY
 */
export async function createActivity(req: Request, res: Response): Promise<void> {
  try {
    // req.user is set by requireAuth middleware after JWT verification
    const coordinatorUserId = req.user!.userId;

    const activity = await ActivitiesService.createActivity(req.body, coordinatorUserId);

    res.status(201).json({
      status: "success",
      message: "Activity created as Draft. Publish it when ready to invite alumni.",
      data: activity,
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Failed to create activity." });
  }
}

// ─── PATCH /api/activities/:id/status ────────────────────────────────────────
/**
 * Advances the activity lifecycle:
 *   DRAFT → PUBLISHED → ONGOING → COMPLETED
 *
 * Body: { status: "PUBLISHED" | "ONGOING" | "COMPLETED" | "DRAFT" }
 *
 * The service layer enforces that only valid forward transitions are allowed.
 *
 * Accessible by: Cell Coordinator ONLY
 */
export async function updateActivityStatus(req: Request, res: Response): Promise<void> {
  try {
    const activityId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ status: "fail", message: "New status is required in request body." });
      return;
    }

    const updated = await ActivitiesService.updateActivityStatus(
      activityId,
      status,
      req.user!.userId
    );

    res.status(200).json({
      status: "success",
      message: `Activity status updated to ${updated.status}.`,
      data: updated,
    });
  } catch (error: any) {
    // Service throws descriptive errors (e.g., invalid transition)
    res.status(400).json({ status: "fail", message: error.message });
  }
}

// ─── DELETE /api/activities/:id ───────────────────────────────────────────────
/**
 * Permanently deletes a DRAFT activity.
 * Published / Ongoing / Completed activities cannot be deleted.
 *
 * Accessible by: Cell Coordinator ONLY
 */
export async function deleteActivity(req: Request, res: Response): Promise<void> {
  try {
    const activityId = parseInt(req.params.id, 10);
    await ActivitiesService.deleteActivity(activityId);

    res.status(200).json({
      status: "success",
      message: "Draft activity deleted successfully.",
    });
  } catch (error: any) {
    res.status(400).json({ status: "fail", message: error.message });
  }
}
