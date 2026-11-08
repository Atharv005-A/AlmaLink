import { AwardNominationStatus } from "../enums/award-status.enum.js";

export interface AwardNominationDTO {
  nominationId: number;
  academicYear: string;
  cellId: number;
  cellName?: string;
  alumniId: number;
  alumniName?: string;
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

