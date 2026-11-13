/**
 * invitations.api.ts
 * -------------------------------------------------
 * TanStack Query hooks and data store for Module 4:
 * Matchmaking, Invitation Dispatch, and Tracking.
 * -------------------------------------------------
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./client";
import {
  ActivityMatchScore,
  InvitationDTO,
  BulkInvitationDispatchPayload,
  InvitationRsvpPayload,
  InvitationStatus,
} from "@almalink/shared";
import { INITIAL_IMCC_ACTIVITIES } from "./activities.api";

export const INVITATIONS_QUERY_KEY = "invitations";
export const MATCHMAKING_QUERY_KEY = "matchmaking";

// ─── Authentic MES IMCC Alumni Pool (for client-side matchmaking) ────────────
export interface DemoAlumnusProfile {
  alumniId: number;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  designation: string;
  graduationYear: number;
  program: string;
  skills: string[];
  expertise: string[];
  preferredActivities: string[];
  availability: string;
  isAvailable: boolean;
}

export const IMCC_DEMO_ALUMNI: DemoAlumnusProfile[] = [
  {
    alumniId: 1,
    fullName: "Aarav Deshmukh",
    email: "aarav.deshmukh@persistent.com",
    phone: "+91 98230 11234",
    organization: "Persistent Systems Pune",
    designation: "Senior SRE & Cloud Lead",
    graduationYear: 2018,
    program: "MCA",
    skills: ["AWS", "Kubernetes", "DevOps", "Microservices", "Docker", "Cloud Architecture"],
    expertise: ["Cloud Native Platforms", "CI/CD Automation", "Infrastructure as Code"],
    preferredActivities: ["Guest Lectures", "Hackathon Judging", "Mentoring"],
    availability: "Weekends & Alternate Saturdays",
    isAvailable: true,
  },
  {
    alumniId: 2,
    fullName: "Priya Kulkarni",
    email: "priya.kulkarni@infosys.com",
    phone: "+91 97654 22345",
    organization: "Infosys Hinjewadi Phase 2",
    designation: "Technical Lead (AI Platforms)",
    graduationYear: 2019,
    program: "MCA",
    skills: [
      "Python",
      "Generative AI",
      "LangChain",
      "Machine Learning",
      "Vector Databases",
      "Prompt Engineering",
    ],
    expertise: ["Large Language Models", "Retrieval Augmented Generation", "Data Science"],
    preferredActivities: ["Expert Workshops", "Hackathons", "Tech Talks"],
    availability: "Saturday Mornings",
    isAvailable: true,
  },
  {
    alumniId: 3,
    fullName: "Rohan Pawar",
    email: "rohan.pawar@barclays.com",
    phone: "+91 98901 33456",
    organization: "Barclays Global Service Centre Pune",
    designation: "Senior Java Developer",
    graduationYear: 2020,
    program: "MCA",
    skills: [
      "Java",
      "Spring Boot",
      "Data Structures",
      "Algorithms",
      "System Design",
      "Technical Interviewing",
    ],
    expertise: ["FinTech Architecture", "High Throughput Systems", "Banking APIs"],
    preferredActivities: ["Mock Interviews", "Placement Training", "Curriculum Advice"],
    availability: "Flexible (Online / In-person)",
    isAvailable: true,
  },
  {
    alumniId: 4,
    fullName: "Sneha Joshi",
    email: "sneha.joshi@bajajfinserv.in",
    phone: "+91 94220 44567",
    organization: "Bajaj Finserv Pune",
    designation: "Lead Data Engineer",
    graduationYear: 2017,
    program: "MBA",
    skills: [
      "Data Analytics",
      "SQL",
      "Tableau",
      "Power BI",
      "Finance Analytics",
      "Business Analytics",
    ],
    expertise: ["Financial Modeling", "Business Intelligence", "ETL Pipelines"],
    preferredActivities: ["Project Evaluation", "Guest Lectures", "Case Studies"],
    availability: "Weekday Evenings & Weekends",
    isAvailable: true,
  },
  {
    alumniId: 5,
    fullName: "Amit Chavan",
    email: "amit.chavan@tcs.com",
    phone: "+91 98811 55678",
    organization: "TCS Sahyadri Park Pune",
    designation: "Full Stack Software Architect",
    graduationYear: 2021,
    program: "MCA",
    skills: ["React", "Node.js", "Full Stack Development", "TypeScript", "UI/UX", "Judging"],
    expertise: ["Enterprise Web Applications", "Next.js", "GraphQL"],
    preferredActivities: ["Hackathon Judging", "Coding Contests", "Mentoring"],
    availability: "Weekends Only",
    isAvailable: true,
  },
  {
    alumniId: 6,
    fullName: "Meghna Deshpande",
    email: "meghna.deshpande@capgemini.com",
    phone: "+91 98223 66789",
    organization: "Capgemini Pune",
    designation: "HR Business Partner & Talent Lead",
    graduationYear: 2016,
    program: "MBA",
    skills: [
      "HR Strategy",
      "Technical Interviewing",
      "STAR Method",
      "Campus Recruitment",
      "Soft Skills Training",
    ],
    expertise: ["Behavioral Assessment", "Talent Acquisition", "Leadership Coaching"],
    preferredActivities: ["HR Meets", "Mock Interviews", "Resume Reviews"],
    availability: "Saturday Afternoons",
    isAvailable: true,
  },
  {
    alumniId: 7,
    fullName: "Kshitij Shende",
    email: "kshitij.shende@veritas.com",
    phone: "+91 98500 77890",
    organization: "Veritas Technologies Pune",
    designation: "Staff Software Engineer",
    graduationYear: 2017,
    program: "MCA",
    skills: [
      "Software Project Evaluation",
      "Research Methodology",
      "Peer Review",
      "Cloud Storage",
      "Linux Systems",
    ],
    expertise: ["Distributed File Systems", "Data Resiliency", "Academic Research"],
    preferredActivities: ["Navonmesh Project Judging", "Research Conferences", "Panel Discussions"],
    availability: "Alternate Saturdays",
    isAvailable: true,
  },
  {
    alumniId: 8,
    fullName: "Tanvi Sathe",
    email: "tanvi.sathe@cognizant.com",
    phone: "+91 97300 88901",
    organization: "Cognizant Technology Solutions",
    designation: "Senior Frontend Engineer",
    graduationYear: 2022,
    program: "MCA",
    skills: ["React", "TypeScript", "Tailwind CSS", "UI/UX Design", "Full Stack Development"],
    expertise: ["Design Systems", "Web Performance", "Component Libraries"],
    preferredActivities: ["Hackathon Mentoring", "Coding Contests"],
    availability: "Weekends",
    isAvailable: true,
  },
];

// ─── Initial Demo Invitations ────────────────────────────────────────────────
export const INITIAL_IMCC_INVITATIONS: InvitationDTO[] = [];

// ─── LocalStorage Persistence Helpers ─────────────────────────────────────────
const INVITATIONS_STORAGE_KEY = "almalink_invitations_store_v2";

function getLocalInvitations(): InvitationDTO[] {
  try {
    localStorage.removeItem("almalink_invitations_store");
    const raw = localStorage.getItem(INVITATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalInvitations(invites: InvitationDTO[]): void {
  try {
    localStorage.setItem(INVITATIONS_STORAGE_KEY, JSON.stringify(invites));
  } catch (e) {
    console.error("Failed to persist invitations to localStorage:", e);
  }
}

// ─── Client-side Matchmaking Calculator ──────────────────────────────────────
export function calculateClientMatchmaking(activityId: number): ActivityMatchScore[] {
  // Find activity
  const activities = INITIAL_IMCC_ACTIVITIES;
  const activity = activities.find((a) => a.activityId === activityId);
  const requiredTags = activity
    ? activity.requiredExpertise
    : ["React", "Python", "Cloud Architecture"];

  const normalizedRequired = requiredTags.map((t) => t.trim().toLowerCase());

  return IMCC_DEMO_ALUMNI.map((alumnus) => {
    const allTags = [...alumnus.skills, ...alumnus.expertise].map((t) => t.trim().toLowerCase());

    const matchedTags: string[] = [];
    requiredTags.forEach((tag) => {
      if (allTags.includes(tag.trim().toLowerCase())) {
        matchedTags.push(tag);
      }
    });

    const matchPercentage =
      normalizedRequired.length > 0
        ? Math.round((matchedTags.length / normalizedRequired.length) * 100)
        : 0;

    return {
      alumniId: alumnus.alumniId,
      fullName: alumnus.fullName,
      organization: alumnus.organization,
      designation: alumnus.designation,
      graduationYear: alumnus.graduationYear,
      matchedTags,
      totalRequiredTags: normalizedRequired.length,
      matchPercentage,
      isAvailable: alumnus.isAvailable,
    };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);
}

// ─── 1. Hook: Fetch Matchmaking Recommendations ─────────────────────────────
export function useMatchmaking(activityId: number) {
  return useQuery({
    queryKey: [MATCHMAKING_QUERY_KEY, activityId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/invitations/match/${activityId}`);
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data as ActivityMatchScore[];
        }
      } catch {
        // Fallback to client-side calculation
      }
      return calculateClientMatchmaking(activityId);
    },
    initialData: () => calculateClientMatchmaking(activityId),
    enabled: !!activityId,
  });
}

// ─── 2. Hook: Bulk Dispatch Invitations ───────────────────────────────────────
export function useDispatchInvitations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkInvitationDispatchPayload) => {
      // Find activity title
      const activity = INITIAL_IMCC_ACTIVITIES.find((a) => a.activityId === payload.activityId);
      const activityTitle = activity ? activity.title : "MES IMCC Event";
      const cellName = activity ? activity.cellName : "College Cell";

      const newInvitations: InvitationDTO[] = payload.alumniIds.map((alumniId, idx) => {
        const alumnus = IMCC_DEMO_ALUMNI.find((a) => a.alumniId === alumniId);
        return {
          invitationId: Date.now() + idx,
          activityId: payload.activityId,
          activityTitle,
          cellName,
          alumniId,
          alumniName: alumnus ? alumnus.fullName : "Alumnus",
          alumniEmail: alumnus ? alumnus.email : "alumni@imcc.mespune.in",
          sentBy: 1,
          expectedRole: payload.expectedRole,
          responseDeadline: payload.responseDeadline,
          responseNote: null,
          sentViaEmail: payload.sendEmail,
          sentViaWhatsapp: payload.sendWhatsapp,
          status: InvitationStatus.SENT,
          sentAt: new Date().toISOString(),
          respondedAt: null,
        };
      });

      try {
        const { data } = await apiClient.post("/invitations/dispatch", payload);
        if (data?.data) {
          const current = getLocalInvitations();
          saveLocalInvitations([...newInvitations, ...current]);
          return data.data;
        }
      } catch {
        // Fallback
      }

      const current = getLocalInvitations();
      saveLocalInvitations([...newInvitations, ...current]);
      return newInvitations;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVITATIONS_QUERY_KEY] });
    },
  });
}

// ─── 3. Hook: Activity Invitation Tracking Roster ────────────────────────────
export function useActivityInvitations(activityId: number) {
  return useQuery({
    queryKey: [INVITATIONS_QUERY_KEY, "activity", activityId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/invitations/activity/${activityId}`);
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data as InvitationDTO[];
        }
      } catch {
        // Fallback
      }
      const all = getLocalInvitations();
      return all.filter((inv) => inv.activityId === activityId);
    },
    initialData: () => {
      const all = getLocalInvitations();
      return all.filter((inv) => inv.activityId === activityId);
    },
    enabled: !!activityId,
  });
}

// ─── 4. Hook: Fetch Logged-in Alumnus Invitations ─────────────────────────────
export function useAlumniInvitations(alumniId: number = 1) {
  return useQuery({
    queryKey: [INVITATIONS_QUERY_KEY, "alumni", alumniId],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/invitations/my");
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data as InvitationDTO[];
        }
      } catch {
        // Fallback
      }
      const all = getLocalInvitations();
      return all.filter((inv) => inv.alumniId === alumniId);
    },
    initialData: () => {
      const all = getLocalInvitations();
      return all.filter((inv) => inv.alumniId === alumniId);
    },
  });
}

// ─── 5. Hook: Submit RSVP (Accept or Decline) ────────────────────────────────
export function useRsvpInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invitationId,
      payload,
    }: {
      invitationId: number;
      payload: InvitationRsvpPayload;
    }) => {
      try {
        const { data } = await apiClient.patch(`/invitations/${invitationId}/rsvp`, payload);
        if (data?.data) {
          const current = getLocalInvitations();
          const updated = current.map((inv) =>
            inv.invitationId === invitationId
              ? {
                  ...inv,
                  status: payload.status,
                  responseNote: payload.responseNote ?? inv.responseNote,
                  respondedAt: new Date().toISOString(),
                }
              : inv
          );
          saveLocalInvitations(updated);
          return data.data;
        }
      } catch {
        // Fallback
      }

      const current = getLocalInvitations();
      const updated = current.map((inv) =>
        inv.invitationId === invitationId
          ? {
              ...inv,
              status: payload.status,
              responseNote: payload.responseNote ?? inv.responseNote,
              respondedAt: new Date().toISOString(),
            }
          : inv
      );
      saveLocalInvitations(updated);
      return updated.find((i) => i.invitationId === invitationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [INVITATIONS_QUERY_KEY] });
    },
  });
}
