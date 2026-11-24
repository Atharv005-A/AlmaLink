/**
 * awards.service.ts
 * -------------------------------------------------
 * Business logic layer for Module 7:
 * Private Leaderboard, Seasonal Award Nominations & Staff Voting
 *
 * Requirements & Constraints:
 *  - Internal private leaderboard strictly for college staff (Admin + Coordinators).
 *  - Points aggregated from verified participations.
 *  - Coordinators can nominate up to 3 cell contributors per academic year.
 *  - College Administration curates Top 5 Shortlist Draft.
 *  - Staff voting round (1 vote per staff member per academic year).
 *  - Winner confirmation & IMCC branded certificate generation metadata.
 * -------------------------------------------------
 */

import { prisma } from "../config/prisma.js";
import {
  CreateAwardNominationInput,
  CastAwardVoteInput,
  AwardNominationDTO,
  LeaderboardEntryDTO,
  AwardNominationStatus,
} from "@almalink/shared";

export class AwardsService {
  /**
   * Retrieves private internal leaderboard aggregated from verified participations.
   */
  static async getLeaderboard(filters: {
    academicYear?: string;
    cellId?: number;
    batch?: number;
  }): Promise<LeaderboardEntryDTO[]> {
    // Fetch all attended participations with related activity, cell, and alumni details
    const participations = await prisma.participation.findMany({
      where: {
        attended: true,
        ...(filters.cellId
          ? {
              activity: {
                cellId: filters.cellId,
              },
            }
          : {}),
        ...(filters.batch
          ? {
              alumni: {
                graduationYear: filters.batch,
              },
            }
          : {}),
      },
      include: {
        activity: {
          select: {
            activityId: true,
            title: true,
            startAt: true,
            cell: {
              select: {
                cellId: true,
                name: true,
              },
            },
          },
        },
        alumni: {
          select: {
            alumniId: true,
            graduationYear: true,
            program: true,
            user: {
              select: {
                fullName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Aggregate by alumniId
    const alumniMap = new Map<
      number,
      {
        alumniId: number;
        alumniName: string;
        email?: string;
        graduationYear?: number;
        program?: string;
        cellCounts: Map<string, number>;
        totalPoints: number;
        activitiesCount: number;
        activities: {
          activityId: number;
          activityTitle: string;
          role: string;
          pointsAwarded: number;
          attendedAt?: string;
          cellName?: string;
        }[];
      }
    >();

    for (const p of participations) {
      let entry = alumniMap.get(p.alumniId);
      if (!entry) {
        entry = {
          alumniId: p.alumniId,
          alumniName: p.alumni.user.fullName,
          email: p.alumni.user.email,
          graduationYear: p.alumni.graduationYear,
          program: p.alumni.program,
          cellCounts: new Map<string, number>(),
          totalPoints: 0,
          activitiesCount: 0,
          activities: [],
        };
        alumniMap.set(p.alumniId, entry);
      }

      entry.totalPoints += p.pointsAwarded;
      entry.activitiesCount += 1;

      const cellName = p.activity.cell?.name || "General";
      entry.cellCounts.set(cellName, (entry.cellCounts.get(cellName) || 0) + 1);

      entry.activities.push({
        activityId: p.activityId,
        activityTitle: p.activity.title,
        role: p.role,
        pointsAwarded: p.pointsAwarded,
        attendedAt: p.verifiedAt ? p.verifiedAt.toISOString() : undefined,
        cellName,
      });
    }

    // Sort descending by totalPoints
    const sorted = Array.from(alumniMap.values()).sort(
      (a, b) => b.totalPoints - a.totalPoints || b.activitiesCount - a.activitiesCount
    );

    // Format with rank and determine primaryCellName
    const leaderboard: LeaderboardEntryDTO[] = sorted.map((entry, index) => {
      let primaryCell = "General";
      let maxCount = 0;
      entry.cellCounts.forEach((count, name) => {
        if (count > maxCount) {
          maxCount = count;
          primaryCell = name;
        }
      });

      return {
        rank: index + 1,
        alumniId: entry.alumniId,
        alumniName: entry.alumniName,
        email: entry.email,
        graduationYear: entry.graduationYear,
        program: entry.program,
        primaryCellName: primaryCell,
        activitiesCount: entry.activitiesCount,
        totalPoints: entry.totalPoints,
        activities: entry.activities,
      };
    });

    return leaderboard;
  }

  /**
   * Retrieves nominations for an academic year and optional cell filter.
   */
  static async getNominations(filters: {
    academicYear?: string;
    cellId?: number;
  }): Promise<AwardNominationDTO[]> {
    const nominations = await prisma.awardNomination.findMany({
      where: {
        ...(filters.academicYear ? { academicYear: filters.academicYear } : {}),
        ...(filters.cellId ? { cellId: filters.cellId } : {}),
      },
      include: {
        cell: { select: { name: true } },
        alumni: {
          select: {
            enrollmentNo: true,
            program: true,
            graduationYear: true,
            user: { select: { fullName: true } },
          },
        },
        nominatedBy: { select: { fullName: true } },
        votes: { select: { voteId: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return nominations.map((n) => ({
      nominationId: n.nominationId,
      academicYear: n.academicYear,
      cellId: n.cellId,
      cellName: n.cell.name,
      alumniId: n.alumniId,
      alumniName: n.alumni.user.fullName,
      enrollmentNo: n.alumni.enrollmentNo,
      program: n.alumni.program,
      graduationYear: n.alumni.graduationYear,
      nominatedBy: n.nominatedById,
      nominatorName: n.nominatedBy.fullName,
      justification: n.justification,
      status: n.status as AwardNominationStatus,
      certificateUrl: n.certificateUrl,
      voteCount: n.votes.length,
      createdAt: n.createdAt.toISOString(),
    }));
  }

  /**
   * Creates a new award nomination.
   * Enforces max 3 nominations per cell per academic year.
   */
  static async createNomination(
    input: CreateAwardNominationInput,
    nominatedById: number
  ): Promise<AwardNominationDTO> {
    // 1. Verify coordinator cell nomination quota (maximum 3 per academic year)
    const existingCount = await prisma.awardNomination.count({
      where: {
        cellId: input.cellId,
        academicYear: input.academicYear,
      },
    });

    if (existingCount >= 3) {
      throw new Error(
        `Nomination quota reached. Each cell may nominate a maximum of 3 alumni for academic year ${input.academicYear}.`
      );
    }

    // 2. Check duplicate nomination in this cell
    const existing = await prisma.awardNomination.findUnique({
      where: {
        cellId_alumniId_academicYear: {
          cellId: input.cellId,
          alumniId: input.alumniId,
          academicYear: input.academicYear,
        },
      },
    });

    if (existing) {
      throw new Error(
        "This alumnus has already been nominated by this cell for the selected academic year."
      );
    }

    // 3. Create nomination record
    const created = await prisma.awardNomination.create({
      data: {
        academicYear: input.academicYear,
        cellId: input.cellId,
        alumniId: input.alumniId,
        nominatedById,
        justification: input.justification,
        status: AwardNominationStatus.SUBMITTED,
      },
      include: {
        cell: { select: { name: true } },
        alumni: {
          select: {
            enrollmentNo: true,
            program: true,
            graduationYear: true,
            user: { select: { fullName: true } },
          },
        },
        nominatedBy: { select: { fullName: true } },
        votes: true,
      },
    });

    return {
      nominationId: created.nominationId,
      academicYear: created.academicYear,
      cellId: created.cellId,
      cellName: created.cell.name,
      alumniId: created.alumniId,
      alumniName: created.alumni.user.fullName,
      enrollmentNo: created.alumni.enrollmentNo,
      program: created.alumni.program,
      graduationYear: created.alumni.graduationYear,
      nominatedBy: created.nominatedById,
      nominatorName: created.nominatedBy.fullName,
      justification: created.justification,
      status: created.status as AwardNominationStatus,
      certificateUrl: created.certificateUrl,
      voteCount: created.votes.length,
      createdAt: created.createdAt.toISOString(),
    };
  }

  /**
   * Retrieves the top shortlist (up to 5) for staff voting.
   */
  static async getShortlist(academicYear: string): Promise<AwardNominationDTO[]> {
    const shortlisted = await prisma.awardNomination.findMany({
      where: {
        academicYear,
        status: { in: [AwardNominationStatus.SHORTLISTED, AwardNominationStatus.WINNER] },
      },
      include: {
        cell: { select: { name: true } },
        alumni: {
          select: {
            enrollmentNo: true,
            program: true,
            graduationYear: true,
            user: { select: { fullName: true } },
          },
        },
        nominatedBy: { select: { fullName: true } },
        votes: { select: { voteId: true } },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 5,
    });

    // If none are explicitly marked shortlisted, return top 5 submitted as draft
    if (shortlisted.length === 0) {
      const topDraft = await prisma.awardNomination.findMany({
        where: { academicYear },
        include: {
          cell: { select: { name: true } },
          alumni: {
            select: {
              enrollmentNo: true,
              program: true,
              graduationYear: true,
              user: { select: { fullName: true } },
            },
          },
          nominatedBy: { select: { fullName: true } },
          votes: { select: { voteId: true } },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      });

      return topDraft.map((n) => ({
        nominationId: n.nominationId,
        academicYear: n.academicYear,
        cellId: n.cellId,
        cellName: n.cell.name,
        alumniId: n.alumniId,
        alumniName: n.alumni.user.fullName,
        enrollmentNo: n.alumni.enrollmentNo,
        program: n.alumni.program,
        graduationYear: n.alumni.graduationYear,
        nominatedBy: n.nominatedById,
        nominatorName: n.nominatedBy.fullName,
        justification: n.justification,
        status: n.status as AwardNominationStatus,
        certificateUrl: n.certificateUrl,
        voteCount: n.votes.length,
        createdAt: n.createdAt.toISOString(),
      }));
    }

    return shortlisted.map((n) => ({
      nominationId: n.nominationId,
      academicYear: n.academicYear,
      cellId: n.cellId,
      cellName: n.cell.name,
      alumniId: n.alumniId,
      alumniName: n.alumni.user.fullName,
      enrollmentNo: n.alumni.enrollmentNo,
      program: n.alumni.program,
      graduationYear: n.alumni.graduationYear,
      nominatedBy: n.nominatedById,
      nominatorName: n.nominatedBy.fullName,
      justification: n.justification,
      status: n.status as AwardNominationStatus,
      certificateUrl: n.certificateUrl,
      voteCount: n.votes.length,
      createdAt: n.createdAt.toISOString(),
    }));
  }

  /**
   * Sets the top 5 finalists to SHORTLISTED status.
   */
  static async updateShortlist(
    academicYear: string,
    nominationIds: number[]
  ): Promise<AwardNominationDTO[]> {
    if (nominationIds.length > 5) {
      throw new Error("Shortlist draft cannot exceed 5 nominees.");
    }

    // Reset others in this academic year if they were shortlisted (not winners)
    await prisma.awardNomination.updateMany({
      where: {
        academicYear,
        status: AwardNominationStatus.SHORTLISTED,
      },
      data: {
        status: AwardNominationStatus.SUBMITTED,
      },
    });

    // Mark selected as shortlisted
    await prisma.awardNomination.updateMany({
      where: {
        nominationId: { in: nominationIds },
        academicYear,
      },
      data: {
        status: AwardNominationStatus.SHORTLISTED,
      },
    });

    return this.getShortlist(academicYear);
  }

  /**
   * Casts a vote during the staff voting round.
   * Enforces 1 vote per staff member per academic year.
   */
  static async castVote(
    input: CastAwardVoteInput,
    voterId: number
  ): Promise<{ voteId: number; message: string }> {
    // 1. Check if voter already voted in this academic year
    const existingVote = await prisma.awardVote.findUnique({
      where: {
        voterId_academicYear: {
          voterId,
          academicYear: input.academicYear,
        },
      },
    });

    if (existingVote) {
      throw new Error(
        `You have already cast your ballot for the ${input.academicYear} Annual Alumni of the Year Award.`
      );
    }

    // 2. Validate nomination exists
    const nomination = await prisma.awardNomination.findUnique({
      where: { nominationId: input.nominationId },
    });

    if (!nomination) {
      throw new Error("Target award nomination not found.");
    }

    // 3. Create vote
    const vote = await prisma.awardVote.create({
      data: {
        nominationId: input.nominationId,
        voterId,
        academicYear: input.academicYear,
      },
    });

    return {
      voteId: vote.voteId,
      message: "Vote recorded successfully. Thank you for voting!",
    };
  }

  /**
   * Checks voting eligibility & current voting tally for a staff member.
   */
  static async getVotingStatus(
    academicYear: string,
    voterId: number
  ): Promise<{
    hasVoted: boolean;
    votedNominationId?: number;
    shortlist: AwardNominationDTO[];
  }> {
    const existingVote = await prisma.awardVote.findUnique({
      where: {
        voterId_academicYear: {
          voterId,
          academicYear,
        },
      },
    });

    const shortlist = await this.getShortlist(academicYear);

    return {
      hasVoted: !!existingVote,
      votedNominationId: existingVote?.nominationId,
      shortlist,
    };
  }

  /**
   * Confirms the winner and generates official certificate metadata.
   */
  static async confirmWinner(
    nominationId: number,
    adminUserId: number
  ): Promise<AwardNominationDTO> {
    const nomination = await prisma.awardNomination.findUnique({
      where: { nominationId },
      include: {
        alumni: {
          select: {
            enrollmentNo: true,
            program: true,
            graduationYear: true,
            user: { select: { fullName: true } },
          },
        },
        cell: { select: { name: true } },
      },
    });

    if (!nomination) {
      throw new Error("Nomination not found.");
    }

    const certificateUrl = `/certificates/MES-IMCC-AWARD-${nomination.academicYear.replace(
      "/",
      "-"
    )}-${nominationId}.pdf`;

    const updated = await prisma.awardNomination.update({
      where: { nominationId },
      data: {
        status: AwardNominationStatus.WINNER,
        certificateUrl,
      },
      include: {
        cell: { select: { name: true } },
        alumni: {
          select: {
            enrollmentNo: true,
            program: true,
            graduationYear: true,
            user: { select: { fullName: true } },
          },
        },
        nominatedBy: { select: { fullName: true } },
        votes: true,
      },
    });

    // Also write an audit log
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: "AWARD_WINNER_CONFIRMED",
        entityType: "AwardNomination",
        entityId: nominationId,
        details: JSON.stringify({
          alumniId: nomination.alumniId,
          academicYear: nomination.academicYear,
          certificateUrl,
        }),
        ipAddress: "127.0.0.1",
      },
    });

    return {
      nominationId: updated.nominationId,
      academicYear: updated.academicYear,
      cellId: updated.cellId,
      cellName: updated.cell.name,
      alumniId: updated.alumniId,
      alumniName: updated.alumni.user.fullName,
      enrollmentNo: updated.alumni.enrollmentNo,
      program: updated.alumni.program,
      graduationYear: updated.alumni.graduationYear,
      nominatedBy: updated.nominatedById,
      nominatorName: updated.nominatedBy.fullName,
      justification: updated.justification,
      status: updated.status as AwardNominationStatus,
      certificateUrl: updated.certificateUrl,
      voteCount: updated.votes.length,
      createdAt: updated.createdAt.toISOString(),
    };
  }

  /**
   * Retrieves winner for an academic year.
   */
  static async getWinner(academicYear: string): Promise<AwardNominationDTO | null> {
    const winner = await prisma.awardNomination.findFirst({
      where: {
        academicYear,
        status: AwardNominationStatus.WINNER,
      },
      include: {
        cell: { select: { name: true } },
        alumni: {
          select: {
            enrollmentNo: true,
            program: true,
            graduationYear: true,
            user: { select: { fullName: true } },
          },
        },
        nominatedBy: { select: { fullName: true } },
        votes: true,
      },
    });

    if (!winner) return null;

    return {
      nominationId: winner.nominationId,
      academicYear: winner.academicYear,
      cellId: winner.cellId,
      cellName: winner.cell.name,
      alumniId: winner.alumniId,
      alumniName: winner.alumni.user.fullName,
      enrollmentNo: winner.alumni.enrollmentNo,
      program: winner.alumni.program,
      graduationYear: winner.alumni.graduationYear,
      nominatedBy: winner.nominatedById,
      nominatorName: winner.nominatedBy.fullName,
      justification: winner.justification,
      status: winner.status as AwardNominationStatus,
      certificateUrl: winner.certificateUrl,
      voteCount: winner.votes.length,
      createdAt: winner.createdAt.toISOString(),
    };
  }
}
