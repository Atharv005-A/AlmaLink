# AlmaLink — Project Folder Structure & Ownership Contract
**Institution:** MES Institute of Management & Career Courses (IMCC), Pune  
**Project:** AlmaLink (Alumni Management & Engagement Platform)  
**Tech Stack:** PERN + Supabase (PostgreSQL, Express.js + TS, React 18 + Vite + TS, Node.js)

---

## 📌 Ownership Legend & Coordination Rules
To allow both team members to develop simultaneously without Git merge conflicts or duplicate work:
- 👤 **[OUR SCOPE]**: Domain 1 — Modules 1, 2, 5, 8 (Auth, Alumni Profiles & Verification, Cell & Staff Management, Dashboards, Reports & Audit Logs).
- 👥 **[FRIEND'S SCOPE]**: Domain 2 — Modules 3, 4, 6, 7 (Activities & Events, Smart Invitations & WhatsApp/Email Dispatch, Participation Verification & Points Ledger, Leaderboard & Annual Awards).
- 🔄 **[SHARED / COMMON]**: Core foundational infrastructure, shared layout shells, base UI components, database schema, and shared TypeScript contracts.

---

## 🏗️ 1. Root-Level Architecture

```text
AlmaLink/
├── client/                     # React 18 + Vite + TypeScript (Frontend SPA)
├── server/                     # Express.js + TypeScript + Prisma (Backend API & Daemons)
├── shared/                     # 🔄 Shared TypeScript Enums, DTOs & Validation Schemas
├── .gitignore                  # Git ignore rules for node_modules, build artifacts, env files
├── CHECKLIST.md                # Master implementation checklist for all 35 Figma screens
├── DESIGN_SYSTEM.md            # Locked UI tokens, colors, typography & layout contracts
├── FOLDER_STRUCTURE.md         # This file: definitive repository map & ownership contract
├── PROJECT_DECISIONS.md        # Locked architectural & technical decisions
└── README.md                   # Platform documentation & quickstart instructions
```

---

## 🔄 2. Shared Types & Contracts (`/shared`)
> **Rule:** Both developers import directly from `/shared`. Never duplicate enums or models inside `client` or `server`.

```text
shared/
├── enums/
│   ├── roles.enum.ts                 # 🔄 SUPER_ADMIN, COLLEGE_ADMIN, CELL_COORDINATOR, ALUMNI
│   ├── verification-status.enum.ts   # 👤 PENDING, VERIFIED, REJECTED
│   ├── invitation-status.enum.ts     # 👥 DRAFT, SENT, ACCEPTED, DECLINED, EXPIRED
│   ├── activity-status.enum.ts       # 👥 DRAFT, PUBLISHED, ONGOING, COMPLETED
│   └── audit-action.enum.ts          # 👤 ALUMNI_VERIFIED, STAFF_INVITED, CELL_CREATED, etc.
│
├── types/
│   ├── user.types.ts                 # 👤 User session, JWT payload, staff coordinator profile
│   ├── alumni.types.ts               # 👤 Registration payload, completeness score, profile tags
│   ├── activity.types.ts             # 👥 Event model, category types, match score interface
│   ├── invitation.types.ts           # 👥 Invitation roster item, RSVP payload
│   ├── participation.types.ts        # 👥 Attendance record, evidence link, points ledger entry
│   ├── awards.types.ts               # 👥 Seasonal award nomination, coordinator vote
│   └── audit.types.ts                # 👤 Immutable audit log entry model
│
└── schemas/
    ├── auth.schema.ts                # 👤 Zod login, reset, & alumni registration (10-digit mobile)
    ├── profile.schema.ts             # 👤 Zod profile completion (skills, availability tags)
    ├── cell.schema.ts                # 👤 Zod cell creation & coordinator assignment
    └── activity.schema.ts            # 👥 Zod activity creation & invitation dispatch schema
```

---

## 💻 3. Frontend Architecture (`/client`)

### 3.1 Source Directory Tree (`/client/src`)

```text
client/
├── public/
│   ├── favicon.ico
│   ├── imcc-logo.svg
│   └── assets/                       # Static banners, institutional assets
│
├── src/
│   ├── api/                          # TanStack Query Hooks & API Endpoints
│   │   ├── client.ts                 # 🔄 Axios instance with JWT interceptor & error handling
│   │   ├── auth.api.ts               # 👤 Login, password reset, staff token onboarding
│   │   ├── alumni.api.ts             # 👤 Registration, verification queue, directory search
│   │   ├── cells.api.ts              # 👤 Cell CRUD & staff coordinator assignments
│   │   ├── activities.api.ts         # 👥 Event CRUD, lifecycle status changes
│   │   ├── invitations.api.ts        # 👥 Matchmaking query, bulk WhatsApp/Email dispatch
│   │   ├── participation.api.ts      # 👥 Attendance submission, points ledger queries
│   │   ├── leaderboard.api.ts        # 👥 Internal rankings, award nominations & voting
│   │   ├── reports.api.ts            # 👤 Institutional analytics & CSV export
│   │   └── audit.api.ts              # 👤 Read-only audit log queries
│   │
│   ├── components/
│   │   ├── ui/                       # 🔄 shadcn/ui Primitives (Accessible, unstyled base)
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx             # Strict operational status badges (VERIFIED, DRAFT, etc.)
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── sheet.tsx             # Mobile navigation drawer
│   │   │   ├── table.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx          # Shimmering skeleton loader
│   │   │   └── command.tsx           # Ctrl+K command palette primitive
│   │   │
│   │   ├── common/                   # 🔄 Shared Compound Widgets
│   │   │   ├── CommandPalette.tsx    # Ctrl+K institutional search (jump to alumni/event/cell)
│   │   │   ├── EmptyState.tsx        # Institutional empty state with reassuring copy
│   │   │   ├── ExportButton.tsx      # Real CSV/PDF export trigger with loading state
│   │   │   ├── MobileResponsiveTable.tsx # Dynamic table-to-card transformer (< 768px)
│   │   │   ├── PaginationBar.tsx     # Standardized table pagination
│   │   │   └── StatusPill.tsx        # Consistent dot status badge
│   │   │
│   │   ├── layout/                   # 🔄 Layout Shell Navigation Bars
│   │   │   ├── AdminSidebar.tsx      # Dark slate sidebar (#161D2C) with role indicator
│   │   │   ├── AdminHeader.tsx       # Header with breadcrumbs, active cell & notification bell
│   │   │   ├── AlumniNavbar.tsx      # Top nav bar with personal ID pill (AL-0108)
│   │   │   ├── AlumniBottomNav.tsx   # Mobile thumb-friendly bottom nav (< 768px)
│   │   │   └── NotificationDrawer.tsx# Grouped notification drawer (Today / Yesterday)
│   │   │
│   │   └── modules/                  # Specialized Domain Modules
│   │       ├── auth/                 # 👤 Split-screen hero, password strength meter
│   │       ├── verification/         # 👤 Verification review side-by-side modal
│   │       ├── directory/            # 👤 Multi-criteria filter drawer, tag chips
│   │       ├── cells/                # 👤 Coordinator assignment modal & quota counter
│   │       ├── matchmaking/          # 👥 Tag intersection recommendation badge (100% Match ⭐)
│   │       ├── dispatch/             # 👥 WhatsApp & Brevo dispatch progress tracker
│   │       ├── participation/        # 👥 Attendance toggle checklist & evidence uploader
│   │       └── awards/               # 👥 3-nominee nomination form & coordinator ballot
│   │
│   ├── layouts/                      # 🔄 Page Layout Shells
│   │   ├── AdminLayout.tsx           # Shell A: College Admin & Cell Coordinator Workspace
│   │   ├── AlumniLayout.tsx          # Shell B: Alumni Portal (Warm, privacy-guaranteed)
│   │   └── AuthLayout.tsx            # Shell C: Public Split-screen authentication layout
│   │
│   ├── pages/                        # 35 Figma-Mapped Screens
│   │   ├── auth/                     # 👤 Public & Auth Pages
│   │   │   ├── LoginPage.tsx                 # Figma: 3314:45055
│   │   │   ├── ForgotPasswordPage.tsx        # Figma: 3314:45087
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   ├── AlumniRegisterPage.tsx        # Figma: 3314:45114 (10-digit mobile, consent)
│   │   │   ├── RegistrationPendingPage.tsx   # Figma: 3314:45166 (2-step verification notice)
│   │   │   └── StaffOnboardingPage.tsx       # Figma: 3314:45273 (Invite token password setup)
│   │   │
│   │   ├── admin/                    # 👤 Admin Workspace (Domain 1)
│   │   │   ├── AdminDashboardPage.tsx        # Figma: 3314:45305 (Metrics, cell bar charts)
│   │   │   ├── VerificationQueuePage.tsx     # Figma: 3314:45444 (Pending approval queue)
│   │   │   ├── VerificationReviewPage.tsx    # Figma: 3314:45528 (Side-by-side comparison modal)
│   │   │   ├── StaffAlumniDirectoryPage.tsx  # Figma: 3314:45619 (Full searchable directory)
│   │   │   ├── AlumnusProfileViewPage.tsx    # Figma: 3314:45697 (AL-0108 profile & ledger)
│   │   │   ├── StaffAndCellsPage.tsx         # Figma: 3314:46982 / 46836 (Cells & staff)
│   │   │   ├── EngagementReportsPage.tsx     # Figma: 3314:47100 (Analytics & CSV export)
│   │   │   ├── AuditLogsPage.tsx             # Figma: 3314:47288 (Immutable audit trail)
│   │   │   └── AdminNotificationsPage.tsx    # Figma: 3314:47228
│   │   │
│   │   ├── coordinator/              # 👥 Coordinator Workspace (Domain 2 & Shared Cell Scope)
│   │   │   ├── CoordinatorDashboardPage.tsx  # Figma: 3314:46128 (Cell-scoped metrics)
│   │   │   ├── ActivitiesListPage.tsx        # Figma: 3314:45796
│   │   │   ├── CreateActivityPage.tsx        # Figma: 3314:45877 (Category, tags, points)
│   │   │   ├── FindAndInvitePage.tsx         # Figma: 3314:45957 (Smart Tag Matchmaking)
│   │   │   ├── InvitationTrackingPage.tsx    # Figma: 3314:46042 (Roster & WhatsApp dispatch)
│   │   │   ├── AttendanceVerificationPage.tsx# Figma: 3314:46261 (Participation & evidence)
│   │   │   └── CoordinatorNominationPage.tsx # 3-nominee seasonal award submission
│   │   │
│   │   ├── alumni/                   # 👤 Alumni Portal
│   │   │   ├── AlumniHomePage.tsx            # Figma: 3314:47367 (Engagement stats & timeline)
│   │   │   ├── ProfileCompletionPage.tsx     # Figma: 3314:45198 (Skills, availability, tags)
│   │   │   ├── InvitationsHubPage.tsx        # 👥 Figma: 3314:47466 (RSVP accept/decline)
│   │   │   └── AlumniNotificationsPage.tsx   # Figma: 3314:47544
│   │   │
│   │   └── common/                   # 🔄 Shared / Auxiliary Pages
│   │       ├── PrivateLeaderboardPage.tsx    # 👥 Figma: 3314:46444 (Admin-only rankings)
│   │       ├── NotFoundPage.tsx
│   │       └── UnauthorizedPage.tsx
│   │
│   ├── routes/
│   │   ├── AppRoutes.tsx             # 🔄 Master route definitions with React Router v6
│   │   └── ProtectedRoute.tsx        # 🔄 RBAC route guard
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                # 🔄 Auth context hook (user, role, permissions)
│   │   ├── useDebounce.ts            # 🔄 Search debouncing
│   │   ├── useMediaQuery.ts          # 🔄 Viewport detection for table-to-card switch
│   │   └── useKeyboardShortcut.ts    # 🔄 Ctrl+K shortcut listener
│   │
│   ├── context/
│   │   ├── AuthContext.tsx           # 🔄 User session & token state
│   │   └── NotificationContext.tsx   # 🔄 Global unread counter
│   │
│   ├── lib/
│   │   ├── date.ts                   # 🔄 Centralized UTC to IST formatters
│   │   ├── utils.ts                  # 🔄 Tailwind cn() helper (clsx + tailwind-merge)
│   │   └── validators.ts             # 🔄 Zod client validators
│   │
│   ├── styles/
│   │   └── globals.css               # 🔄 Tailwind directives & Work Sans font imports
│   │
│   ├── index.html
│   ├── tailwind.config.ts            # 🔄 Design tokens locked from DESIGN_SYSTEM.md
│   ├── vite.config.ts                # 🔄 Path aliases (@/* -> src/*)
│   ├── tsconfig.json
│   └── package.json
```

---

## ⚙️ 4. Backend Architecture (`/server`)

### 4.1 Source Directory Tree (`/server/src`)

```text
server/
├── prisma/
│   ├── schema.prisma                 # 🔄 Supabase PostgreSQL schema with dual URLs
│   ├── migrations/                   # 🔄 Managed Prisma migration history
│   └── seed.ts                       # 🔄 Authentic Pune seed data (IMCC, Persistent, Barclays)
│
├── src/
│   ├── config/
│   │   ├── env.ts                    # 🔄 Zod-validated environment config
│   │   ├── prisma.ts                 # 🔄 PrismaClient singleton instance
│   │   ├── supabase.ts               # 🔄 Supabase Storage client (evidence & PDFs)
│   │   └── brevo.ts                  # 👤 Brevo email client configuration
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts        # 👤 Login, register, password reset, staff token onboarding
│   │   ├── verification.controller.ts# 👤 Approval queue, atomic $transaction, rejection
│   │   ├── alumni.controller.ts      # 👤 Profile update, multi-criteria directory search
│   │   ├── cells.controller.ts       # 👤 Cell CRUD, coordinator reassignment/handover
│   │   ├── activities.controller.ts  # 👥 Activity lifecycle (Draft -> Published -> Completed)
│   │   ├── invitations.controller.ts # 👥 Tag matchmaking calculation, bulk dispatch, RSVP
│   │   ├── participation.controller.ts# 👥 Attendance submission, points ledger calculation
│   │   ├── awards.controller.ts      # 👥 Cell nominations (max 3), staff voting round
│   │   ├── reports.controller.ts     # 👤 Institutional analytics & CSV streaming
│   │   └── audit.controller.ts       # 👤 Read-only audit log queries
│   │
│   ├── middleware/
│   │   ├── auth.middleware.ts        # 🔄 JWT extraction & signature verification
│   │   ├── rbac.middleware.ts        # 🔄 Role check (requireRole, requireCellAccess)
│   │   ├── validate.middleware.ts    # 🔄 Zod request schema validation
│   │   ├── audit.middleware.ts       # 👤 Automatic logging of mutating staff actions
│   │   └── error.middleware.ts       # 🔄 Global error handler with clean JSON output
│   │
│   ├── routes/
│   │   ├── index.ts                  # 🔄 Master route aggregator mounted at /api
│   │   ├── auth.routes.ts            # 👤 /api/auth/*
│   │   ├── verification.routes.ts    # 👤 /api/verification/*
│   │   ├── alumni.routes.ts          # 👤 /api/alumni/*
│   │   ├── cells.routes.ts           # 👤 /api/cells/*
│   │   ├── activities.routes.ts      # 👥 /api/activities/*
│   │   ├── invitations.routes.ts     # 👥 /api/invitations/*
│   │   ├── participation.routes.ts   # 👥 /api/participation/*
│   │   ├── awards.routes.ts          # 👥 /api/awards/*
│   │   ├── reports.routes.ts         # 👤 /api/reports/*
│   │   └── audit.routes.ts           # 👤 /api/audit/*
│   │
│   ├── services/
│   │   ├── auth.service.ts           # 👤 Password hashing (argon2/bcrypt), JWT minting
│   │   ├── email.service.ts          # 👤 Brevo email templates (Welcome, Invite, Reset)
│   │   ├── whatsapp.service.ts       # 👥 whatsapp-web.js headless Chromium daemon
│   │   ├── matchmaking.service.ts    # 👥 Tag intersection engine (|Event ∩ Alumni| / |Event|)
│   │   ├── points.service.ts         # 👥 Immutable contribution scoring engine
│   │   ├── storage.service.ts        # 🔄 Supabase Storage bucket upload/download handler
│   │   ├── export.service.ts         # 👤 Streaming CSV generator with institutional headers
│   │   └── audit.service.ts          # 👤 Atomic audit logger with actor IP & IST timestamp
│   │
│   ├── types/
│   │   ├── express.d.ts              # 🔄 Request augmentation (adds req.user)
│   │   └── index.ts
│   │
│   ├── utils/
│   │   ├── logger.ts                 # 🔄 Timestamped console logger
│   │   └── date.ts                   # 🔄 Date calculations & IST conversion
│   │
│   ├── index.ts                      # 🔄 Express app initialization & server listener
│   ├── tsconfig.json
│   └── package.json
```

---

## 🤝 5. Parallel Development & Conflict Prevention Protocol

1. **Prisma Schema (`server/prisma/schema.prisma`):**
   - Both developers share the schema file.
   - When adding fields or models, communicate model names in advance.
   - Domain 1 Models: `User`, `StaffProfile`, `AlumniProfile`, `Cell`, `CellCoordinator`, `AuditLog`.
   - Domain 2 Models: `Activity`, `Invitation`, `Participation`, `AwardNomination`, `AwardVote`.

2. **Route Aggregators (`client/src/routes/AppRoutes.tsx` & `server/src/routes/index.ts`):**
   - Each developer adds their route sub-router (e.g. `router.use('/verification', verificationRoutes)` vs `router.use('/activities', activitiesRoutes)`).
   - Keeps individual controller and route files isolated without merge friction.

3. **Shared Contracts (`/shared`):**
   - Any new enum, DTO, or Zod validation schema is committed to `/shared` first so both backend and frontend can import from the identical contract.

4. **Environment Variables:**
   - Both developers maintain identical variable names in `.env.example`.
