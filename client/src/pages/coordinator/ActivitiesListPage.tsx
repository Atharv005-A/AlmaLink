/**
 * ActivitiesListPage.tsx
 * -------------------------------------------------
 * Figma Reference: 3314:45796
 * Route: /coordinator/activities
 *
 * This is the main Activities screen for Cell Coordinators.
 * It shows all events created for their cell with:
 *
 *  1. Status filter tabs: All | Draft | Published | Ongoing | Completed
 *  2. "Add Event" button — ONLY shown to CELL_COORDINATOR role
 *  3. Desktop: Professional data table (sticky headers, quick-action column)
 *  4. Mobile: Tappable ActivityCard list (< 768px)
 *  5. Empty state with institutional copy when no activities exist
 *
 * Key design decisions:
 *  - Coordinator's cellId is read from their JWT session (req.user.cellId)
 *  - Alumni and College Admins can VIEW but cannot add/edit/delete
 *  - Status transitions (Publish, Mark Ongoing, Mark Completed) happen
 *    inline from the action column without leaving the page
 * -------------------------------------------------
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  MapPin,
  Users,
  Trash2,
  ChevronRight,
  BookOpen,
  Loader2,
} from "lucide-react";

import { useActivities, useUpdateActivityStatus, useDeleteActivity } from "@/api/activities.api";
import { ActivityStatusBadge } from "@/components/modules/activities/ActivityStatusBadge";
import { ActivityCard } from "@/components/modules/activities/ActivityCard";
import { cn } from "@/lib/utils";
import { ActivityStatus, ActivityDTO } from "@almalink/shared";

// ─── Status Filter Tab Configuration ─────────────────────────────────────────
const STATUS_TABS = [
  { label: "All Events", value: undefined },
  { label: "Draft",      value: ActivityStatus.DRAFT },
  { label: "Published",  value: ActivityStatus.PUBLISHED },
  { label: "Ongoing",    value: ActivityStatus.ONGOING },
  { label: "Completed",  value: ActivityStatus.COMPLETED },
] as const;

// ─── Mock: In production this comes from AuthContext (JWT payload) ─────────────
// TODO: Replace with real useAuth() hook once AuthContext is implemented
const MOCK_SESSION = {
  userId: 1,
  role: "CELL_COORDINATOR" as const,   // Change to "COLLEGE_ADMIN" to test read-only view
  cellId: 1,
  fullName: "Mrs. Apurwa Abhijeet Barve",
  cellName: "Training & Placement Cell",
};

// ─── Date formatter helper ─────────────────────────────────────────────────────
function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

// ─── Main Page Component ───────────────────────────────────────────────────────
export const ActivitiesListPage: React.FC = () => {
  const navigate = useNavigate();
  const session = MOCK_SESSION;

  // Whether the current user can add/edit/delete activities
  const isCoordinator = session.role === "CELL_COORDINATOR";

  // Track which status tab is active (undefined = "All")
  const [activeStatus, setActiveStatus] = useState<ActivityStatus | undefined>(undefined);

  // ── Fetch activities from the API ──
  const {
    data: activities = [],
    isLoading,
    isError,
  } = useActivities({ cellId: session.cellId, status: activeStatus });

  // ── Mutations ──
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateActivityStatus();
  const { mutate: deleteActivity, isPending: isDeleting } = useDeleteActivity();

  // Handle status transition button clicks (Publish, Mark Ongoing, etc.)
  const handleStatusChange = (activityId: number, newStatus: ActivityStatus) => {
    updateStatus({ activityId, status: newStatus });
  };

  // Handle delete with a simple browser confirm dialog
  const handleDelete = (activityId: number) => {
    if (window.confirm("Delete this draft activity? This cannot be undone.")) {
      deleteActivity(activityId);
    }
  };

  // ── Determine next lifecycle action for each row ──
  const getNextAction = (
    status: ActivityStatus
  ): { label: string; next: ActivityStatus } | null => {
    if (!isCoordinator) return null;
    if (status === ActivityStatus.DRAFT)      return { label: "Publish",         next: ActivityStatus.PUBLISHED };
    if (status === ActivityStatus.PUBLISHED)  return { label: "Mark Ongoing",    next: ActivityStatus.ONGOING };
    if (status === ActivityStatus.ONGOING)    return { label: "Mark Completed",  next: ActivityStatus.COMPLETED };
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Title + cell scope */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Activities & Events
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {session.cellName} · {activities.length} event
              {activities.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/*
           * "Add Event" button — ONLY rendered for CELL_COORDINATOR role.
           * College Admins and Alumni will never see this button.
           * This is enforced both here (UI) and on the server (RBAC middleware).
           */}
          {isCoordinator && (
            <button
              onClick={() => navigate("/coordinator/activities/create")}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl",
                "bg-brand-iris text-white text-sm font-semibold",
                "hover:bg-brand-iris/90 active:scale-95 transition-all",
                "shadow-sm shadow-brand-iris/30"
              )}
            >
              <Plus className="h-4 w-4" />
              Add Event
            </button>
          )}
        </div>

        {/* ── Status Filter Tabs ─────────────────────────────────────────── */}
        <div className="flex gap-1 mt-5 overflow-x-auto pb-px">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveStatus(tab.value as ActivityStatus | undefined)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                activeStatus === tab.value
                  ? "bg-brand-iris text-white"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm">Loading events…</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
            Failed to load activities. Please refresh the page.
          </div>
        )}

        {/* Empty State — Institutional copy (no generic "No data") */}
        {!isLoading && !isError && activities.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 bg-brand-iris/10 rounded-2xl flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-brand-iris" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {activeStatus
                ? `No ${activeStatus.toLowerCase()} events`
                : "No events yet"}
            </h3>
            <p className="text-sm text-slate-500 max-w-xs mt-1">
              {isCoordinator
                ? "Create your first activity to start inviting alumni for guest lectures, hackathons, and more."
                : "No events have been created for this cell yet."}
            </p>
            {isCoordinator && (
              <button
                onClick={() => navigate("/coordinator/activities/create")}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-iris text-white text-sm font-semibold hover:bg-brand-iris/90 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add First Event
              </button>
            )}
          </div>
        )}

        {/* ── MOBILE: Card List (hidden on md and above) ──────────────────── */}
        {!isLoading && activities.length > 0 && (
          <div className="space-y-3 md:hidden">
            {activities.map((activity) => (
              <ActivityCard
                key={activity.activityId}
                activity={activity}
                isCoordinator={isCoordinator}
                onView={(id) => navigate(`/coordinator/activities/${id}`)}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* ── DESKTOP: Data Table (shown on md and above) ─────────────────── */}
        {!isLoading && activities.length > 0 && (
          <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Venue
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Invited
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activities.map((activity) => {
                  const nextAction = getNextAction(activity.status as ActivityStatus);
                  return (
                    <tr
                      key={activity.activityId}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Event Title + expertise tags */}
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-slate-900 truncate max-w-[220px]">
                          {activity.title}
                        </p>
                        {activity.requiredExpertise.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {activity.requiredExpertise.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 bg-brand-iris/10 text-brand-iris text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                            {activity.requiredExpertise.length > 2 && (
                              <span className="text-xs text-slate-400">
                                +{activity.requiredExpertise.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-slate-600">
                        {activity.categoryName ?? "—"}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {formatDate(activity.startAt)}
                        </div>
                      </td>

                      {/* Venue */}
                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="flex items-center gap-1.5 max-w-[160px] truncate">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{activity.venue}</span>
                        </div>
                      </td>

                      {/* Invited count */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Users className="h-3.5 w-3.5 text-slate-400" />
                          {activity.invitedCount ?? 0}
                        </div>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3.5">
                        <ActivityStatusBadge
                          status={activity.status as ActivityStatus}
                        />
                      </td>

                      {/* Actions column — Coordinator only for write actions */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          {/* View detail */}
                          <button
                            onClick={() =>
                              navigate(`/coordinator/activities/${activity.activityId}`)
                            }
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand-iris transition-colors"
                            title="View detail"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>

                          {/* Lifecycle transition button — Coordinator only */}
                          {isCoordinator && nextAction && (
                            <button
                              onClick={() =>
                                handleStatusChange(activity.activityId, nextAction.next)
                              }
                              disabled={isUpdatingStatus}
                              className={cn(
                                "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors",
                                "bg-brand-iris/10 text-brand-iris hover:bg-brand-iris hover:text-white",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                              )}
                            >
                              {nextAction.label}
                            </button>
                          )}

                          {/* Delete — Coordinator, DRAFT only */}
                          {isCoordinator &&
                            activity.status === ActivityStatus.DRAFT && (
                              <button
                                onClick={() => handleDelete(activity.activityId)}
                                disabled={isDeleting}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                title="Delete draft"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
