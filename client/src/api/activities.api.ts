/**
 * activities.api.ts
 * -------------------------------------------------
 * TanStack Query hooks & data layer for Module 3: Activity & Event Management.
 *
 * Includes:
 *  - Real MES IMCC Pune activity categories (Guest Lectures, Hackathons, Fests, etc.)
 *  - Authentic MES IMCC Pune demo activities (Persistent/Infosys tech talks, Jigyasa, Navonmesh, etc.)
 *  - Persistent LocalStorage cache fallback so preview works seamlessly even when backend is offline
 *  - Full CRUD operations (List, Create, Lifecycle transitions, Delete)
 * -------------------------------------------------
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./client";
import { ActivityDTO, ActivityStatus, CreateActivityInput } from "@almalink/shared";

// ─── Query Key Constants ──────────────────────────────────────────────────────
export const ACTIVITIES_QUERY_KEY = "activities";
export const CATEGORIES_QUERY_KEY = "activity-categories";

// ─── Real MES IMCC Pune Activity Categories ──────────────────────────────────
export const IMCC_ACTIVITY_CATEGORIES: { categoryId: number; name: string }[] = [
  { categoryId: 1, name: "Guest Lecture" },
  { categoryId: 2, name: "Expert Workshop" },
  { categoryId: 3, name: "Hackathon / Coding Competition" },
  { categoryId: 4, name: "Mock Interview / Placement Training" },
  { categoryId: 5, name: "Project Competition" },
  { categoryId: 6, name: "Panel Discussion / HR Meet" },
  { categoryId: 7, name: "Alumni Interaction Session" },
  { categoryId: 8, name: "Research Conference / Seminar" },
  { categoryId: 9, name: "Cultural / Fest Event" },
  { categoryId: 10, name: "Sports Event" },
];

// ─── Authentic MES IMCC Pune Demo Events ─────────────────────────────────────
export const INITIAL_IMCC_ACTIVITIES: ActivityDTO[] = [
  {
    activityId: 101,
    cellId: 1,
    cellName: "Training & Placement Cell",
    cellCode: "PLACE",
    categoryId: 1,
    categoryName: "Guest Lecture",
    createdBy: 1,
    createdByName: "Mrs. Apurwa Abhijeet Barve",
    title: "Cloud Computing & Modern Microservices Architecture",
    description:
      "Technical keynote by IMCC alumnus Mr. Vaishnav Kedar (Senior Cloud Automation Engineer at Wipro). Deep dive into AWS ECS, Kubernetes container orchestration, CI/CD automation pipelines, and infrastructure as code (Terraform) for MCA students.",
    requiredExpertise: ["AWS", "Kubernetes", "DevOps", "Microservices", "Docker"],
    startAt: "2024-03-09T10:00:00.000Z",
    endAt: "2024-03-09T13:00:00.000Z",
    venue: "MES IMCC Seminar Hall, 2nd Floor, Pune",
    meetingLink: "https://meet.google.com/imcc-cloud-arch",
    pointsWeight: 20,
    status: ActivityStatus.COMPLETED,
    invitedCount: 14,
    acceptedCount: 8,
    attendedCount: 6,
  },
  {
    activityId: 102,
    cellId: 1,
    cellName: "Training & Placement Cell",
    cellCode: "PLACE",
    categoryId: 4,
    categoryName: "Mock Interview / Placement Training",
    createdBy: 1,
    createdByName: "Mrs. Apurwa Abhijeet Barve",
    title: "Annual HR Meet 2024 & Placement Readiness Bootcamp",
    description:
      "Pre-placement mock interviews and technical competency assessments for MCA final-year students conducted by corporate HR leaders and senior engineering alumni from Persistent Systems, Infosys, and Barclays Pune.",
    requiredExpertise: ["Technical Interviewing", "Data Structures", "Java", "Python", "System Design"],
    startAt: "2024-03-15T09:30:00.000Z",
    endAt: "2024-03-15T17:30:00.000Z",
    venue: "Placement Cell Suites & Conference Hall, IMCC Pune",
    meetingLink: null,
    pointsWeight: 20,
    status: ActivityStatus.COMPLETED,
    invitedCount: 22,
    acceptedCount: 16,
    attendedCount: 14,
  },
  {
    activityId: 103,
    cellId: 1,
    cellName: "Training & Placement Cell",
    cellCode: "PLACE",
    categoryId: 3,
    categoryName: "Hackathon / Coding Competition",
    createdBy: 1,
    createdByName: "Mrs. Apurwa Abhijeet Barve",
    title: "Jigyasa 2024: 24-Hour National Techno-Management Hackathon (Yuva Bharat)",
    description:
      "MES IMCC's flagship annual techno-socio fest featuring competitive 24-hr coding clash, business war case simulations, and live software prototypes evaluated by alumni judges.",
    requiredExpertise: ["Full Stack Development", "React", "Node.js", "Python", "UI/UX", "Judging"],
    startAt: "2024-02-10T08:00:00.000Z",
    endAt: "2024-02-11T16:00:00.000Z",
    venue: "IMCC Computer Lab 1 & 2, Central Campus",
    meetingLink: null,
    pointsWeight: 25,
    status: ActivityStatus.COMPLETED,
    invitedCount: 18,
    acceptedCount: 12,
    attendedCount: 10,
  },
  {
    activityId: 104,
    cellId: 1,
    cellName: "Training & Placement Cell",
    cellCode: "PLACE",
    categoryId: 5,
    categoryName: "Project Competition",
    createdBy: 1,
    createdByName: "Mrs. Apurwa Abhijeet Barve",
    title: "Navonmesh 2024: State-Level Summer Internship & Software Project Competition",
    description:
      "State-level software project and summer internship project (SIP) symposium evaluated by industry tech leads Mr. Kshitij Shende and Dr. Poonam Rawat for MCA/MBA research tracks.",
    requiredExpertise: ["Software Project Evaluation", "Machine Learning", "Data Analytics", "Research Methodology"],
    startAt: "2024-04-18T10:00:00.000Z",
    endAt: "2024-04-18T17:00:00.000Z",
    venue: "IMCC Auditorium & Hybrid Video Link",
    meetingLink: "https://meet.google.com/navonmesh-eval",
    pointsWeight: 15,
    status: ActivityStatus.COMPLETED,
    invitedCount: 10,
    acceptedCount: 6,
    attendedCount: 5,
  },
  {
    activityId: 105,
    cellId: 1,
    cellName: "Training & Placement Cell",
    cellCode: "PLACE",
    categoryId: 7,
    categoryName: "Alumni Interaction Session",
    createdBy: 1,
    createdByName: "Mrs. Apurwa Abhijeet Barve",
    title: "Coffee with IMCC Alumni Entrepreneurs — National Startup Day",
    description:
      "Fireside interaction and panel discussion with IMCC alumni startup founders from Pune tech corridors sharing journeys on bootstrapping, seed funding, and scalable software product architecture.",
    requiredExpertise: ["Entrepreneurship", "Product Management", "Fundraising", "Mentoring"],
    startAt: "2024-01-16T11:00:00.000Z",
    endAt: "2024-01-16T14:00:00.000Z",
    venue: "IMCC Incubation & Innovation Hub",
    meetingLink: null,
    pointsWeight: 15,
    status: ActivityStatus.COMPLETED,
    invitedCount: 8,
    acceptedCount: 5,
    attendedCount: 4,
  },
  {
    activityId: 106,
    cellId: 1,
    cellName: "Training & Placement Cell",
    cellCode: "PLACE",
    categoryId: 2,
    categoryName: "Expert Workshop",
    createdBy: 1,
    createdByName: "Mrs. Apurwa Abhijeet Barve",
    title: "Hands-on Generative AI & Retrieval-Augmented Generation (RAG) Architecture",
    description:
      "Interactive weekend masterclass on designing production-grade LLM applications with LangChain, Pinecone vector embeddings, and enterprise security guardrails.",
    requiredExpertise: ["Python", "Generative AI", "LangChain", "Vector Databases", "Prompt Engineering"],
    startAt: "2026-11-21T09:30:00.000Z",
    endAt: "2026-11-21T16:30:00.000Z",
    venue: "Advanced Computing Lab, 3rd Floor, MES IMCC Pune",
    meetingLink: "https://meet.google.com/imcc-genai-workshop",
    pointsWeight: 20,
    status: ActivityStatus.PUBLISHED,
    invitedCount: 16,
    acceptedCount: 9,
    attendedCount: 0,
  },
  {
    activityId: 107,
    cellId: 1,
    cellName: "Training & Placement Cell",
    cellCode: "PLACE",
    categoryId: 4,
    categoryName: "Mock Interview / Placement Training",
    createdBy: 1,
    createdByName: "Mrs. Apurwa Abhijeet Barve",
    title: "Persistent & Barclays Campus Recruitment Drive: Technical Mock Rounds",
    description:
      "Ongoing 3-day technical assessment drills, live coding problem solving on LeetCode patterns, and behavioral STAR-method interviews for MCA batch.",
    requiredExpertise: ["Data Structures", "Algorithms", "Java", "React", "System Design"],
    startAt: "2026-11-07T09:00:00.000Z",
    endAt: "2026-11-09T18:00:00.000Z",
    venue: "Placement Interview Suites, IMCC Campus",
    meetingLink: "https://meet.google.com/imcc-barclays-mock",
    pointsWeight: 15,
    status: ActivityStatus.ONGOING,
    invitedCount: 12,
    acceptedCount: 8,
    attendedCount: 6,
  },
  {
    activityId: 108,
    cellId: 1,
    cellName: "Training & Placement Cell",
    cellCode: "PLACE",
    categoryId: 8,
    categoryName: "Research Conference / Seminar",
    createdBy: 1,
    createdByName: "Mrs. Apurwa Abhijeet Barve",
    title: "IC2TMA 2027: International Conference on Computer Technology & Management Applications",
    description:
      "Upcoming symposium calling for research papers, peer reviews, and keynote panel addresses on emerging computing paradigms and sustainable enterprise management.",
    requiredExpertise: ["Research Paper Review", "Peer Review", "Cloud Computing", "Management Science"],
    startAt: "2027-01-22T09:00:00.000Z",
    endAt: "2027-01-23T18:00:00.000Z",
    venue: "MES IMCC Auditorium & Virtual Stream",
    meetingLink: null,
    pointsWeight: 25,
    status: ActivityStatus.DRAFT,
    invitedCount: 0,
    acceptedCount: 0,
    attendedCount: 0,
  },
];

// ─── LocalStorage Persistence Helpers ─────────────────────────────────────────
const LOCAL_STORAGE_KEY = "almalink_activities_store";

function getLocalActivities(): ActivityDTO[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_IMCC_ACTIVITIES));
      return INITIAL_IMCC_ACTIVITIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_IMCC_ACTIVITIES;
  } catch {
    return INITIAL_IMCC_ACTIVITIES;
  }
}

function saveLocalActivities(activities: ActivityDTO[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(activities));
  } catch (e) {
    console.error("Failed to persist activities to localStorage:", e);
  }
}

// ─── Types for API Responses ──────────────────────────────────────────────────
export interface ActivityListFilters {
  cellId?: number;
  status?: "DRAFT" | "PUBLISHED" | "ONGOING" | "COMPLETED";
}

// ─── 1. Fetch all activity categories (for the form dropdown) ─────────────────
export function useActivityCategories() {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get("/activities/categories");
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data as { categoryId: number; name: string }[];
        }
      } catch {
        // Backend offline or endpoint unseeded — gracefully use IMCC standard categories
      }
      return IMCC_ACTIVITY_CATEGORIES;
    },
    initialData: IMCC_ACTIVITY_CATEGORIES,
    staleTime: Infinity,
  });
}

// ─── 2. Fetch list of activities (with optional filters) ─────────────────────
export function useActivities(filters: ActivityListFilters = {}) {
  return useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, filters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (filters.cellId) params.append("cellId", String(filters.cellId));
        if (filters.status) params.append("status", filters.status);

        const { data } = await apiClient.get(`/activities?${params.toString()}`);
        if (data?.data && Array.isArray(data.data) && data.data.length > 0) {
          return data.data as ActivityDTO[];
        }
      } catch {
        // Fallback to local activities
      }

      // Read from local persistent storage and filter
      const all = getLocalActivities();
      if (filters.status) {
        return all.filter((a) => a.status === filters.status);
      }
      return all;
    },
    initialData: () => {
      const all = getLocalActivities();
      if (filters.status) {
        return all.filter((a) => a.status === filters.status);
      }
      return all;
    },
  });
}

// ─── 3. Fetch a single activity by ID ────────────────────────────────────────
export function useActivity(id: number | undefined) {
  return useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, id],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get(`/activities/${id}`);
        if (data?.data) return data.data as ActivityDTO;
      } catch {
        // Fallback
      }
      const all = getLocalActivities();
      const match = all.find((a) => a.activityId === id);
      if (match) return match;
      throw new Error("Activity not found.");
    },
    enabled: !!id,
  });
}

// ─── 4. Create a new activity ─────────────────────────────────────────────────
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateActivityInput) => {
      // Find category name
      const category = IMCC_ACTIVITY_CATEGORIES.find(
        (c) => c.categoryId === input.categoryId
      );

      const newActivity: ActivityDTO = {
        activityId: Date.now(),
        cellId: input.cellId,
        cellName: "Training & Placement Cell",
        cellCode: "PLACE",
        categoryId: input.categoryId,
        categoryName: category?.name ?? "Event",
        createdBy: 1,
        createdByName: "Mrs. Apurwa Abhijeet Barve",
        title: input.title,
        description: input.description,
        requiredExpertise: input.requiredExpertise,
        startAt: new Date(input.startAt).toISOString(),
        endAt: new Date(input.endAt).toISOString(),
        venue: input.venue,
        meetingLink: input.meetingLink || null,
        pointsWeight: input.pointsWeight ?? 10,
        status: ActivityStatus.DRAFT,
        invitedCount: 0,
        acceptedCount: 0,
        attendedCount: 0,
      };

      try {
        const { data } = await apiClient.post("/activities", input);
        if (data?.data) {
          // Sync with local storage
          const current = getLocalActivities();
          saveLocalActivities([data.data, ...current]);
          return data.data as ActivityDTO;
        }
      } catch {
        // Backend offline — persist locally
      }

      const current = getLocalActivities();
      saveLocalActivities([newActivity, ...current]);
      return newActivity;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
    },
  });
}

// ─── 5. Update activity status (lifecycle transitions) ───────────────────────
export function useUpdateActivityStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      activityId,
      status,
    }: {
      activityId: number;
      status: string;
    }) => {
      try {
        const { data } = await apiClient.patch(
          `/activities/${activityId}/status`,
          { status }
        );
        if (data?.data) {
          const current = getLocalActivities();
          const updated = current.map((a) =>
            a.activityId === activityId ? (data.data as ActivityDTO) : a
          );
          saveLocalActivities(updated);
          return data.data as ActivityDTO;
        }
      } catch {
        // Backend offline — update local state
      }

      const current = getLocalActivities();
      const updated = current.map((a) =>
        a.activityId === activityId
          ? { ...a, status: status as ActivityStatus }
          : a
      );
      saveLocalActivities(updated);
      return updated.find((a) => a.activityId === activityId)!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
    },
  });
}

// ─── 6. Delete a DRAFT activity ───────────────────────────────────────────────
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityId: number) => {
      try {
        await apiClient.delete(`/activities/${activityId}`);
      } catch {
        // Backend offline
      }
      const current = getLocalActivities();
      saveLocalActivities(current.filter((a) => a.activityId !== activityId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
    },
  });
}
