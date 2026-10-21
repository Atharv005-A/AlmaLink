# AlmaLink — UI/UX Design System & Implementation Contract
**Institution:** MES Institute of Management & Career Courses (IMCC), Pune  
**Project:** AlmaLink (Alumni Management & Engagement Platform)  
**Primary Figma Reference:** `PRITHVIRAJ PATIL's team library` (Figma Key: `n2h39yn6wb77gutZ1euX0x`)  
**Purpose:** Living single-source-of-truth design specification ensuring 100% visual and interactive parity between **Domain 1 (Our Scope)** and **Domain 2 (Friend's Scope)**.

---

## 📋 Table of Contents
1. [Core Design Philosophy & Institutional Rules](#1-core-design-philosophy--institutional-rules)
2. [Design Tokens & Color Palette](#2-design-tokens--color-palette)
3. [Typography Scale & Rules](#3-typography-scale--rules)
4. [Layout Shells & Structural Architecture](#4-layout-shells--structural-architecture)
5. [Mobile Responsiveness Rules & Breakpoints](#5-mobile-responsiveness-rules--breakpoints)
6. [Component Blueprints & Code Recipes](#6-component-blueprints--code-recipes)
7. [Figma Screen-to-Route Mapping (All 35 Screens)](#7-figma-screen-to-route-mapping-all-35-screens)
8. [Copy-Paste Configuration Files](#8-copy-paste-configuration-files)

---

## 1. Core Design Philosophy & Institutional Rules

To guarantee that AlmaLink feels like a prestigious, production-grade university platform during academic evaluation, viva demonstrations, and production deployment:

### 1.1 Anti-"Vibecoding" Standards
- **No Toy Pills for Plain Metadata:** Do not wrap neutral information (like graduation years, names, or emails) in bright pastel badge bubbles. Plain metadata must use crisp typography (e.g., `MCA • Class of 2023`).
- **Status Badges Are Strictly Operational:** Pill badges are reserved exclusively for operational states (`VERIFIED`, `PENDING REVIEW`, `REJECTED`, `DRAFT`, `ACCEPTED`, `DECLINED`).
- **High Information Density for Staff:** Admin and Coordinator workspaces must be compact and efficient (tabular data, sticky table headers, quick-action menus), avoiding excessive whitespace or empty oversized cards.
- **Warm & Welcoming for Alumni:** The Alumni Portal is spacious, warm, and focused on gratitude, engagement, and giving back to IMCC.
- **Authentic Pune & MES Context:**
  - *Companies:* Persistent Systems, Infosys Hinjewadi, Barclays Pune, TCS Sahyadri Park, Veritas, Cognizant, Bajaj Finserv.
  - *Batches:* 2016 – 2024 (MES IMCC MCA/MBA alumni).
  - *Indian Phone Validation:* 10 digits starting with `[6-9]` (`^[6-9]\d{9}$`).

---

## 2. Design Tokens & Color Palette

All UI components across both domains must use these exact hex values and token names.

### 2.1 Brand & Neutral Palette

| Token Name | Hex Code | Tailwind Class / CSS Variable | Description & Usage |
| :--- | :--- | :--- | :--- |
| **Brand Iris (Primary)** | `#5D5FEF` | `bg-brand-iris`, `text-brand-iris` | Primary buttons, active tab indicators, links, focus rings |
| **Brand Iris Hover** | `#4B4DDF` | `hover:bg-brand-iris-hover` | Hover state for primary buttons |
| **Brand Iris Subtle** | `#EEEEFF` | `bg-brand-iris-light` | Light badge backgrounds, selected row highlights |
| **Sidebar Navy Dark** | `#161D2C` | `bg-sidebar-dark` | Staff/Admin sidebar background |
| **Sidebar Navy Hover** | `#202435` | `bg-sidebar-hover` | Sidebar navigation item hover state |
| **Sidebar Navy Active** | `#2A324B` | `bg-sidebar-active` | Active sidebar item background |
| **Canvas Background** | `#F8FAFC` | `bg-slate-50` | Global app page background |
| **Card Surface** | `#FFFFFF` | `bg-white` | Elevated card surfaces, modals, popovers |
| **Card Border** | `#E2E8F0` | `border-slate-200` | Subtle hairline borders on cards, inputs, and tables |
| **Text Primary** | `#0F172A` | `text-slate-900` | Headings, titles, high-emphasis text |
| **Text Secondary** | `#475569` | `text-slate-600` | Body copy, table cells, form labels |
| **Text Muted** | `#70788A` | `text-muted-foreground` | Timestamps, metadata, helper text, input placeholders |

### 2.2 Locked Operational Status Badges

Do not invent custom colors for statuses. Always use this exact matrix:

```tsx
// Status badge color mapping matrix
export const STATUS_STYLES = {
  // Verification States (Domain 1)
  VERIFIED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",

  // Activity & Invitation States (Domain 2)
  DRAFT: "bg-slate-100 text-slate-700 border-slate-200",
  PUBLISHED: "bg-blue-50 text-blue-700 border-blue-200",
  ONGOING: "bg-purple-50 text-purple-700 border-purple-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  SENT: "bg-amber-50 text-amber-700 border-amber-200",
  ACCEPTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  DECLINED: "bg-rose-50 text-rose-700 border-rose-200",
  EXPIRED: "bg-slate-100 text-slate-500 border-slate-200",

  // System States
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ARCHIVED: "bg-slate-100 text-slate-500 border-slate-200",
} as const;
```

---

## 3. Typography Scale & Rules

- **Primary Font Family:** `Work Sans`, sans-serif (Google Font).
- **Fallback Stack:** `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`.

### 3.1 Typographic Scale

| Role | Tailwind Classes | Desktop Size / Weight | Usage |
| :--- | :--- | :--- | :--- |
| **Display / Page Title** | `text-2xl sm:text-3xl font-bold tracking-tight text-slate-900` | 24px / 30px, Bold (700) | Top-level dashboard headers |
| **Section Heading (H2)**| `text-lg sm:text-xl font-semibold text-slate-900` | 18px / 20px, Semibold (600) | Card group headers, modal titles |
| **Subheading (H3)** | `text-base font-semibold text-slate-900` | 16px, Semibold (600) | Table title, sub-card title |
| **Body (Default)** | `text-sm font-normal text-slate-700 leading-relaxed` | 14px, Regular (400) | General body copy, form labels |
| **Table Cell / Compact**| `text-sm font-medium text-slate-800` | 14px, Medium (500) | Table row content |
| **Small / Helper Text** | `text-xs font-normal text-slate-500` | 12px, Regular (400) | Sub-captions, field hints |
| **Badge / Status Text** | `text-xs font-semibold tracking-wide uppercase` | 11px–12px, Semibold (600) | Pills, tags, status pills |
| **Numeric Metrics** | `text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight` | 32px / 36px, Bold (700) | Stat counters on dashboard cards |

---

## 4. Layout Shells & Structural Architecture

Both developers must mount their pages within one of the three established layout shells.

### 4.1 Shell A: Admin & Staff Workspace (`/admin/*`, `/coordinator/*`)
- **Left Dark Sidebar:** Fixed `w-64` on desktop (`bg-[#161D2C]`).
  - Top: IMCC AlmaLink logo and subtitle: `"INTERNAL ONLY • College staff"`.
  - Middle: Navigation items with icons (`lucide-react`), badge counts for queues.
  - Bottom: Current staff profile avatar, name, assigned cell badge, and Logout CTA.
- **Top Header Bar:** `h-16 border-b border-slate-200 bg-white sticky top-0 z-30 flex items-center justify-between px-6`.
  - Left: Mobile hamburger drawer trigger + Breadcrumb hierarchy.
  - Right: Quick Search (`Ctrl + K`), Notification Bell with unread counter, Help email link.
- **Main Content Area:** `min-h-[calc(100vh-4rem)] bg-slate-50/60 p-4 sm:p-6 lg:p-8`.

### 4.2 Shell B: Alumni Portal Workspace (`/alumni/*`)
- **Top Horizontal Navbar:** `h-16 border-b border-slate-200 bg-white sticky top-0 z-40`.
  - Left: IMCC AlmaLink logo with `"Alumni Portal"` tag.
  - Center: Nav links (`Home`, `Invitations`, `My Profile`).
  - Right:
    - Privacy guarantee pill: `"🔒 Private & Confidential Profile"`.
    - Notification bell.
    - Identity pill: `AD • MCA '18`.
- **Main Container:** Centered `max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8`.
- **Mobile Thumb Bar:** Fixed bottom bar for smartphones (`< 768px`) with touch targets for Home, Invites, Profile, and Alerts.

### 4.3 Shell C: Public & Auth Pages (`/login`, `/register`, `/forgot-password`)
- **Split-Screen Layout (Desktop `lg:`):**
  - Left Column (50%): Deep Navy/Iris branded illustration and testimonial banner with MES IMCC building photo, motto, and accreditation badges.
  - Right Column (50%): Clean, focused authentication card with instant inline validation and institutional footer (`alumni@imcc.mespune.in`).
- **Mobile Stack:** Single-column clean card with compact college crest at top.

---

## 5. Mobile Responsiveness Rules & Breakpoints

Mobile responsiveness is a strict, non-negotiable requirement across every screen:

| Breakpoint | Width | Expected Behavior |
| :--- | :--- | :--- |
| **Mobile (`< 640px`)** | `default` | 1-column layouts, sticky bottom CTAs, bottom navigation, minimum 44px (`h-11`) touch targets |
| **Tablet (`640px – 1023px`)** | `sm:`, `md:` | 2-column metric grids, collapsible sidebar drawer, condensed tables |
| **Desktop (`≥ 1024px`)** | `lg:`, `xl:` | Full 64-column fixed sidebar, 4-column metric grids, full tabular views |

### 5.1 Responsive Table-to-Card Rule
Data tables (Alumni Queue, Directory, Invitations, Audit Log) **must not horizontally scroll awkwardly on mobile**.
- On `md:` (`≥ 768px`): Render the standard `<table>`.
- On `< md:` (`< 768px`): Render a stacked `<div className="space-y-3 md:hidden">` card list displaying name, primary badge, key date, and tap-to-review action.

---

## 6. Component Blueprints & Code Recipes

Both developers should use these exact component structures:

### 6.1 Status Badge Component (`components/ui/status-badge.tsx`)
```tsx
import React from "react";
import { cn } from "@/lib/utils";

export type StatusType =
  | "VERIFIED" | "PENDING_REVIEW" | "REJECTED"
  | "DRAFT" | "PUBLISHED" | "ONGOING" | "COMPLETED"
  | "SENT" | "ACCEPTED" | "DECLINED" | "EXPIRED"
  | "ACTIVE" | "ARCHIVED";

const STATUS_CONFIG: Record<StatusType, { label: string; className: string }> = {
  VERIFIED: { label: "Verified", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  PENDING_REVIEW: { label: "Pending Review", className: "bg-amber-50 text-amber-700 border-amber-200" },
  REJECTED: { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200" },
  DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-700 border-slate-200" },
  PUBLISHED: { label: "Published", className: "bg-blue-50 text-blue-700 border-blue-200" },
  ONGOING: { label: "Ongoing", className: "bg-purple-50 text-purple-700 border-purple-200" },
  COMPLETED: { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  SENT: { label: "Invitation Sent", className: "bg-amber-50 text-amber-700 border-amber-200" },
  ACCEPTED: { label: "Accepted", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  DECLINED: { label: "Declined", className: "bg-rose-50 text-rose-700 border-rose-200" },
  EXPIRED: { label: "Expired", className: "bg-slate-100 text-slate-500 border-slate-200" },
  ACTIVE: { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  ARCHIVED: { label: "Archived", className: "bg-slate-100 text-slate-500 border-slate-200" },
};

export function StatusBadge({ status, className }: { status: StatusType; className?: string }) {
  const config = STATUS_CONFIG[status] || { label: status, className: "bg-slate-100 text-slate-700 border-slate-200" };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border tracking-wide",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
```

### 6.2 Metric Stat Card Component
```tsx
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: ReactNode;
  trend?: { value: string; isPositive: boolean };
}

export function StatCard({ title, value, subtext, icon, trend }: StatCardProps) {
  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <div className="p-2.5 bg-brand-iris-light rounded-lg text-brand-iris">
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
        {(subtext || trend) && (
          <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
            {trend && (
              <span className={cn("font-medium", trend.isPositive ? "text-emerald-600" : "text-rose-600")}>
                {trend.value}
              </span>
            )}
            <span>{subtext}</span>
          </p>
        )}
      </div>
    </div>
  );
}
```

### 6.3 Empty State Blueprint
```tsx
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-xl border border-dashed border-slate-300">
      <div className="p-3 bg-slate-50 rounded-full text-slate-400 mb-3 border border-slate-200">
        {icon}
      </div>
      <h4 className="text-base font-semibold text-slate-900">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mt-1">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="mt-4 bg-brand-iris hover:bg-brand-iris-hover text-white">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
```

### 6.4 Button Variants & Standards
- **Primary Action:** `bg-[#5D5FEF] hover:bg-[#4B4DDF] text-white font-medium h-10 px-4 rounded-lg shadow-sm transition-colors`
- **Secondary / Cancel Action:** `bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium h-10 px-4 rounded-lg transition-colors`
- **Destructive Action:** `bg-rose-600 hover:bg-rose-700 text-white font-medium h-10 px-4 rounded-lg shadow-sm transition-colors`
- **Ghost Action:** `hover:bg-slate-100 text-slate-600 hover:text-slate-900 h-9 px-3 rounded-md transition-colors`

---

## 7. Figma Screen-to-Route Mapping (All 35 Screens)

| # | Figma Frame ID | Screen / Feature Name | App Route | Owner | Shell Layout |
| :- | :--- | :--- | :--- | :- | :--- |
| **1** | `3314:45055` | Staff & Alumni Login | `/login` | 👤 Domain 1 | Split Auth Shell |
| **2** | `3314:45087` | Forgot & Reset Password | `/forgot-password`, `/reset-password` | 👤 Domain 1 | Split Auth Shell |
| **3** | `3314:45114` | Alumni Public Registration | `/register` | 👤 Domain 1 | Auth / Multi-step Form |
| **4** | `3314:45166` | Registration Pending Notice | `/alumni/pending` | 👤 Domain 1 | Public Card View |
| **5** | `3314:45198` | Alumni Profile Completion | `/alumni/profile` | 👤 Domain 1 | Alumni Shell B |
| **6** | `3314:45273` | Staff Onboarding Invitation | `/onboarding/staff` | 👤 Domain 1 | Clean Form Shell |
| **7** | `3314:45305` | Admin Master Dashboard | `/admin/dashboard` | 👤 Domain 1 | Admin Shell A |
| **8** | `3314:45444` | Admin Verification Queue | `/admin/verifications` | 👤 Domain 1 | Admin Shell A |
| **9** | `3314:45528` | Profile Verification Review Modal | `/admin/verifications/:id` | 👤 Domain 1 | Slide-over / Modal |
| **10** | `3314:45619` | Staff Alumni Directory | `/admin/alumni`, `/coordinator/alumni` | 👤 Domain 1 | Admin Shell A |
| **11** | `3314:45697` | View Single Alumnus Profile | `/admin/alumni/:id` | 👤 Domain 1 | Admin Shell A |
| **12** | `3314:45796` | Coordinator Activities List | `/coordinator/activities` | 👥 Domain 2 | Admin Shell A |
| **13** | `3314:45877` | Create / Edit Activity Modal | `/coordinator/activities/create` | 👥 Domain 2 | Modal / Drawer |
| **14** | `3314:45957` | Find & Match Alumni for Event | `/coordinator/activities/:id/match` | 👥 Domain 2 | Admin Shell A |
| **15** | `3314:46042` | Invitation Tracking & Roster | `/coordinator/activities/:id/invites` | 👥 Domain 2 | Admin Shell A |
| **16** | `3314:46128` | Coordinator Cell Dashboard | `/coordinator/dashboard` | 👤 Domain 1 | Admin Shell A |
| **17** | `3314:46261` | Post-Event Attendance Verification | `/coordinator/activities/:id/attendance` | 👥 Domain 2 | Admin Shell A |
| **18** | `3314:46444` | Private Internal Leaderboard | `/admin/leaderboard` | 👥 Domain 2 | Admin Shell A |
| **19** | `3314:46554` | Award Nominations Shortlist | `/admin/awards/shortlist` | 👥 Domain 2 | Admin Shell A |
| **20** | `3314:46645` | Staff Award Voting & Confirmation | `/admin/awards/vote` | 👥 Domain 2 | Admin Shell A |
| **21** | `3314:46718` | PDF Award Certificate Preview | `/admin/awards/certificates/:id` | 👥 Domain 2 | Modal / PDF Viewer |
| **22** | `3314:46772` | Configurable Scoring Settings | `/admin/settings/scoring` | 👥 Domain 2 | Admin Shell A |
| **23** | `3314:46836` | Staff Directory & Roles | `/admin/staff` | 👤 Domain 1 | Admin Shell A |
| **24** | `3314:46917` | Add Staff Coordinator Modal | `/admin/staff/new` | 👤 Domain 1 | Modal Dialog |
| **25** | `3314:46982` | College Cells Management | `/admin/cells` | 👤 Domain 1 | Admin Shell A |
| **26** | `3314:47045` | Create Cell Modal | `/admin/cells/new` | 👤 Domain 1 | Modal Dialog |
| **27** | `3314:47100` | College Engagement Reports | `/admin/reports` | 👤 Domain 1 | Admin Shell A |
| **28** | `3314:47228` | Admin In-App Notifications Feed | `/admin/notifications` | 👤 Domain 1 | Admin Shell A |
| **29** | `3314:47288` | Read-Only Audit Log | `/admin/audit-logs` | 👤 Domain 1 | Admin Shell A |
| **30** | `3314:47367` | Alumni Portal Home & History | `/alumni/home` | 👤 Domain 1 | Alumni Shell B |
| **31** | `3314:47466` | Alumni Invitations & RSVP Hub | `/alumni/invitations` | 👥 Domain 2 | Alumni Shell B |
| **32** | `3314:47544` | Alumni In-App Notifications | `/alumni/notifications` | 👤 Domain 1 | Alumni Shell B |
| **33** | `3314:47591` | Dedicated Mobile: Admin Dashboard | `/admin/dashboard` | 👤 Domain 1 | Mobile Drawer Shell |
| **34** | `3314:47762` | Dedicated Mobile: Verification Queue | `/admin/verifications` | 👤 Domain 1 | Card List View |
| **35** | `3314:47924` | Dedicated Mobile: Alumni Home | `/alumni/home` | 👤 Domain 1 | Mobile Bottom Nav Shell |

---

## 8. Copy-Paste Configuration Files

### 8.1 Tailwind Theme Extension (`tailwind.config.ts`)

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Locked AlmaLink Brand Colors
        brand: {
          iris: "#5D5FEF",
          "iris-hover": "#4B4DDF",
          "iris-light": "#EEEEFF",
          "iris-subtle": "#F4F4FF",
        },
        sidebar: {
          dark: "#161D2C",
          hover: "#202435",
          active: "#2A324B",
          text: "#A3ADC2",
          "text-active": "#FFFFFF",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#5D5FEF",
          foreground: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: ["Work Sans", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        lg: "0.625rem", // 10px
        md: "0.5rem",   // 8px
        sm: "0.375rem", // 6px
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### 8.2 Google Fonts Import (`globals.css`)
```css
@import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@300;400;500;600;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 40% 98%;
    --foreground: 222 47% 11%;
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 239 84% 65%;
  }

  body {
    @apply bg-background text-foreground font-sans antialiased;
  }
}
```

---

## 9. Developer Handshake Checklist

Before any pull request or merge between Domain 1 and Domain 2:
- [ ] Uses `Work Sans` font and standard typography hierarchy.
- [ ] Primary buttons use `brand.iris` (`#5D5FEF`).
- [ ] All status badges use the standard `<StatusBadge status="..." />` component.
- [ ] No hardcoded custom status colors or arbitrary border radiuses.
- [ ] Verified on mobile viewport (375px width) — tables collapse cleanly to card lists.
- [ ] Data tables include sticky header, proper pagination, and empty state fallback.
- [ ] Realistic Pune / MES IMCC contextual data is used for testing and previews.
