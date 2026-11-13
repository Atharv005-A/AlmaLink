/**
 * ActivityStatusBadge.tsx
 * -------------------------------------------------
 * Renders the operational status pill for an activity.
 *
 * Colors follow the locked Design System from DESIGN_SYSTEM.md:
 *   DRAFT     → Slate grey  (bg-slate-100  text-slate-700)
 *   PUBLISHED → Blue        (bg-blue-50    text-blue-700)
 *   ONGOING   → Purple      (bg-purple-50  text-purple-700)
 *   COMPLETED → Green       (bg-emerald-50 text-emerald-700)
 *
 * Usage:
 *   <ActivityStatusBadge status="PUBLISHED" />
 * -------------------------------------------------
 */

import React from "react";
import { cn } from "@/lib/utils";
import { ActivityStatus } from "@almalink/shared";

// Map each status to its Design System color classes
const STATUS_CONFIG: Record<ActivityStatus, { label: string; className: string; dot: string }> = {
  [ActivityStatus.DRAFT]: {
    label: "Draft",
    className: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
  },
  [ActivityStatus.PUBLISHED]: {
    label: "Published",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
  },
  [ActivityStatus.ONGOING]: {
    label: "Ongoing",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    dot: "bg-purple-500",
  },
  [ActivityStatus.COMPLETED]: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  },
};

interface ActivityStatusBadgeProps {
  status: ActivityStatus;
  className?: string;
}

export const ActivityStatusBadge: React.FC<ActivityStatusBadgeProps> = ({ status, className }) => {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide",
        config.className,
        className
      )}
    >
      {/* Small dot indicator before the label */}
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
      {config.label}
    </span>
  );
};
