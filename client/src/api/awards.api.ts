/**
 * awards.api.ts
 * -------------------------------------------------
 * TanStack Query hooks and data management for Module 7:
 * Private Leaderboard, Seasonal Award Nominations & Staff Voting.
 * -------------------------------------------------
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./client";
import {
  LeaderboardEntryDTO,
  AwardNominationDTO,
  CreateAwardNominationInput,
  CastAwardVoteInput,
  AwardNominationStatus,
} from "@almalink/shared";

export const LEADERBOARD_QUERY_KEY = "leaderboard";
export const NOMINATIONS_QUERY_KEY = "award_nominations";
export const SHORTLIST_QUERY_KEY = "award_shortlist";
export const VOTING_STATUS_QUERY_KEY = "award_voting_status";
export const WINNER_QUERY_KEY = "award_winner";

export type { LeaderboardEntryDTO, AwardNominationDTO };

// ─── Default IMCC Pune Seed / Fallback Data ──────────────────────────────
export const INITIAL_LEADERBOARD_DATA: LeaderboardEntryDTO[] = [
  {
    rank: 1,
    alumniId: 1,
    alumniName: "Prithviraj Pratap Patil",
    email: "prithviraj.patil@outlook.com",
    graduationYear: 2024,
    program: "MCA",
    primaryCellName: "Training & Placement Cell",
    activitiesCount: 4,
    totalPoints: 65,
    activities: [
      {
        activityId: 1,
        activityTitle: "Cloud DevOps & Kubernetes Masterclass",
        role: "Keynote Speaker",
        pointsAwarded: 20,
        attendedAt: "2026-11-18T10:00:00.000Z",
        cellName: "Training & Placement Cell",
      },
      {
        activityId: 2,
        activityTitle: "Annual MCA Technical Hackathon 2026",
        role: "Industry Judge",
        pointsAwarded: 15,
        attendedAt: "2026-10-25T14:30:00.000Z",
        cellName: "Tech Club & Coding Cell",
      },
      {
        activityId: 3,
        activityTitle: "Final Year Placement Mock Interviews",
        role: "Interviewer",
        pointsAwarded: 15,
        attendedAt: "2026-10-12T09:00:00.000Z",
        cellName: "Training & Placement Cell",
      },
      {
        activityId: 4,
        activityTitle: "Career Pathways in Distributed Systems",
        role: "Guest Speaker",
        pointsAwarded: 15,
        attendedAt: "2026-09-08T11:00:00.000Z",
        cellName: "Training & Placement Cell",
      },
    ],
  },
  {
    rank: 2,
    alumniId: 2,
    alumniName: "Sneha Deshmukh",
    email: "sneha.deshmukh@gmail.com",
    graduationYear: 2023,
    program: "MCA",
    primaryCellName: "Entrepreneurship & Startup Cell",
    activitiesCount: 3,
    totalPoints: 45,
    activities: [
      {
        activityId: 5,
        activityTitle: "Founders Talk: Scaling SaaS from Pune to Global",
        role: "Keynote Speaker",
        pointsAwarded: 20,
        attendedAt: "2026-11-05T15:00:00.000Z",
        cellName: "Entrepreneurship & Startup Cell",
      },
      {
        activityId: 6,
        activityTitle: "Startup Pitch Deck Mentoring Session",
        role: "Mentor",
        pointsAwarded: 15,
        attendedAt: "2026-10-18T11:00:00.000Z",
        cellName: "Entrepreneurship & Startup Cell",
      },
      {
        activityId: 7,
        activityTitle: "Women in Tech Leadership Conclave",
        role: "Panelist",
        pointsAwarded: 10,
        attendedAt: "2026-09-22T14:00:00.000Z",
        cellName: "Cultural & Social Cell",
      },
    ],
  },
  {
    rank: 3,
    alumniId: 3,
    alumniName: "Rahul Suresh Shinde",
    email: "rahul.shinde@tcs.com",
    graduationYear: 2022,
    program: "MCA",
    primaryCellName: "Tech Club & Coding Cell",
    activitiesCount: 3,
    totalPoints: 40,
    activities: [
      {
        activityId: 2,
        activityTitle: "Annual MCA Technical Hackathon 2026",
        role: "Lead Judge",
        pointsAwarded: 15,
        attendedAt: "2026-10-25T14:30:00.000Z",
        cellName: "Tech Club & Coding Cell",
      },
      {
        activityId: 3,
        activityTitle: "Final Year Placement Mock Interviews",
        role: "Technical Evaluator",
        pointsAwarded: 15,
        attendedAt: "2026-10-12T09:00:00.000Z",
        cellName: "Training & Placement Cell",
      },
      {
        activityId: 8,
        activityTitle: "DSA & System Design Bootcamp for Juniors",
        role: "Mentor",
        pointsAwarded: 10,
        attendedAt: "2026-08-30T10:00:00.000Z",
        cellName: "Tech Club & Coding Cell",
      },
    ],
  },
  {
    rank: 4,
    alumniId: 4,
    alumniName: "Tanmay Shirish Joshi",
    email: "tanmay.joshi@accenture.com",
    graduationYear: 2023,
    program: "MBA",
    primaryCellName: "Training & Placement Cell",
    activitiesCount: 2,
    totalPoints: 30,
    activities: [
      {
        activityId: 9,
        activityTitle: "Corporate Case Study Analysis Workshop",
        role: "Workshop Lead",
        pointsAwarded: 15,
        attendedAt: "2026-10-04T13:00:00.000Z",
        cellName: "Training & Placement Cell",
      },
      {
        activityId: 3,
        activityTitle: "Final Year Placement Mock Interviews",
        role: "HR Interviewer",
        pointsAwarded: 15,
        attendedAt: "2026-10-12T09:00:00.000Z",
        cellName: "Training & Placement Cell",
      },
    ],
  },
  {
    rank: 5,
    alumniId: 5,
    alumniName: "Priya Anand Kulkarni",
    email: "priya.kulkarni@infosys.com",
    graduationYear: 2024,
    program: "MCA",
    primaryCellName: "Tech Club & Coding Cell",
    activitiesCount: 2,
    totalPoints: 25,
    activities: [
      {
        activityId: 2,
        activityTitle: "Annual MCA Technical Hackathon 2026",
        role: "Mentoring Panel",
        pointsAwarded: 15,
        attendedAt: "2026-10-25T14:30:00.000Z",
        cellName: "Tech Club & Coding Cell",
      },
      {
        activityId: 10,
        activityTitle: "Open Source Contribution 101",
        role: "Guest Speaker",
        pointsAwarded: 10,
        attendedAt: "2026-09-14T11:00:00.000Z",
        cellName: "Tech Club & Coding Cell",
      },
    ],
  },
];

export const INITIAL_NOMINATIONS: AwardNominationDTO[] = [
  {
    nominationId: 1,
    academicYear: "2026-27",
    cellId: 1,
    cellName: "Training & Placement Cell",
    alumniId: 1,
    alumniName: "Prithviraj Pratap Patil",
    enrollmentNo: "IMCC-2022-MCA-042",
    program: "MCA",
    graduationYear: 2024,
    nominatedBy: 2,
    nominatorName: "Prof. Meera Kulkarni",
    justification:
      "Prithviraj has demonstrated extraordinary commitment by leading 4 technical sessions, conducting high-rigor mock interviews for 28 graduating MCA students, and helping secure 7 Tier-1 product offers.",
    status: AwardNominationStatus.SHORTLISTED,
    certificateUrl: null,
    voteCount: 14,
    createdAt: "2026-11-01T10:00:00.000Z",
  },
  {
    nominationId: 2,
    academicYear: "2026-27",
    cellId: 2,
    cellName: "Entrepreneurship & Startup Cell",
    alumniId: 2,
    alumniName: "Sneha Deshmukh",
    enrollmentNo: "IMCC-2021-MCA-018",
    program: "MCA",
    graduationYear: 2023,
    nominatedBy: 3,
    nominatorName: "Prof. Rajesh Sathe",
    justification:
      "Sneha founded a high-growth SaaS startup and returned to campus to personally mentor 6 student ideation teams, connecting two promising student projects to angel investors.",
    status: AwardNominationStatus.SHORTLISTED,
    certificateUrl: null,
    voteCount: 11,
    createdAt: "2026-11-03T11:30:00.000Z",
  },
  {
    nominationId: 3,
    academicYear: "2026-27",
    cellId: 3,
    cellName: "Tech Club & Coding Cell",
    alumniId: 3,
    alumniName: "Rahul Suresh Shinde",
    enrollmentNo: "IMCC-2020-MCA-089",
    program: "MCA",
    graduationYear: 2022,
    nominatedBy: 4,
    nominatorName: "Dr. Vikram Patil",
    justification:
      "Rahul has been a stalwart anchor for the IMCC Hackathon for three consecutive years, mentoring junior students in algorithms and cloud infrastructure design on weekends.",
    status: AwardNominationStatus.SHORTLISTED,
    certificateUrl: null,
    voteCount: 8,
    createdAt: "2026-11-04T09:15:00.000Z",
  },
  {
    nominationId: 4,
    academicYear: "2026-27",
    cellId: 1,
    cellName: "Training & Placement Cell",
    alumniId: 4,
    alumniName: "Tanmay Shirish Joshi",
    enrollmentNo: "IMCC-2021-MBA-031",
    program: "MBA",
    graduationYear: 2023,
    nominatedBy: 2,
    nominatorName: "Prof. Meera Kulkarni",
    justification:
      "Tanmay designed an intensive corporate interview simulation framework that bridged key soft-skill and aptitude gaps for 45 MBA marketing and finance candidates.",
    status: AwardNominationStatus.SHORTLISTED,
    certificateUrl: null,
    voteCount: 5,
    createdAt: "2026-11-05T14:20:00.000Z",
  },
  {
    nominationId: 5,
    academicYear: "2026-27",
    cellId: 3,
    cellName: "Tech Club & Coding Cell",
    alumniId: 5,
    alumniName: "Priya Anand Kulkarni",
    enrollmentNo: "IMCC-2022-MCA-077",
    program: "MCA",
    graduationYear: 2024,
    nominatedBy: 4,
    nominatorName: "Dr. Vikram Patil",
    justification:
      "Priya established an open-source mentorship circle for female students at IMCC, achieving first-time GitHub PR merges for over 30 junior participants.",
    status: AwardNominationStatus.SHORTLISTED,
    certificateUrl: null,
    voteCount: 6,
    createdAt: "2026-11-06T16:45:00.000Z",
  },
];

// ─── Query: Get Private Leaderboard (Staff Only) ─────────────────────────
export function useLeaderboard(filters: {
  academicYear?: string;
  cellId?: number;
  batch?: number;
}) {
  return useQuery<LeaderboardEntryDTO[]>({
    queryKey: [LEADERBOARD_QUERY_KEY, filters],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<{
          status: string;
          data: LeaderboardEntryDTO[];
        }>("/leaderboard", { params: filters });
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data;
        }
      } catch (err) {
        console.warn("Using offline fallback for leaderboard", err);
      }

      // Offline / dev fallback: filter initial dataset
      let filtered = [...INITIAL_LEADERBOARD_DATA];
      if (filters.batch) {
        filtered = filtered.filter((item) => item.graduationYear === filters.batch);
      }
      return filtered;
    },
    staleTime: 1000 * 60 * 5,
  });
}

// ─── Query: Get Nominations ─────────────────────────────────────────────
export function useAwardNominations(filters: { academicYear?: string; cellId?: number }) {
  return useQuery<AwardNominationDTO[]>({
    queryKey: [NOMINATIONS_QUERY_KEY, filters],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<{
          status: string;
          data: AwardNominationDTO[];
        }>("/awards/nominations", { params: filters });
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data;
        }
      } catch (err) {
        console.warn("Using offline fallback for nominations", err);
      }

      const stored = localStorage.getItem("almalink_award_nominations");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }

      localStorage.setItem("almalink_award_nominations", JSON.stringify(INITIAL_NOMINATIONS));
      return INITIAL_NOMINATIONS;
    },
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Mutation: Create Nomination (Coordinator / Admin) ───────────────────
export function useCreateNomination() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateAwardNominationInput) => {
      try {
        const { data } = await apiClient.post<{
          status: string;
          message: string;
          data: AwardNominationDTO;
        }>("/awards/nominations", payload);
        return data.data;
      } catch (err: any) {
        // Fallback simulation
        const stored = localStorage.getItem("almalink_award_nominations");
        const list: AwardNominationDTO[] = stored ? JSON.parse(stored) : [...INITIAL_NOMINATIONS];

        const newNomination: AwardNominationDTO = {
          nominationId: list.length + 1,
          academicYear: payload.academicYear,
          cellId: payload.cellId,
          cellName: "Nominated Cell",
          alumniId: payload.alumniId,
          alumniName: "Nominated Alumnus",
          nominatedBy: 2,
          nominatorName: "Prof. Meera Kulkarni",
          justification: payload.justification,
          status: AwardNominationStatus.SUBMITTED,
          certificateUrl: null,
          voteCount: 0,
          createdAt: new Date().toISOString(),
        };

        list.unshift(newNomination);
        localStorage.setItem("almalink_award_nominations", JSON.stringify(list));
        return newNomination;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOMINATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SHORTLIST_QUERY_KEY] });
    },
  });
}

// ─── Query: Get Top 5 Shortlist ─────────────────────────────────────────
export function useAwardShortlist(academicYear = "2026-27") {
  return useQuery<AwardNominationDTO[]>({
    queryKey: [SHORTLIST_QUERY_KEY, academicYear],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<{
          status: string;
          data: AwardNominationDTO[];
        }>("/awards/shortlist", { params: { academicYear } });
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data;
        }
      } catch (err) {
        console.warn("Using offline fallback for shortlist", err);
      }

      const stored = localStorage.getItem("almalink_award_nominations");
      if (stored) {
        try {
          const list: AwardNominationDTO[] = JSON.parse(stored);
          const top = list.filter((n) => n.status !== AwardNominationStatus.SUBMITTED);
          return top.length > 0 ? top.slice(0, 5) : list.slice(0, 5);
        } catch {}
      }

      return INITIAL_NOMINATIONS.slice(0, 5);
    },
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Mutation: Update Shortlist (Admin Only) ─────────────────────────────
export function useUpdateShortlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      academicYear,
      nominationIds,
    }: {
      academicYear: string;
      nominationIds: number[];
    }) => {
      const { data } = await apiClient.post<{
        status: string;
        message: string;
        data: AwardNominationDTO[];
      }>("/awards/shortlist", { academicYear, nominationIds });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHORTLIST_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOMINATIONS_QUERY_KEY] });
    },
  });
}

// ─── Query: Staff Voting Status ──────────────────────────────────────────
export function useVotingStatus(academicYear = "2026-27") {
  return useQuery<{
    hasVoted: boolean;
    votedNominationId?: number;
    shortlist: AwardNominationDTO[];
  }>({
    queryKey: [VOTING_STATUS_QUERY_KEY, academicYear],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<{
          status: string;
          data: {
            hasVoted: boolean;
            votedNominationId?: number;
            shortlist: AwardNominationDTO[];
          };
        }>("/awards/voting-status", { params: { academicYear } });
        if (data?.data) {
          return data.data;
        }
      } catch (err) {
        console.warn("Using offline fallback for voting status", err);
      }

      // Check localStorage for offline vote record
      const hasVotedLocal = localStorage.getItem(`almalink_voted_${academicYear}`) === "true";
      const votedIdLocal = parseInt(
        localStorage.getItem(`almalink_voted_nomination_${academicYear}`) || "0",
        10
      );

      return {
        hasVoted: hasVotedLocal,
        votedNominationId: votedIdLocal || undefined,
        shortlist: INITIAL_NOMINATIONS.slice(0, 5),
      };
    },
    staleTime: 1000 * 60,
  });
}

// ─── Mutation: Cast Staff Ballot ────────────────────────────────────────
export function useCastAwardVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CastAwardVoteInput) => {
      try {
        const { data } = await apiClient.post<{
          status: string;
          message: string;
          data: { voteId: number };
        }>("/awards/vote", payload);
        return data;
      } catch (err: any) {
        // Fallback simulation
        localStorage.setItem(`almalink_voted_${payload.academicYear}`, "true");
        localStorage.setItem(
          `almalink_voted_nomination_${payload.academicYear}`,
          String(payload.nominationId)
        );
        return { message: "Vote cast successfully (local session)." };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [VOTING_STATUS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SHORTLIST_QUERY_KEY] });
    },
  });
}

// ─── Mutation: Confirm Final Award Winner (Admin Only) ──────────────────
export function useConfirmAwardWinner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nominationId }: { nominationId: number }) => {
      try {
        const { data } = await apiClient.post<{
          status: string;
          message: string;
          data: AwardNominationDTO;
        }>("/awards/winner", { nominationId });
        return data.data;
      } catch (err: any) {
        // Fallback simulation
        const stored = localStorage.getItem("almalink_award_nominations");
        const list: AwardNominationDTO[] = stored ? JSON.parse(stored) : [...INITIAL_NOMINATIONS];
        const winner = list.find((n) => n.nominationId === nominationId) || list[0];
        winner.status = AwardNominationStatus.WINNER;
        winner.certificateUrl = `/certificates/MES-IMCC-AWARD-2026-${nominationId}.pdf`;
        localStorage.setItem("almalink_award_nominations", JSON.stringify(list));
        localStorage.setItem("almalink_award_winner", JSON.stringify(winner));
        return winner;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WINNER_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [NOMINATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [SHORTLIST_QUERY_KEY] });
    },
  });
}

// ─── Query: Get Award Winner ─────────────────────────────────────────────
export function useAwardWinner(academicYear = "2026-27") {
  return useQuery<AwardNominationDTO | null>({
    queryKey: [WINNER_QUERY_KEY, academicYear],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<{
          status: string;
          data: AwardNominationDTO | null;
        }>("/awards/winner", { params: { academicYear } });
        if (data?.data) {
          return data.data;
        }
      } catch (err) {
        console.warn("Using offline fallback for winner", err);
      }

      const stored = localStorage.getItem("almalink_award_winner");
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }

      // Default mock winner: Prithviraj Patil
      return {
        ...INITIAL_NOMINATIONS[0],
        status: AwardNominationStatus.WINNER,
        certificateUrl: "/certificates/MES-IMCC-AWARD-2026-01.pdf",
      };
    },
    staleTime: 1000 * 60 * 5,
  });
}
