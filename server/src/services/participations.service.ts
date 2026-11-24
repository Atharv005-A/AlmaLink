/**
 * participations.service.ts
 * -------------------------------------------------
 * Business logic layer for Module 6: Attendance & Contribution Points Engine.
 *
 * Responsibilities:
 *  - Post-event attendance recording (Attended / Absent)
 *  - Contribution role confirmation & evidence attachment
 *  - Immutable points ledger recording
 *  - Configurable scoring policies (rubric)
 *  - Aggregated points history for alumni
 * -------------------------------------------------
 */

import { prisma } from "../config/prisma.js";
import {
  RecordParticipationInput,
  ParticipationRecordDTO,
  ScoringPolicyDTO,
} from "@almalink/shared";

// ─── Default IMCC Pune Scoring Rubric Policies ─────────────────────────────────
export const DEFAULT_SCORING_POLICIES = [
  {
    activityType: "Guest Lecture / Keynote Speaker",
    defaultPoints: 20,
    description: "Conducting technical guest lecture or keynote address for IMCC students.",
  },
  {
    activityType: "Hackathon / Competition Judge",
    defaultPoints: 15,
    description: "Evaluating hackathon projects, code competitions, or tech fest entries.",
  },
  {
    activityType: "Mock Interview & Placement Training",
    defaultPoints: 15,
    description: "Conducting 1-on-1 mock technical/HR interviews for placement preparation.",
  },
  {
    activityType: "Student Project Mentorship",
    defaultPoints: 10,
    description: "Ongoing industry mentorship on student major/capstone projects.",
  },
  {
    activityType: "Panelist / Round-Table Discussion",
    defaultPoints: 10,
    description: "Participation in industry panel, tech symposium, or career guidance conclave.",
  },
  {
    activityType: "Cultural / Sports Event Evaluation",
    defaultPoints: 10,
    description: "Judging annual IMCC cultural competitions or coordinating sports leagues.",
  },
];

/**
 * Ensures initial IMCC scoring policies exist in the database.
 */
export async function seedScoringPoliciesIfEmpty(adminUserId = 1): Promise<void> {
  const count = await prisma.scoringPolicy.count();
  if (count === 0) {
    for (const policy of DEFAULT_SCORING_POLICIES) {
      await prisma.scoringPolicy.create({
        data: {
          activityType: policy.activityType,
          defaultPoints: policy.defaultPoints,
          description: policy.description,
          updatedById: adminUserId,
        },
      });
    }
  }
}

/**
 * Record attendance, assign verified contribution points, and store evidence.
 */
export async function recordAttendance(
  data: RecordParticipationInput,
  verifiedById: number
): Promise<ParticipationRecordDTO> {
  const participation = await prisma.participation.upsert({
    where: {
      invitationId: data.invitationId ?? -1,
    },
    update: {
      role: data.role,
      contributionType: data.contributionType ?? null,
      attended: data.attended,
      pointsAwarded: data.attended ? data.pointsAwarded : 0,
      evidenceUrl: data.evidenceUrl || null,
      completionStatus: data.completionStatus ?? (data.attended ? "COMPLETED" : "ABSENT"),
      verifiedById,
      verifiedAt: new Date(),
    },
    create: {
      activityId: data.activityId,
      alumniId: data.alumniId,
      invitationId: data.invitationId ?? null,
      role: data.role,
      contributionType: data.contributionType ?? null,
      attended: data.attended,
      pointsAwarded: data.attended ? data.pointsAwarded : 0,
      evidenceUrl: data.evidenceUrl || null,
      completionStatus: data.completionStatus ?? (data.attended ? "COMPLETED" : "ABSENT"),
      verifiedById,
      verifiedAt: new Date(),
    },
    include: {
      activity: { select: { title: true, cell: { select: { name: true } } } },
      alumni: { select: { user: { select: { fullName: true } } } },
      verifiedBy: { select: { fullName: true } },
    },
  });

  return {
    participationId: participation.participationId,
    activityId: participation.activityId,
    activityTitle: participation.activity.title,
    cellName: participation.activity.cell.name,
    alumniId: participation.alumniId,
    alumniName: participation.alumni.user.fullName,
    invitationId: participation.invitationId,
    role: participation.role,
    contributionType: participation.contributionType,
    attended: participation.attended,
    pointsAwarded: participation.pointsAwarded,
    evidenceUrl: participation.evidenceUrl,
    completionStatus: participation.completionStatus,
    verifiedBy: participation.verifiedById,
    verifiedByName: participation.verifiedBy?.fullName ?? null,
    verifiedAt: participation.verifiedAt?.toISOString() ?? null,
  };
}

/**
 * Retrieve participation records for an activity, combined with invitees who accepted.
 */
export async function getActivityParticipations(
  activityId: number
): Promise<ParticipationRecordDTO[]> {
  const records = await prisma.participation.findMany({
    where: { activityId },
    include: {
      activity: { select: { title: true, cell: { select: { name: true } } } },
      alumni: { select: { user: { select: { fullName: true } } } },
      verifiedBy: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return records.map((p) => ({
    participationId: p.participationId,
    activityId: p.activityId,
    activityTitle: p.activity.title,
    cellName: p.activity.cell.name,
    alumniId: p.alumniId,
    alumniName: p.alumni.user.fullName,
    invitationId: p.invitationId,
    role: p.role,
    contributionType: p.contributionType,
    attended: p.attended,
    pointsAwarded: p.pointsAwarded,
    evidenceUrl: p.evidenceUrl,
    completionStatus: p.completionStatus,
    verifiedBy: p.verifiedById,
    verifiedByName: p.verifiedBy?.fullName ?? null,
    verifiedAt: p.verifiedAt?.toISOString() ?? null,
  }));
}

/**
 * Retrieve verified contribution points and past activities for an alumnus.
 */
export async function getAlumniPointsHistory(alumniId: number): Promise<{
  totalPoints: number;
  totalActivitiesAttended: number;
  participations: ParticipationRecordDTO[];
}> {
  const records = await prisma.participation.findMany({
    where: { alumniId, attended: true },
    include: {
      activity: { select: { title: true, cell: { select: { name: true } } } },
      alumni: { select: { user: { select: { fullName: true } } } },
      verifiedBy: { select: { fullName: true } },
    },
    orderBy: { verifiedAt: "desc" },
  });

  const totalPoints = records.reduce((sum, r) => sum + r.pointsAwarded, 0);

  return {
    totalPoints,
    totalActivitiesAttended: records.length,
    participations: records.map((p) => ({
      participationId: p.participationId,
      activityId: p.activityId,
      activityTitle: p.activity.title,
      cellName: p.activity.cell.name,
      alumniId: p.alumniId,
      alumniName: p.alumni.user.fullName,
      invitationId: p.invitationId,
      role: p.role,
      contributionType: p.contributionType,
      attended: p.attended,
      pointsAwarded: p.pointsAwarded,
      evidenceUrl: p.evidenceUrl,
      completionStatus: p.completionStatus,
      verifiedBy: p.verifiedById,
      verifiedByName: p.verifiedBy?.fullName ?? null,
      verifiedAt: p.verifiedAt?.toISOString() ?? null,
    })),
  };
}

/**
 * Retrieve all scoring rubric policies.
 */
export async function getScoringPolicies(): Promise<ScoringPolicyDTO[]> {
  await seedScoringPoliciesIfEmpty();
  const policies = await prisma.scoringPolicy.findMany({
    orderBy: { policyId: "asc" },
  });

  return policies.map((p) => ({
    policyId: p.policyId,
    activityType: p.activityType,
    defaultPoints: p.defaultPoints,
    description: p.description,
    updatedById: p.updatedById,
    updatedAt: p.updatedAt.toISOString(),
  }));
}

/**
 * Update an existing scoring policy.
 */
export async function updateScoringPolicy(
  activityType: string,
  defaultPoints: number,
  description?: string,
  updatedById = 1
): Promise<ScoringPolicyDTO> {
  const policy = await prisma.scoringPolicy.upsert({
    where: { activityType },
    update: {
      defaultPoints,
      description: description ?? null,
      updatedById,
    },
    create: {
      activityType,
      defaultPoints,
      description: description ?? null,
      updatedById,
    },
  });

  return {
    policyId: policy.policyId,
    activityType: policy.activityType,
    defaultPoints: policy.defaultPoints,
    description: policy.description,
    updatedById: policy.updatedById,
    updatedAt: policy.updatedAt.toISOString(),
  };
}
