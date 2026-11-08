import { ActivityStatus } from "../enums/activity-status.enum.js";

export interface ActivityDTO {
  activityId: number;
  cellId: number;
  cellName?: string;
  cellCode?: string;
  categoryId: number;
  categoryName?: string;
  createdBy: number;
  createdByName?: string;
  title: string;
  description: string;
  requiredExpertise: string[];
  startAt: string;
  endAt: string;
  venue: string;
  meetingLink?: string | null;
  pointsWeight: number;
  status: ActivityStatus;
  invitedCount?: number;
  acceptedCount?: number;
  attendedCount?: number;
}

export interface ActivityMatchScore {
  alumniId: number;
  fullName: string;
  organization?: string | null;
  designation?: string | null;
  graduationYear: number;
  matchedTags: string[];
  totalRequiredTags: number;
  matchPercentage: number;
  isAvailable: boolean;
}

