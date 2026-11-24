import { AwardNominationStatus } from "../enums/award-status.enum.js";

export interface AwardNominationDTO {
  nominationId: number;
  academicYear: string;
  cellId: number;
  cellName?: string;
  alumniId: number;
  alumniName?: string;
  enrollmentNo?: string;
  program?: string;
  graduationYear?: number;
  nominatedBy: number;
  nominatorName?: string;
  justification: string;
  status: AwardNominationStatus;
  certificateUrl?: string | null;
  voteCount?: number;
  createdAt: string;
}

export interface NominationSubmissionPayload {
  academicYear: string;
  cellId: number;
  alumniId: number;
  justification: string;
}

export interface AwardVoteDTO {
  voteId: number;
  nominationId: number;
  voterId: number;
  academicYear: string;
  createdAt: string;
}

export interface LeaderboardActivityBreakdown {
  activityId: number;
  activityTitle: string;
  role: string;
  pointsAwarded: number;
  attendedAt?: string;
  cellName?: string;
}

export interface LeaderboardEntryDTO {
  rank: number;
  alumniId: number;
  alumniName: string;
  email?: string;
  graduationYear?: number;
  program?: string;
  primaryCellName?: string;
  activitiesCount: number;
  totalPoints: number;
  activities?: LeaderboardActivityBreakdown[];
}
