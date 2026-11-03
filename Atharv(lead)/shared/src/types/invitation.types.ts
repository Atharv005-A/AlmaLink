import { InvitationStatus } from "../enums/invitation-status.enum.js";

export interface InvitationDTO {
  invitationId: number;
  activityId: number;
  activityTitle?: string;
  cellName?: string;
  alumniId: number;
  alumniName?: string;
  alumniEmail?: string;
  sentBy: number;
  expectedRole: string;
  responseDeadline: string;
  responseNote?: string | null;
  sentViaEmail: boolean;
  sentViaWhatsapp: boolean;
  status: InvitationStatus;
  sentAt: string;
  respondedAt?: string | null;
}

export interface BulkInvitationDispatchPayload {
  activityId: number;
  alumniIds: number[];
  expectedRole: string;
  responseDeadline: string;
  customMessage?: string;
  sendEmail: boolean;
  sendWhatsapp: boolean;
}

export interface InvitationRsvpPayload {
  status: InvitationStatus.ACCEPTED | InvitationStatus.DECLINED;
  responseNote?: string;
}

