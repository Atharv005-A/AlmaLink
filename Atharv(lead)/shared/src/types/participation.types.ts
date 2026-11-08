export interface ParticipationRecordDTO {
  participationId: number;
  activityId: number;
  activityTitle?: string;
  cellName?: string;
  alumniId: number;
  alumniName?: string;
  invitationId?: number | null;
  role: string;
  contributionType?: string | null;
  attended: boolean;
  pointsAwarded: number;
  evidenceUrl?: string | null;
  completionStatus?: string | null;
  verifiedBy?: number | null;
  verifiedByName?: string | null;
  verifiedAt?: string | null;
}

export interface AttendanceSubmissionPayload {
  activityId: number;
  alumniId: number;
  invitationId?: number;
  role: string;
  attended: boolean;
  pointsAwarded: number;
  evidenceUrl?: string;
  completionStatus?: string;
}

