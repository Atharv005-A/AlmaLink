# AlmaLink — Project Architectural & Technical Decisions
**Institution:** MES Institute of Management & Career Courses (IMCC), Pune  
**Project:** AlmaLink (Alumni Management & Engagement Platform)

---

## 1. Team Division & Module Ownership

The 8 functional modules are divided into two 4-module domains:

### 👤 Domain 1: Foundational Administration & Governance (Our Scope)
- **Module 1: User Authentication & Role Management**
  - Roles: `SUPER_ADMIN`, `COLLEGE_ADMIN`, `CELL_COORDINATOR`, `ALUMNI`.
  - Secure JWT authentication with role-based access control (RBAC).
  - Staff invitation & password setup workflow.
- **Module 2: Alumni Registration & Profile Management**
  - Public alumni registration with 10-digit mobile, graduation year, enrollment number, and consent.
  - Multi-state verification workflow (`PENDING`, `VERIFIED`, `REJECTED`).
  - Post-verification profile completion (organization, designation, skills, availability, preferred activities).
  - Centralized, searchable, and filterable staff alumni directory.
- **Module 5: College Cell and Department Management**
  - Cell creation & configuration (Placement, Technical, Cultural, Sports, Entrepreneurship, etc.).
  - Assignment of staff coordinators to specific cells.
- **Module 8: Dashboard, Reports, Notifications & Audit Logs**
  - Administrative overview dashboard (verified counts, pending verification queues, cell stats).
  - Comprehensive, immutable read-only audit logs for all administrative actions.
  - In-app and channel notifications.
  - Exportable engagement reports.

### 👥 Domain 2: Event Execution, Engagement & Recognition (Friend's Scope)
- **Module 3: Activity & Event Management** (Lectures, hackathons, workshops, placement drives, sports judging).
- **Module 4: Alumni Invitations & Engagement** (Smart filtering, dispatching invites, tracking RSVP states: Draft, Sent, Accepted, Declined, Expired).
- **Module 6: Participation Verification & Alumni Contribution Scoring** (Attendance confirmation, role verification, contribution points engine).
- **Module 7: Internal Alumni Leaderboard & Recognition** (Private, college-only category-wise and overall rankings, Annual Award nominations & voting).

### 🔒 Role Permissions & Scoping Boundaries (Locked & Finalized)
1. **Cell & Coordinator Relationship (Many-to-One):**
   - **Multiple coordinators per cell:** A single cell (e.g., Placement Cell or Technical Cell) can have **multiple faculty coordinators** assigned to it.
   - **One cell per coordinator:** Each coordinator belongs strictly to **one cell at a time**.
   - **Shared Cell Workspace:** All coordinators assigned to the same cell share the same activities, invitations, and participation records for that cell.
   - **Shared Award Nomination Quota:** Each cell has a total quota of **up to 3 nominations** for the Alumni of the Year awards (shared collaboratively among that cell's coordinators).
2. **Leaderboard Access:** The Private Leaderboard is **strictly restricted to College Administrators and Super Administrators**. Cell Coordinators cannot access the leaderboard or rankings.
3. **Alumni Pool Visibility:** When searching and inviting alumni, Cell Coordinators can access and search the **entire verified alumni pool** across the college using multi-criteria filters (skills, industry, batch, availability) and search bar.
4. **Alumni Privacy:** Complete privacy protection. Alumni profiles, contact information, and contribution scores are **strictly hidden from other alumni**. An alumnus can only see their own profile, received invitations, and personal contribution ledger.

### 🏷️ Intelligent Tag-Based Matchmaking & Recommendation Engine (Locked & Finalized)
- **Concept:** Replaces manual spreadsheet searching with an automated skill/interest tag intersection engine for activity invitations.
- **Data Capture (Module 2 - Our Scope):**
  - Alumni profile completion captures structured, searchable tags:
    - `skills`: Technical / domain skills (e.g., `["React", "Python", "Cloud Architecture", "Finance"]`).
    - `expertise`: Specialized fields (e.g., `["System Design", "HR & Hiring", "Cybersecurity"]`).
    - `preferredActivities`: Interests (e.g., `["Hackathon Judging", "Guest Lectures", "Mock Interviews", "Mentoring"]`).
- **Event Tagging (Module 3 - Friend's Scope):**
  - Coordinators attach domain and activity tags when creating an event (e.g., `["Python", "Machine Learning", "Hackathon Judging"]`).
- **Recommendation & Scoring (Module 4 - Friend's Scope):**
  - On the "Find and Invite Alumni" screen (`Figma: 3314:45957`), the system matches event tags against the alumni database:
    $$\text{Match \%} = \frac{|\text{Event Tags} \cap \text{Alumni Tags}|}{|\text{Event Tags}|} \times 100$$
  - Displays ranked recommendations with visual match badges (`100% Match ⭐`, `75% Match`) and a 1-click *"Invite All Recommended"* button.


---

## 2. Notification & Communication Services

### 📧 Transactional Email Service
- **Provider:** **Brevo (formerly Sendinblue)**
- **Plan:** Free Tier (300 emails/day forever).
- **Use Cases:**
  - Alumni registration confirmation & verification status updates.
  - Staff invitation emails with secure onboarding links.
  - Activity invitation alerts and RSVP notifications.
  - Password reset emails.

### 💬 WhatsApp Automation
- **Engine:** **Option C (`whatsapp-web.js`)** — Locked & Finalized.
- **Architecture:**
  - Automated headless / WhatsApp Web bridge integrated into backend.
  - **Single QR Code Pairing:** Coordinator scans QR code once to link college WhatsApp account.
  - **One-Click Bulk Dispatch:** Coordinator selects multiple alumni and clicks "Dispatch" once; backend automatically iterates and delivers personalized WhatsApp messages with smart throttling (1–2s delay).
  - **Zero per-message fees:** No API bills or Facebook Business verification hurdles; ideal for institutional evaluation and live viva demonstration.

---

## 3. UI/UX & Design System Alignment

- **Design Reference:** Figma File — *PRITHVIRAJ PATIL's team library* (File key: `n2h39yn6wb77gutZ1euX0x`).
- **Styling & Components Framework:** **Tailwind CSS v3 (v3.4)** + **shadcn/ui** (with `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`, and `tailwindcss-animate`).
- **Mobile Responsiveness (Strict & Comprehensive Requirement):**
  - **Figma mobile screens are treated as starting references, not the complete set.** We will actively engineer custom, mobile-first responsive UX for **every single screen**, including all admin and coordinator workspaces that were only mocked on desktop.
  - **Mobile UI Architecture:**
    - **Navigation:** Header with hamburger toggle opening a modern slide-over drawer (`Sheet` component) for Admin and Coordinator workspaces; bottom navigation / thumb-friendly bar for Alumni.
    - **Data Tables (Verification Queue, Directory, Audit Logs):** Automatically transform on mobile into responsive, tappable card lists with key badges, search, and swipeable actions (no broken table layouts).
    - **Dashboard Metrics:** Stackable responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) with high-contrast metric pills.
    - **Modals & Forms:** Convert into mobile-friendly bottom sheets / full-screen views with sticky bottom action buttons and minimum 44px touch targets.

- **Typography:** `Work Sans`, sans-serif.
- **Brand Colors:**
  - **Brand Iris Accent:** `#5D5FEF`
  - **Dark Slate / Navy (Sidebar & Text):** `#161D2C`, `#202435`
  - **Card Surfaces:** `#FFFFFF`
  - **Soft Badges & Backgrounds:** `#EEEEFF`, `#CFD0E6`
  - **Muted Labels:** `#70788A`
- **Workspaces:**
  - **Admin / Staff Workspace:** Left dark sidebar with institutional branding (`INTERNAL ONLY - College staff`), metric cards, verification queue, cell management, and audit log.
  - **Alumni Portal:** Top navigation bar (or mobile drawer), personal alumni identity badge (`AL-0108`), profile completeness bar.

---

## 4. Institutional Design Guidelines (Anti-"Vibecoded" Standards)

To ensure AlmaLink presents as a serious, production-grade university platform rather than a superficial or generic "vibecoded" template during institutional deployment and academic viva evaluation:

1. **Restrained, Purposeful Status Badges (No "Toy Pill" Overuse):**
   - Eliminate unnecessary colorful pill bubbles around plain metadata.
   - Restrict badges strictly to actionable operational states:
     - `VERIFIED`: Subtle emerald green.
     - `PENDING REVIEW`: Warm amber.
     - `DRAFT`: Cool slate.
     - `REJECTED`: Muted red.
   - Use clean, structured typography for academic batch details (e.g., `MCA • Class of 2023`).

2. **Authentic Institutional & Pune Tech Context:**
   - Strictly prohibit generic placeholders like "John Doe" or "Acme Corp".
   - Seed and demonstrate with authentic Pune tech organizations:
     - *Companies:* Persistent Systems, Infosys (Hinjewadi), Barclays Pune, TCS Sahyadri Park, Cognizant, Veritas, Bajaj Finserv.
     - *Designations:* Senior SRE, Technical Lead, Cloud Architect, Data Engineer.
     - *Batches:* Realistic MES IMCC graduation years (2016–2024).

3. **High Information Density for Staff / Admin Workspaces:**
   - Avoid giant, empty floating cards that waste screen space.
   - Staff dashboards feature dense, professional tabular data, sticky table headers, clear pagination, and quick action icons.
   - The Alumni Portal remains warm, clean, and spacious, emphasizing giving back to their alma mater.

4. **Enterprise Polish & Micro-Interactions:**
   - **Skeleton Loaders:** Shimmering placeholder bars instead of generic spinning circles.
   - **Command Palette (`Ctrl + K` / `Cmd + K`):** Quick keyboard search palette to instantly jump to any alumnus, event, or cell from anywhere in the app.
   - **Functional Export Triggers:** Real CSV downloads with properly formatted institutional headers.

5. **Meaningful Institutional Empty States:**
   - Replace generic "No data" messages with clear, reassuring operational copy:
     - *Verification Queue:* "All registrations reviewed! There are no pending verification requests for today."
     - *Invitations:* "No pending activity invites. You're all caught up!"

---

## 5. Data Integrity & Consistency Standards

1. **Atomic Multi-Statement Transactions (`$transaction`):**
   - Multi-step state transitions (e.g., Alumni Verification + Notification Dispatch + Audit Logging) must execute inside a single atomic database transaction. If any step fails, the entire transaction rolls back to prevent half-baked or orphaned states.
2. **Database-Level Unique Constraints:**
   - Hard constraints enforced at the database level (`UNIQUE(enrollmentNumber)`, `UNIQUE(voterId, academicYear)`) to physically prevent duplicate student registrations and double-voting, immune to client-side race conditions.
3. **Immutable Contribution Ledger Pattern:**
   - Alumni contribution scores are never stored as an arbitrary, mutable counter that can be tampered with. Scores are mathematically computed from verified activity participation records with full audit traceability back to the activity, cell, date, and approving coordinator.
4. **Strict Shared TypeScript Enums:**
   - All lifecycle states (`VerificationStatus`, `InvitationStatus`, `Role`, `ActivityStatus`) use shared enums across backend and frontend to eliminate typos and runtime invalid states.
5. **Automated Frontend Query Cache Invalidation:**
   - Any database mutation immediately triggers query cache invalidation (e.g., invalidating `verification-queue` and `admin-stats` upon approval) so all metric cards, badges, and tables stay synchronized in real time without requiring full page reloads.

---

## 6. Institutional Longevity, Staff Handovers & Timestamp Standards

### 🔄 10–15 Year Longevity & Staff Handover Architecture
1. **Strict "No Hard Delete" Policy for Staff:**
   - Staff accounts (Admins, HODs, Cell Coordinators) are **never hard-deleted** from the database.
   - Deleting a staff account would break foreign keys, corrupt historic audit logs, and orphan past event records and certificate signatures.
2. **Staff Role Handover & Reassignment Workflow:**
   - Under *Staff & Cells Management*, College Administrators can execute a formal **"Transfer Cell Coordination"** action.
   - Coordination responsibilities are reassigned to the incoming faculty member.
3. **Soft Archival (`status: ARCHIVED` / `INACTIVE`):**
   - Outgoing/retired staff accounts are set to `ARCHIVED` status, disabling login access.
   - Historical contributions, verified records, past activities, and audit trails remain permanently preserved in the college archives with a clear historical label: `Prof. [Name] (Former Technical Coordinator • 2024–2028)`.

### 🕒 Global Date & Timestamp Standardization
1. **Database Layer (Storage Standard):**
   - All models store timestamps in **UTC ISO-8601** format using `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`.
   - Every major institutional action records explicit datetime stamps:
     - `registeredAt`: Exact alumni registration timestamp.
     - `verifiedAt` + `verifiedById`: Timestamp and admin who approved/rejected the profile.
     - `createdAt` + `createdById`: Timestamp and coordinator who created the activity.
     - `verifiedAt` + `verifiedById`: Attendance & points approval timestamp.
     - `awardedAt` + `academicYear`: Alumni of the Year award confirmation timestamp.
     - `timestamp` + `actorId` + `ipAddress`: Immutable audit log entry timestamp.
2. **Frontend Layer (Centralized Formatting Utility):**
   - All components use centralized date helper utilities (`formatDate`, `formatDateTime`, `formatRelativeTime`) to guarantee 100% visual consistency across every screen:
     - **Standard Dates (Events, Profiles, Batches):** `DD MMM YYYY` (e.g., `12 Oct 2026`).
     - **Audit Logs & Exact Events:** `DD MMM YYYY, hh:mm A IST` (e.g., `12 Oct 2026, 11:45 AM IST`).
     - **Notifications Feed:** Contextual relative time (e.g., `"2 hours ago"`, `"Yesterday"`).
     - **Academic Snapshots:** `AY YYYY–YY` (e.g., `AY 2026–27`).

---

## 7. Finalized Technology Stack Architecture (PERN + Supabase)

The core architecture for AlmaLink is officially locked as **PERN with Supabase Cloud PostgreSQL**:

### 7.1 Stack Matrix

| Layer | Technology | Specifications & Role |
| :--- | :--- | :--- |
| **Database** | **Supabase (PostgreSQL)** | Cloud-hosted PostgreSQL with pgBouncer connection pooling, SSL, and automated backups. Prisma ORM connects using dual URLs (`DATABASE_URL` for pooled queries, `DIRECT_URL` for migrations). |
| **ORM** | **Prisma ORM** | Type-safe schema definition, multi-statement `$transaction`, and auto-generated TypeScript clients. |
| **Backend** | **Express.js (TypeScript)** | Persistent Node.js runtime process hosting REST API endpoints, JWT auth middleware, Brevo email dispatcher, and the `whatsapp-web.js` headless Chromium daemon. |
| **Frontend** | **React 18 + Vite (TypeScript)** | High-performance SPA with client-side routing (`react-router-dom` v6), TanStack Query for cache invalidation, and React Hook Form + Zod for validation. |
| **UI & Styling** | **Tailwind CSS v3.4 + shadcn/ui** | Design system tokens strictly locked via `DESIGN_SYSTEM.md`, using `Work Sans` typography and `lucide-react` iconography. |
| **File Storage** | **Supabase Storage** | Dedicated storage buckets for activity evidence uploads (event photos, brochures) and generated PDF certificates. |

### 7.2 Environment Variable Configuration Schema (`.env`)
```bash
# Server Environment (.env in /server)
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here

# Supabase PostgreSQL Database (Prisma Dual URL Standard)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Supabase API & Storage
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# Brevo (Sendinblue) Transactional Email
BREVO_API_KEY="your_brevo_api_key"
BREVO_SENDER_EMAIL="alumni@imcc.mespune.in"
BREVO_SENDER_NAME="MES IMCC AlmaLink"

# Frontend Environment (.env in /client)
VITE_API_BASE_URL="http://localhost:5000/api"
VITE_SUPABASE_URL="https://[project-ref].supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```
