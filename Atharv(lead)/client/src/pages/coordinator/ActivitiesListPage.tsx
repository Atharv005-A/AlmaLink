/**
 * ActivitiesListPage.tsx
 * -------------------------------------------------
 * Figma Reference: 3314:45796
 * Route: /coordinator/activities
 *
 * This is the main Activities screen for Cell Coordinators.
 * It shows all events created for their cell with:
 *
 *  1. Status filter tabs: All | Draft | Published | Ongoing | Completed (with dynamic counts)
 *  2. "Add Event" button — ONLY shown to CELL_COORDINATOR role
 *  3. Desktop: Professional data table (sticky headers, quick-action column, clickable rows)
 *  4. Mobile: Tappable ActivityCard list (< 768px)
 *  5. Detail Inspection Modal: Inspect complete agenda, venue, speaker, Google Meet, and RSVP metrics
 *  6. Inline lifecycle transitions: Publish, Mark Ongoing, Mark Completed, Delete Draft
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
  X,
  ExternalLink,
  Award,
  Sparkles,
  RefreshCw,
} from "lucide-react";

import {
  useActivities,
  useUpdateActivityStatus,
  useDeleteActivity,
  INITIAL_IMCC_ACTIVITIES,
} from "@/api/activities.api";
import { ActivityStatusBadge } from "@/components/modules/activities/ActivityStatusBadge";
import { ActivityCard } from "@/components/modules/activities/ActivityCard";
import { cn } from "@/lib/utils";
import { ActivityStatus, ActivityDTO } from "@almalink/shared";

// ─── Status Filter Tab Configuration ─────────────────────────────────────────
const STATUS_TABS = [
  { label: "All Events", value: undefined },
  { label: "Draft", value: ActivityStatus.DRAFT },
  { label: "Published", value: ActivityStatus.PUBLISHED },
  { label: "Ongoing", value: ActivityStatus.ONGOING },
  { label: "Completed", value: ActivityStatus.COMPLETED },
] as const;

// ─── Mock: In production this comes from AuthContext (JWT payload) ─────────────
const MOCK_SESSION = {
  userId: 1,
  role: "CELL_COORDINATOR" as const,
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

function formatFullDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
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

  // Track selected activity for details modal
  const [selectedActivity, setSelectedActivity] = useState<ActivityDTO | null>(null);

  // ── Fetch all activities (to compute tab badge counts) ──
  const { data: allActivities = [] } = useActivities({ cellId: session.cellId });

  // ── Fetch filtered activities for the active tab ──
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
    if (selectedActivity?.activityId === activityId) {
      setSelectedActivity((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Handle delete with a confirmation dialog
  const handleDelete = (activityId: number) => {
    if (window.confirm("Delete this draft activity? This cannot be undone.")) {
      deleteActivity(activityId);
      if (selectedActivity?.activityId === activityId) {
        setSelectedActivity(null);
      }
    }
  };

  // ── Determine next lifecycle action for each row ──
  const getNextAction = (
    status: ActivityStatus
  ): { label: string; next: ActivityStatus } | null => {
    if (!isCoordinator) return null;
    if (status === ActivityStatus.DRAFT) return { label: "Publish", next: ActivityStatus.PUBLISHED };
    if (status === ActivityStatus.PUBLISHED) return { label: "Mark Ongoing", next: ActivityStatus.ONGOING };
    if (status === ActivityStatus.ONGOING) return { label: "Mark Completed", next: ActivityStatus.COMPLETED };
    return null;
  };

  // Reset to initial IMCC demo activities helper
  const handleResetDemoData = () => {
    if (window.confirm("Restore original MES IMCC Pune demo events?")) {
      localStorage.setItem("almalink_activities_store", JSON.stringify(INITIAL_IMCC_ACTIVITIES));
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Title + cell scope badge */}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Activities & Events
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-iris/10 text-brand-iris">
                <Sparkles className="h-3 w-3" />
                MES IMCC Pune
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-semibold text-slate-800">{session.cellName}</span> ·{" "}
              {activities.length} event{activities.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Demo Reset Button */}
            <button
              onClick={handleResetDemoData}
              title="Reset to default IMCC demo events"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            {/*
             * "Add Event" button — ONLY rendered for CELL_COORDINATOR role.
             * College Admins and Alumni will never see this button.
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
        </div>

        {/* ── Status Filter Tabs with Live Counts ─────────────────────────── */}
        <div className="flex gap-1.5 mt-5 overflow-x-auto pb-1">
          {STATUS_TABS.map((tab) => {
            const count = tab.value
              ? allActivities.filter((a) => a.status === tab.value).length
              : allActivities.length;
            const isActive = activeStatus === tab.value;

            return (
              <button
                key={tab.label}
                onClick={() => setActiveStatus(tab.value as ActivityStatus | undefined)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-brand-iris text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full text-xs font-semibold leading-none",
                    isActive ? "bg-white/25 text-white" : "bg-slate-100 text-slate-600"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-brand-iris" />
            <span className="text-sm font-medium">Loading events…</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-sm text-rose-700">
            Failed to load activities. Please refresh the page.
          </div>
        )}

        {/* Empty State */}
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
                onView={(id) => {
                  const match = activities.find((a) => a.activityId === id);
                  if (match) setSelectedActivity(match);
                }}
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
                    Date & Venue
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
                      onClick={() => setSelectedActivity(activity)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Event Title + required expertise tags */}
                      <td className="px-4 py-3.5 max-w-[280px]">
                        <p className="font-semibold text-slate-900 group-hover:text-brand-iris transition-colors line-clamp-1">
                          {activity.title}
                        </p>
                        {activity.requiredExpertise.length > 0 && (
                          <div className="flex gap-1 mt-1.5 flex-wrap">
                            {activity.requiredExpertise.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-brand-iris/10 text-brand-iris text-xs rounded-full font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                            {activity.requiredExpertise.length > 3 && (
                              <span className="text-xs text-slate-400">
                                +{activity.requiredExpertise.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-slate-700 font-medium">
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-xs text-slate-700">
                          {activity.categoryName ?? "Event"}
                        </span>
                      </td>

                      {/* Date & Venue */}
                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          {formatDate(activity.startAt)}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 max-w-[180px] truncate">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{activity.venue}</span>
                        </div>
                      </td>

                      {/* Engagement stats */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <Users className="h-3.5 w-3.5 text-slate-400" />
                            {activity.invitedCount ?? 0} invited
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="font-semibold text-brand-iris">
                            {activity.pointsWeight} pts
                          </span>
                        </div>
                        {activity.status === ActivityStatus.COMPLETED && (
                          <p className="text-xs text-emerald-600 mt-1 font-medium">
                            {activity.attendedCount} attended & credited
                          </p>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3.5">
                        <ActivityStatusBadge
                          status={activity.status as ActivityStatus}
                        />
                      </td>

                      {/* Actions column */}
                      <td
                        className="px-4 py-3.5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Lifecycle transition button — Coordinator only */}
                          {isCoordinator && nextAction && (
                            <button
                              onClick={() =>
                                handleStatusChange(activity.activityId, nextAction.next)
                              }
                              disabled={isUpdatingStatus}
                              className={cn(
                                "px-3 py-1 rounded-lg text-xs font-semibold transition-colors",
                                "bg-brand-iris text-white hover:bg-brand-iris/90",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                              )}
                            >
                              {nextAction.label}
                            </button>
                          )}

                          {/* Delete — Coordinator, DRAFT only */}
                          {isCoordinator && activity.status === ActivityStatus.DRAFT && (
                            <button
                              onClick={() => handleDelete(activity.activityId)}
                              disabled={isDeleting}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              title="Delete draft"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}

                          {/* Open Detail modal */}
                          <button
                            onClick={() => setSelectedActivity(activity)}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                            title="View event details"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </button>
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

      {/* ── Slide-over / Inspection Modal for Activity Details ───────────── */}
      {selectedActivity && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedActivity(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-iris">
                    {selectedActivity.categoryName}
                  </span>
                  <span className="text-slate-300">·</span>
                  <ActivityStatusBadge
                    status={selectedActivity.status as ActivityStatus}
                  />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedActivity.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedActivity(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Activity Overview
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                {selectedActivity.description}
              </p>
            </div>

            {/* Event Logistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-xs font-medium text-slate-500">Schedule (IST)</span>
                <p className="text-xs font-semibold text-slate-800">
                  {formatFullDateTime(selectedActivity.startAt)}
                </p>
                <p className="text-xs text-slate-500">
                  to {formatFullDateTime(selectedActivity.endAt)}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                <span className="text-xs font-medium text-slate-500">Venue & Location</span>
                <p className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand-iris shrink-0" />
                  {selectedActivity.venue}
                </p>
                {selectedActivity.meetingLink && (
                  <a
                    href={selectedActivity.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-brand-iris hover:underline font-medium mt-1"
                  >
                    Google Meet Video Link <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Required Expertise Tags */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Required Alumni Expertise / Skills
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedActivity.requiredExpertise.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-brand-iris/10 text-brand-iris text-xs rounded-full font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Engagement Metrics & Points */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Contribution Points Weight</span>
                <p className="text-lg font-bold text-brand-iris flex items-center gap-1">
                  <Award className="h-5 w-5" />
                  {selectedActivity.pointsWeight} Points Awarded
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Alumni Engagement</span>
                <p className="text-sm font-semibold text-slate-800">
                  {selectedActivity.invitedCount} Invited · {selectedActivity.acceptedCount} Confirmed
                </p>
                {selectedActivity.attendedCount !== undefined && (
                  <p className="text-xs text-emerald-600 font-medium">
                    {selectedActivity.attendedCount} Attended
                  </p>
                )}
              </div>
            </div>

            {/* Coordinator Info */}
            <div className="text-xs text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100">
              <span>
                Organized by:{" "}
                <span className="font-semibold text-slate-700">
                  {selectedActivity.createdByName ?? session.fullName}
                </span>{" "}
                ({session.cellName})
              </span>
              <span>ID: #{selectedActivity.activityId}</span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 text-sm rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
              >
                Close
              </button>

              {isCoordinator &&
                getNextAction(selectedActivity.status as ActivityStatus) && (
                  <button
                    onClick={() => {
                      const next = getNextAction(selectedActivity.status as ActivityStatus)!;
                      handleStatusChange(selectedActivity.activityId, next.next);
                    }}
                    disabled={isUpdatingStatus}
                    className="px-4 py-2 text-sm rounded-xl bg-brand-iris text-white hover:bg-brand-iris/90 font-semibold transition-colors"
                  >
                    {getNextAction(selectedActivity.status as ActivityStatus)!.label}
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
