/**
 * activities.api.ts
 * -------------------------------------------------
 * TanStack Query hooks for Module 3: Activity & Event Management.
 *
 * What is TanStack Query?
 *   Think of it as a smarter version of useState + useEffect for data fetching.
 *   It automatically handles:
 *     - Loading states (isLoading, isFetching)
 *     - Error states (isError, error)
 *     - Caching: same data won't be refetched for 60 seconds
 *     - Automatic cache invalidation: after creating/deleting, the list
 *       automatically refreshes without you writing any extra code
 *
 * Pattern used:
 *   - useQuery()   → for GET requests (reading data)
 *   - useMutation() → for POST/PATCH/DELETE requests (changing data)
 * -------------------------------------------------
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./client";
import { ActivityDTO, CreateActivityInput } from "@almalink/shared";

// ─── Query Key Constants ──────────────────────────────────────────────────────
// Using constants prevents typos — same key everywhere ensures cache consistency
export const ACTIVITIES_QUERY_KEY = "activities";
export const CATEGORIES_QUERY_KEY = "activity-categories";

// ─── Types for API Responses ──────────────────────────────────────────────────
export interface ActivityListFilters {
  cellId?: number;
  status?: "DRAFT" | "PUBLISHED" | "ONGOING" | "COMPLETED";
}

// ─── 1. Fetch all activity categories (for the form dropdown) ─────────────────
/**
 * useActivityCategories()
 *
 * Returns the list of category options like:
 *   { categoryId: 1, name: "Guest Lecture" }
 *   { categoryId: 2, name: "Hackathon / Coding Competition" }
 *   ...etc
 *
 * staleTime: Infinity → categories never change, so never re-fetch automatically
 */
export function useActivityCategories() {
  return useQuery({
    queryKey: [CATEGORIES_QUERY_KEY],
    queryFn: async () => {
      const { data } = await apiClient.get("/activities/categories");
      return data.data as { categoryId: number; name: string }[];
    },
    staleTime: Infinity, // Categories are static — no need to refetch
  });
}

// ─── 2. Fetch list of activities (with optional filters) ─────────────────────
/**
 * useActivities(filters)
 *
 * Example usage:
 *   const { data, isLoading } = useActivities({ cellId: 1, status: "DRAFT" });
 *
 * When `filters` changes (e.g., user clicks "Published" tab), TanStack Query
 * automatically re-fetches with the new filter — no extra code needed.
 */
export function useActivities(filters: ActivityListFilters = {}) {
  return useQuery({
    // The query key includes filters so each unique combination is cached separately
    queryKey: [ACTIVITIES_QUERY_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.cellId)  params.append("cellId",  String(filters.cellId));
      if (filters.status)  params.append("status",  filters.status);

      const { data } = await apiClient.get(`/activities?${params.toString()}`);
      return data.data as ActivityDTO[];
    },
  });
}

// ─── 3. Fetch a single activity by ID ────────────────────────────────────────
/**
 * useActivity(id)
 *
 * Example usage:
 *   const { data: activity, isLoading } = useActivity(42);
 *
 * enabled: !!id → the query won't run if id is undefined/null
 */
export function useActivity(id: number | undefined) {
  return useQuery({
    queryKey: [ACTIVITIES_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/activities/${id}`);
      return data.data as ActivityDTO;
    },
    enabled: !!id, // Only fetch if a real ID was provided
  });
}

// ─── 4. Create a new activity ─────────────────────────────────────────────────
/**
 * useCreateActivity()
 *
 * Usage:
 *   const { mutate: createActivity, isPending } = useCreateActivity();
 *   createActivity(formData, {
 *     onSuccess: () => navigate("/coordinator/activities"),
 *   });
 *
 * onSuccess: automatically invalidates the activities list cache so the new
 * activity appears immediately without a page refresh.
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateActivityInput) => {
      const { data } = await apiClient.post("/activities", input);
      return data.data as ActivityDTO;
    },
    onSuccess: () => {
      // Bust the cache for the activities list so it refetches automatically
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
    },
  });
}

// ─── 5. Update activity status (lifecycle transitions) ───────────────────────
/**
 * useUpdateActivityStatus()
 *
 * Usage:
 *   const { mutate: updateStatus } = useUpdateActivityStatus();
 *   updateStatus({ activityId: 5, status: "PUBLISHED" });
 */
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
      const { data } = await apiClient.patch(
        `/activities/${activityId}/status`,
        { status }
      );
      return data.data as ActivityDTO;
    },
    onSuccess: () => {
      // Refresh the activities list and any open activity detail view
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
    },
  });
}

// ─── 6. Delete a DRAFT activity ───────────────────────────────────────────────
/**
 * useDeleteActivity()
 *
 * Usage:
 *   const { mutate: deleteActivity } = useDeleteActivity();
 *   deleteActivity(activityId);
 *
 * Only works if the activity is in DRAFT status (enforced server-side).
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (activityId: number) => {
      await apiClient.delete(`/activities/${activityId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
    },
  });
}

