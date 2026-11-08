/**
 * ActivityCard.tsx
 * -------------------------------------------------
 * Mobile-first card component for a single activity.
 *
 * Used on screens < 768px (md breakpoint) where the full data table
 * is hidden and activities are shown as tappable cards instead.
 *
 * Shows:
 *   - Activity title & category (e.g., "Guest Lecture")
 *   - Date range
 *   - Venue
 *   - Status badge
 *   - Invitation & participation counts
 *   - Action buttons: Publish / View / Delete (only for Coordinator)
 *
 * Props:
 *   activity    — The activity data object
 *   isCoordinator — Toggles the action buttons (only shown for CELL_COORDINATOR role)
 *   onStatusChange — Callback when Publish/Complete is clicked
 *   onDelete       — Callback when Delete is clicked
 * -------------------------------------------------
 */

import React from "react";
import { Calendar, MapPin, Users, ChevronRight, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ActivityStatusBadge } from "./ActivityStatusBadge";
import { ActivityDTO, ActivityStatus } from "@almalink/shared";

// Format a UTC datetime string to readable IST display: "9 Mar 2024, 10:00 AM"
function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

interface ActivityCardProps {
  activity: ActivityDTO;
  isCoordinator: boolean;
  onView: (id: number) => void;
  onStatusChange: (id: number, newStatus: ActivityStatus) => void;
  onDelete: (id: number) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  isCoordinator,
  onView,
  onStatusChange,
  onDelete,
}) => {
  // Determine what the "next action" button should say based on current status
  const getNextAction = (): { label: string; status: ActivityStatus } | null => {
    if (!isCoordinator) return null;
    if (activity.status === ActivityStatus.DRAFT)      return { label: "Publish",  status: ActivityStatus.PUBLISHED };
    if (activity.status === ActivityStatus.PUBLISHED)  return { label: "Mark Ongoing", status: ActivityStatus.ONGOING };
    if (activity.status === ActivityStatus.ONGOING)    return { label: "Mark Completed", status: ActivityStatus.COMPLETED };
    return null;
  };

  const nextAction = getNextAction();

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-sm hover:shadow-md transition-shadow">
      {/* ── Header: Category tag + Status badge ── */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-brand-iris uppercase tracking-wider">
          {activity.categoryName ?? "Event"}
        </span>
        <ActivityStatusBadge status={activity.status as ActivityStatus} />
      </div>

      {/* ── Title ── */}
      <h3 className="text-sm font-semibold text-slate-900 leading-snug">
        {activity.title}
      </h3>

      {/* ── Date & Venue ── */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          <span>{formatDateTime(activity.startAt)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{activity.venue}</span>
        </div>
      </div>

      {/* ── Counts: Invitations + Participations ── */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          <span>{activity.invitedCount ?? 0} invited</span>
        </div>
        <span>•</span>
        <span>{activity.attendedCount ?? 0} attended</span>
        <span>•</span>
        <span className="font-medium text-brand-iris">{activity.pointsWeight} pts</span>
      </div>

      {/* ── Expertise Tags ── */}
      {activity.requiredExpertise.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activity.requiredExpertise.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-brand-iris/10 text-brand-iris text-xs rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
          {activity.requiredExpertise.length > 3 && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
              +{activity.requiredExpertise.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* ── Action Buttons ── */}
      <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
        {/* View button — always visible */}
        <button
          onClick={() => onView(activity.activityId)}
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-brand-iris font-medium transition-colors"
        >
          View <ChevronRight className="h-3.5 w-3.5" />
        </button>

        {/* Coordinator-only actions */}
        {isCoordinator && (
          <>
            {nextAction && (
              <button
                onClick={() => onStatusChange(activity.activityId, nextAction.status)}
                className={cn(
                  "ml-auto px-3 py-1 rounded-lg text-xs font-semibold transition-colors",
                  "bg-brand-iris text-white hover:bg-brand-iris/90"
                )}
              >
                {nextAction.label}
              </button>
            )}

            {/* Delete only available on DRAFT activities */}
            {activity.status === ActivityStatus.DRAFT && (
              <button
                onClick={() => onDelete(activity.activityId)}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-rose-50"
                title="Delete draft"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
