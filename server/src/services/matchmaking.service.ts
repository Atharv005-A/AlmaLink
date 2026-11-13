/**
 * matchmaking.service.ts
 * -------------------------------------------------
 * Business logic for Module 4: Matchmaking and Invitations.
 *
 * Responsibilities:
 *  1. Calculate tag match percentage between activity requirements and alumni skills:
 *     Match % = (|Event Tags ∩ Alumni Tags| / |Event Tags|) * 100
 *  2. Rank verified alumni so coordinators see best matches first (e.g. 100%, 75%)
 *  3. Bulk dispatch invitations via Email and WhatsApp
 *  4. Retrieve invitation rosters for activity tracking
 *  5. Handle alumni RSVP (Accept / Decline with notes)
 * -------------------------------------------------
 */

import { prisma } from "../config/prisma.js";
import {
  ActivityMatchScore,
  BulkDispatchInvitationsInput,
  RsvpInvitationInput,
} from "@almalink/shared";

// ─── 1. Calculate Match Recommendations for an Activity ──────────────────────
export async function getMatchRecommendations(activityId: number): Promise<ActivityMatchScore[]> {
  const activity = await prisma.activity.findUnique({
    where: { activityId },
    select: { requiredExpertise: true },
  });

  if (!activity) {
    throw new Error("Activity not found.");
  }

  const rawTags = (activity.requiredExpertise as string[]) || [];
  const eventTags = rawTags.map((t) => t.trim().toLowerCase());

  // Fetch verified alumni who are willing to participate
  const alumniProfiles = await prisma.alumniProfile.findMany({
    where: {
      verificationStatus: "VERIFIED",
      willingToParticipate: true,
    },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  // Calculate tag intersection for each alumnus
  const scoredAlumni: ActivityMatchScore[] = alumniProfiles.map((alumnus: any) => {
    const rawSkills = Array.isArray(alumnus.skills) ? (alumnus.skills as string[]) : [];
    const rawExpertise = Array.isArray(alumnus.expertise) ? (alumnus.expertise as string[]) : [];
    const combinedAlumniTags = [...rawSkills, ...rawExpertise].map((t) =>
      String(t).trim().toLowerCase()
    );

    // Find intersection
    const matchedOriginalTags: string[] = [];
    rawTags.forEach((tag) => {
      if (combinedAlumniTags.includes(tag.trim().toLowerCase())) {
        matchedOriginalTags.push(tag);
      }
    });

    const totalRequired = eventTags.length;
    const matchPercentage =
      totalRequired > 0 ? Math.round((matchedOriginalTags.length / totalRequired) * 100) : 0;

    return {
      alumniId: alumnus.alumniId,
      fullName: alumnus.user.fullName,
      organization: alumnus.organization,
      designation: alumnus.designation,
      graduationYear: alumnus.graduationYear,
      matchedTags: matchedOriginalTags,
      totalRequiredTags: totalRequired,
      matchPercentage,
      isAvailable: Boolean(alumnus.availability),
    };
  });

  // Sort by match percentage descending (100% first)
  return scoredAlumni.sort((a, b) => b.matchPercentage - a.matchPercentage);
}

// ─── 2. Bulk Dispatch Invitations ────────────────────────────────────────────
export async function bulkDispatchInvitations(
  payload: BulkDispatchInvitationsInput,
  senderUserId: number
) {
  const { activityId, alumniIds, expectedRole, responseDeadline, sendEmail, sendWhatsapp } =
    payload;

  const activity = await prisma.activity.findUnique({
    where: { activityId },
  });

  if (!activity) {
    throw new Error("Activity not found.");
  }

  const deadlineDate = new Date(responseDeadline);

  // Create invitation records in batch
  const createdInvitations = await prisma.$transaction(
    alumniIds.map((alumniId) =>
      prisma.invitation.create({
        data: {
          activityId,
          alumniId,
          sentBy: senderUserId,
          expectedRole,
          responseDeadline: deadlineDate,
          sentViaEmail: sendEmail,
          sentViaWhatsapp: sendWhatsapp,
          status: "SENT",
        },
      })
    )
  );

  return createdInvitations;
}

// ─── 3. Get Invitations for a specific Activity (Coordinator Tracking) ───────
export async function getActivityInvitations(activityId: number) {
  return prisma.invitation.findMany({
    where: { activityId },
    include: {
      alumni: {
        include: {
          user: {
            select: {
              fullName: true,
              email: true,
              phone: true,
            },
          },
        },
      },
    },
    orderBy: { sentAt: "desc" },
  });
}

// ─── 4. Get Invitations for Logged-In Alumnus (Alumni Portal) ─────────────────
export async function getAlumniInvitations(userId: number) {
  const profile = await prisma.alumniProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    return [];
  }

  return prisma.invitation.findMany({
    where: { alumniId: profile.alumniId },
    include: {
      activity: {
        include: {
          cell: { select: { name: true, code: true } },
          category: { select: { name: true } },
        },
      },
    },
    orderBy: { sentAt: "desc" },
  });
}

// ─── 5. Record Alumni RSVP (Accept or Decline) ────────────────────────────────
export async function rsvpInvitation(invitationId: number, payload: RsvpInvitationInput) {
  const invitation = await prisma.invitation.findUnique({
    where: { invitationId },
  });

  if (!invitation) {
    throw new Error("Invitation not found.");
  }

  return prisma.invitation.update({
    where: { invitationId },
    data: {
      status: payload.status,
      responseNote: payload.responseNote || null,
      respondedAt: new Date(),
    },
  });
}
