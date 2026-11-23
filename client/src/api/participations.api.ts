/**
 * participations.api.ts
 * -------------------------------------------------
 * TanStack Query hooks and data management for Module 6:
 * Attendance Recording & Contribution Points Engine.
 * -------------------------------------------------
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./client";
import {
  ParticipationRecordDTO,
  AttendanceSubmissionPayload,
  ScoringPolicyDTO,
  UpdateScoringPolicyInput,
} from "@almalink/shared";

export const PARTICIPATIONS_QUERY_KEY = "participations";
export const SCORING_RUBRIC_QUERY_KEY = "scoring-rubric";

// ─── Default IMCC Scoring Rubric Policies ─────────────────────────────────
export const INITIAL_SCORING_POLICIES: ScoringPolicyDTO[] = [
  {
    policyId: 1,
    activityType: "Guest Lecture / Keynote Speaker",
    defaultPoints: 20,
    description: "Conducting technical guest lecture or keynote address for IMCC students.",
  },
  {
    policyId: 2,
    activityType: "Hackathon / Competition Judge",
    defaultPoints: 15,
    description: "Evaluating hackathon projects, code competitions, or tech fest entries.",
  },
  {
    policyId: 3,
    activityType: "Mock Interview & Placement Training",
    defaultPoints: 15,
    description: "Conducting 1-on-1 mock technical/HR interviews for placement preparation.",
  },
  {
    policyId: 4,
    activityType: "Student Project Mentorship",
    defaultPoints: 10,
    description: "Ongoing industry mentorship on student major/capstone projects.",
  },
  {
    policyId: 5,
    activityType: "Panelist / Round-Table Discussion",
    defaultPoints: 10,
    description: "Participation in industry panel, tech symposium, or career guidance conclave.",
  },
  {
    policyId: 6,
    activityType: "Cultural / Sports Event Evaluation",
    defaultPoints: 10,
    description: "Judging annual IMCC cultural competitions or coordinating sports leagues.",
  },
];

// Initial mock participations seeded for demonstration
export const INITIAL_PARTICIPATIONS: ParticipationRecordDTO[] = [
  {
    participationId: 101,
    activityId: 106,
    activityTitle: "Cloud DevOps Architecture Bootcamp",
    cellName: "Technical Cell",
    alumniId: 1,
    alumniName: "Aarav Deshmukh",
    invitationId: 1,
    role: "Keynote Speaker & Industry Mentor",
    contributionType: "Conducted 2-hour hands-on session on Kubernetes architecture",
    attended: true,
    pointsAwarded: 20,
    evidenceUrl: "https://drive.google.com/file/d/imcc-devops-bootcamp-evidence",
    completionStatus: "COMPLETED",
    verifiedBy: 2,
    verifiedByName: "Prof. Meera Kulkarni",
    verifiedAt: "2026-11-15T14:30:00.000Z",
  },
];

const LOCAL_STORAGE_PARTICIPATIONS_KEY = "almalink_participations_store";
const LOCAL_STORAGE_RUBRIC_KEY = "almalink_rubric_store";

function getLocalParticipations(): ParticipationRecordDTO[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PARTICIPATIONS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_PARTICIPATIONS;
}

function saveLocalParticipations(records: ParticipationRecordDTO[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_PARTICIPATIONS_KEY, JSON.stringify(records));
  } catch {}
}

function getLocalRubric(): ScoringPolicyDTO[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RUBRIC_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return INITIAL_SCORING_POLICIES;
}

function saveLocalRubric(policies: ScoringPolicyDTO[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_RUBRIC_KEY, JSON.stringify(policies));
  } catch {}
}

// ─── Query Hook: Get Participations for an Activity ───────────────────────
export function useActivityParticipations(activityId: number) {
  return useQuery<ParticipationRecordDTO[]>({
    queryKey: [PARTICIPATIONS_QUERY_KEY, "activity", activityId],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: ParticipationRecordDTO[] }>(
          `/participations/activity/${activityId}`
        );
        return res.data.data;
      } catch {
        // Local preview fallback
        return getLocalParticipations().filter((p) => p.activityId === activityId);
      }
    },
    enabled: !isNaN(activityId),
  });
}

// ─── Query Hook: Get Alumni Points History ────────────────────────────────
export function useAlumniPointsHistory(alumniId: number) {
  return useQuery<{
    totalPoints: number;
    totalActivitiesAttended: number;
    participations: ParticipationRecordDTO[];
  }>({
    queryKey: [PARTICIPATIONS_QUERY_KEY, "alumni", alumniId],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{
          data: {
            totalPoints: number;
            totalActivitiesAttended: number;
            participations: ParticipationRecordDTO[];
          };
        }>(`/participations/alumni/${alumniId}`);
        return res.data.data;
      } catch {
        // Local preview fallback
        const records = getLocalParticipations().filter(
          (p) => p.alumniId === alumniId && p.attended
        );
        const totalPoints = records.reduce((sum, r) => sum + r.pointsAwarded, 0);
        return {
          totalPoints,
          totalActivitiesAttended: records.length,
          participations: records,
        };
      }
    },
    enabled: !isNaN(alumniId),
  });
}

// ─── Mutation Hook: Record Attendance & Award Points ──────────────────────
export function useRecordAttendance() {
  const queryClient = useQueryClient();

  return useMutation<ParticipationRecordDTO, Error, AttendanceSubmissionPayload>({
    mutationFn: async (payload) => {
      try {
        const res = await apiClient.post<{ data: ParticipationRecordDTO }>(
          "/participations",
          payload
        );
        return res.data.data;
      } catch {
        // Local preview fallback
        const existing = getLocalParticipations();
        const index = existing.findIndex(
          (p) => p.activityId === payload.activityId && p.alumniId === payload.alumniId
        );

        const newRecord: ParticipationRecordDTO = {
          participationId: index >= 0 ? existing[index].participationId : Date.now(),
          activityId: payload.activityId,
          alumniId: payload.alumniId,
          invitationId: payload.invitationId ?? null,
          role: payload.role,
          attended: payload.attended,
          pointsAwarded: payload.attended ? payload.pointsAwarded : 0,
          evidenceUrl: payload.evidenceUrl || null,
          completionStatus: payload.completionStatus || (payload.attended ? "COMPLETED" : "ABSENT"),
          verifiedBy: 1,
          verifiedByName: "Cell Coordinator",
          verifiedAt: new Date().toISOString(),
        };

        if (index >= 0) {
          existing[index] = newRecord;
        } else {
          existing.unshift(newRecord);
        }
        saveLocalParticipations(existing);
        return newRecord;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PARTICIPATIONS_QUERY_KEY, "activity", variables.activityId],
      });
      queryClient.invalidateQueries({
        queryKey: [PARTICIPATIONS_QUERY_KEY, "alumni", variables.alumniId],
      });
    },
  });
}

// ─── Query Hook: Get Scoring Policies (Rubric) ────────────────────────────
export function useScoringRubric() {
  return useQuery<ScoringPolicyDTO[]>({
    queryKey: [SCORING_RUBRIC_QUERY_KEY],
    queryFn: async () => {
      try {
        const res = await apiClient.get<{ data: ScoringPolicyDTO[] }>("/scoring-rubric/rubric");
        return res.data.data;
      } catch {
        return getLocalRubric();
      }
    },
  });
}

// ─── Mutation Hook: Update Scoring Policy ─────────────────────────────────
export function useUpdateScoringPolicy() {
  const queryClient = useQueryClient();

  return useMutation<ScoringPolicyDTO, Error, UpdateScoringPolicyInput>({
    mutationFn: async (payload) => {
      try {
        const res = await apiClient.put<{ data: ScoringPolicyDTO }>(
          "/scoring-rubric/rubric",
          payload
        );
        return res.data.data;
      } catch {
        const policies = getLocalRubric();
        const index = policies.findIndex((p) => p.activityType === payload.activityType);
        const updated: ScoringPolicyDTO = {
          policyId: index >= 0 ? policies[index].policyId : Date.now(),
          activityType: payload.activityType,
          defaultPoints: payload.defaultPoints,
          description: payload.description || null,
          updatedAt: new Date().toISOString(),
        };
        if (index >= 0) {
          policies[index] = updated;
        } else {
          policies.push(updated);
        }
        saveLocalRubric(policies);
        return updated;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SCORING_RUBRIC_QUERY_KEY] });
    },
  });
}
