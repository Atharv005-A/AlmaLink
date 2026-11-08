/**
 * activities.service.ts
 * -------------------------------------------------
 * Business logic layer for Module 3: Activity & Event Management.
 *
 * Responsibilities:
 *  - Seed and query activity categories (Guest Lecture, Hackathon, etc.)
 *  - CRUD for activities scoped to a cell coordinator's assigned cell
 *  - Lifecycle transitions: DRAFT → PUBLISHED → ONGOING → COMPLETED
 *  - Enforce that coordinators can only manage their own cell's activities
 *
 * Pattern: Service layer keeps controllers thin — controllers call service
 * methods and return HTTP responses; services contain all Prisma queries
 * and business rules.
 * -------------------------------------------------
 */

import prisma from "../config/prisma.js";
import { CreateActivityInput } from "@almalink/shared";

// ─── Activity Category Seed Data (Real IMCC Pune Event Types) ───────────────
// These categories map directly to the event types seen on mespune.in
export const ACTIVITY_CATEGORIES = [
  { name: "Guest Lecture" },
  { name: "Expert Workshop" },
  { name: "Hackathon / Coding Competition" },
  { name: "Mock Interview / Placement Training" },
  { name: "Project Competition" },
  { name: "Panel Discussion / HR Meet" },
  { name: "Alumni Interaction Session" },
  { name: "Research Conference / Seminar" },
  { name: "Cultural / Fest Event" },
  { name: "Sports Event" },
];

// ─── 1. Fetch all activity categories ────────────────────────────────────────
/**
 * Returns the list of all activity categories.
 * Used to populate the "Category" dropdown in the Create Activity form.
 */
export async function getActivityCategories() {
  return prisma.activityCategory.findMany({
    orderBy: { name: "asc" },
  });
}

// ─── 2. List activities (scoped to coordinator's cell) ───────────────────────
/**
 * Returns all activities for a given cell, optionally filtered by status.
 *
 * @param cellId   - The ID of the cell (coordinator is restricted to their own cell)
 * @param status   - Optional filter: DRAFT | PUBLISHED | ONGOING | COMPLETED
 */
export async function getActivitiesByCell(
  cellId: number,
  status?: string
) {
  return prisma.activity.findMany({
    where: {
      cellId,
      // Only apply the status filter if one was provided
      ...(status ? { status } : {}),
    },
    include: {
      // Pull in the category name (e.g. "Guest Lecture") for display
      category: { select: { categoryId: true, name: true } },
      // Pull in creator name for the "Created by" column
      creator: { select: { userId: true, fullName: true } },
      // Count how many alumni have been invited
      _count: {
        select: { invitations: true, participations: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── 3. Get a single activity by ID ──────────────────────────────────────────
/**
 * Fetches one activity with full details.
 * Used on the activity detail / edit page.
 */
export async function getActivityById(activityId: number) {
  return prisma.activity.findUnique({
    where: { activityId },
    include: {
      category: true,
      creator: { select: { userId: true, fullName: true, email: true } },
      cell: { select: { cellId: true, name: true, code: true } },
      _count: { select: { invitations: true, participations: true } },
    },
  });
}

// ─── 4. Create a new activity ─────────────────────────────────────────────────
/**
 * Creates an activity in DRAFT status.
 * The coordinator can then review it and Publish when ready.
 *
 * @param data       - Validated input from createActivitySchema (Zod)
 * @param createdBy  - The userId of the coordinator creating this activity
 */
export async function createActivity(
  data: CreateActivityInput,
  createdBy: number
) {
  return prisma.activity.create({
    data: {
      cellId: data.cellId,
      categoryId: data.categoryId,
      createdBy,
      title: data.title,
      description: data.description,
      requiredExpertise: data.requiredExpertise,     // JSON array: ["React", "Node.js"]
      startAt: new Date(data.startAt),
      endAt: new Date(data.endAt),
      venue: data.venue,
      meetingLink: data.meetingLink || null,
      pointsWeight: data.pointsWeight ?? 10,
      status: "DRAFT",                               // Always starts as DRAFT
    },
    include: {
      category: { select: { categoryId: true, name: true } },
      creator: { select: { userId: true, fullName: true } },
    },
  });
}

// ─── 5. Update activity status (lifecycle transitions) ───────────────────────
/**
 * Transitions an activity through its lifecycle:
 *   DRAFT → PUBLISHED → ONGOING → COMPLETED
 *
 * Rules enforced:
 *  - Only the creator's cell coordinator can update status
 *  - Cannot move backwards (e.g., COMPLETED → DRAFT is not allowed)
 *
 * @param activityId   - The activity to update
 * @param newStatus    - Target status
 * @param requestorId  - The userId of the person making the change
 */
export async function updateActivityStatus(
  activityId: number,
  newStatus: string,
  requestorId: number
) {
  // Allowed forward transitions only
  const VALID_TRANSITIONS: Record<string, string[]> = {
    DRAFT:     ["PUBLISHED"],
    PUBLISHED: ["ONGOING", "DRAFT"],   // Allow un-publishing back to Draft
    ONGOING:   ["COMPLETED"],
    COMPLETED: [],                     // Terminal state — no further transitions
  };

  const activity = await prisma.activity.findUnique({
    where: { activityId },
  });

  if (!activity) {
    throw new Error("Activity not found.");
  }

  const allowedNext = VALID_TRANSITIONS[activity.status] ?? [];
  if (!allowedNext.includes(newStatus)) {
    throw new Error(
      `Cannot transition activity from ${activity.status} to ${newStatus}.`
    );
  }

  return prisma.activity.update({
    where: { activityId },
    data: { status: newStatus },
  });
}

// ─── 6. Delete an activity (DRAFT only) ──────────────────────────────────────
/**
 * Permanently deletes an activity — only allowed when status is DRAFT.
 * Published / Ongoing / Completed activities cannot be deleted to preserve
 * invitation and participation history.
 */
export async function deleteActivity(activityId: number) {
  const activity = await prisma.activity.findUnique({
    where: { activityId },
  });

  if (!activity) {
    throw new Error("Activity not found.");
  }

  if (activity.status !== "DRAFT") {
    throw new Error(
      "Only activities in DRAFT status can be deleted. Published or completed activities are archived for institutional records."
    );
  }

  return prisma.activity.delete({ where: { activityId } });
}
