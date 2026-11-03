import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-iris text-white shadow",
        secondary:
          "border-transparent bg-brand-iris-light text-brand-iris",
        destructive:
          "border-rose-200 bg-rose-50 text-rose-700",
        outline: "text-slate-900 border-slate-300",
        // Operational Status Badges (DESIGN_SYSTEM.md)
        verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
        pending: "bg-amber-50 text-amber-700 border-amber-200",
        rejected: "bg-rose-50 text-rose-700 border-rose-200",
        draft: "bg-slate-100 text-slate-700 border-slate-200",
        published: "bg-blue-50 text-blue-700 border-blue-200",
        ongoing: "bg-purple-50 text-purple-700 border-purple-200",
        completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
        sent: "bg-amber-50 text-amber-700 border-amber-200",
        accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
        declined: "bg-rose-50 text-rose-700 border-rose-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

