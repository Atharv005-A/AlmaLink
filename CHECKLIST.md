# AlmaLink — Master Feature & Implementation Checklist
**Institution:** MES Institute of Management & Career Courses (IMCC), Pune  
**Document Purpose:** Living checklist tracking every user role, dashboard tab, screen, button, workflow, and technical requirement derived from:
1. The **Written IMCC Project Specification & Academic Rationale**
2. The **35-Screen Figma Design System** (`PRITHVIRAJ PATIL's team library`)
3. The **Locked Architectural Decisions** (Brevo Email, WhatsApp-web.js, Award Nominations & Voting)

---

## 📌 Module & Ownership Legend
- 👤 **[OUR SCOPE]**: Domain 1 — Modules 1, 2, 5, 8 (Authentication, Profiles, Cells, Dashboards & Audit Logs)
- 👥 **[FRIEND'S SCOPE]**: Domain 2 — Modules 3, 4, 6, 7 (Activities, Invitations, Participation & Leaderboard/Awards)
- 📱 **[MOBILE RESPONSIVENESS]**: Strict requirement — every screen, form, table, and modal must adapt smoothly to Desktop, Tablet, and Mobile viewports, faithfully implementing Figma's dedicated mobile frames (`3314:47591` – `3314:47924`).

---

## 1. 🌐 Public & Unauthenticated Workflows

### 1.1 Shared Authentication (`Figma: 3314:45055`) 👤 [OUR SCOPE - Module 1]
- [ ] Split-screen visual layout: Left MES IMCC branded hero banner, right credential form.
- [ ] Email address and password input fields with inline validation.
- [ ] "Remember me" checkbox functionality.
- [ ] "Forgot password?" navigation link.
- [ ] Automatic role-based routing upon successful authentication:
  - Super Admin / College Admin ➔ Admin Dashboard (`/admin/dashboard`)
  - Cell Coordinator ➔ Coordinator Cell Workspace (`/coordinator/dashboard`)
  - Verified Alumnus ➔ Alumni Portal Home (`/alumni/home`)
  - Pending Alumnus ➔ Registration Pending Notice (`/alumni/pending`)
- [ ] Institutional footer: "Staff accounts are created by college administrator", support email `alumni@imcc.mespune.in`.

### 1.2 Password Recovery & Reset (`Figma: 3314:45087`) 👤 [OUR SCOPE - Module 1]
- [ ] Email input form with domain/format validation.
- [ ] Integration with **Brevo Email Service** to dispatch secure, time-limited reset tokens.
- [ ] Password reset screen with confirmation field and strength indicator (min 8 chars, uppercase, number).
- [ ] Success state and redirect to login.

### 1.3 Staff / Teacher Onboarding Invitation Link (`Figma: 3314:45273`) 👤 [OUR SCOPE - Module 1]
- [ ] Secure token acceptance link sent via Brevo when Admin adds staff.
- [ ] Display staff member's pre-filled details (Name, Assigned Cell, College Email).
- [ ] "Set Your Password" form with password confirmation.
- [ ] One-click activation into the Cell Coordinator workspace.

### 1.4 Alumni Public Registration (`Figma: 3314:45114`) 👤 [OUR SCOPE - Module 2]
- [ ] Full Name field.
- [ ] 10-digit Indian Mobile Number field with regex validation (`^[6-9]\d{9}$`).
- [ ] Institutional / Personal Email address.
- [ ] Password with complexity check (min 8 chars, 1 uppercase, 1 number).
- [ ] Academic Program selector (MCA, MBA, etc.).
- [ ] Graduation Year selector (validates that year cannot be in the future).
- [ ] College Enrollment / Roll Number field ("Use the number on your college records").
- [ ] Mandatory Consent Checkbox: *"I consent to IMCC storing my profile and contacting me for college activities."*
- [ ] Inline error states: highlight invalid fields with clear corrective instructions.
- [ ] Form submission triggers notification to Admin Verification Queue.
- [ ] Sends confirmation email via Brevo.

### 1.5 Registration Pending Verification Notice (`Figma: 3314:45166`) 👤 [OUR SCOPE - Module 2]
- [ ] Confirmation screen: *"You're on the list, [Name]. Account created successfully."*
- [ ] Multi-step status timeline:
  - Step 1: Registration received (Completed ✅).
  - Step 2: Verification against college records (Pending ⏳).
- [ ] Notice text: "Verification usually takes 2-3 working days. We'll email [Email] once approved."
- [ ] "Back to sign in" button.
- [ ] Restricts unverified alumni from accessing events, invitations, or directory.

---

## 2. 🏛️ College Administrator / Super Admin Portal
*(Persona: Dr. Anjali Joshi — HOD & College Administrator)*

### 2.1 Navigation & Global Layout 👤 [OUR SCOPE]
- [ ] Left dark sidebar (`#161D2C`) with `IMCC AlmaLink` branding and "INTERNAL ONLY - College staff" badge.
- [ ] Active route indicator with Iris Indigo accent (`#5D5FEF`).
- [ ] Admin profile footer card (Avatar, Name, Role `HOD • Administrator`, Logout button).
- [ ] Global notification bell with unread badge counter.
- [ ] Breadcrumbs navigation on all inner pages.

### 2.2 Admin Tab: Dashboard (`Figma: 3314:45305`) 👤 [OUR SCOPE - Module 8]
- [ ] Metric Cards:
  - Verified Alumni Count (e.g., 284, "+16 verified this month").
  - Pending Verifications Count (e.g., 18, "6 need follow-up") with 1-click link to queue.
  - Active Activities / Events in progress.
  - Overall Invitation Response Rate percentage.
- [ ] Quick Action Buttons: "Export Summary Report", "Create Cell", "Add Staff Coordinator".
- [ ] Cell-wise Participation Bar Chart (Placement, Technical, Cultural, Sports, Entrepreneurship).
- [ ] Recent Activity Feed / Latest verified alumni list.

### 2.3 Admin Tab: Alumni Verification Queue (`Figma: 3314:45444`) 👤 [OUR SCOPE - Module 2]
- [ ] Filterable table of unverified alumni registrations:
  - Columns: Full Name, Program, Batch/Grad Year, Enrollment No., Mobile, Submitted Date, Actions.
  - Search by Name or Enrollment Number.
  - Filter by Program (MCA, MBA) and Batch Year.
- [ ] "Export Queue" button (CSV export).
- [ ] Status pill: `Awaiting Review` / `Follow-up Required`.
- [ ] Quick "Review" action button leading to detailed modal or review page.

### 2.4 Admin Sub-Screen: Profile Verification Review (`Figma: 3314:45528`) 👤 [OUR SCOPE - Module 2]
- [ ] Side-by-side comparison of Submitted Data vs College Record reference.
- [ ] View submitted phone number, email, enrollment number, and course.
- [ ] "Approve & Activate" button:
  - Changes status to `VERIFIED`.
  - Dispatches automated welcome email via Brevo.
  - Sends WhatsApp welcome message via `whatsapp-web.js`.
  - Creates immutable record in Audit Log.
- [ ] "Reject" button:
  - Prompts for rejection reason (e.g. "Enrollment number mismatch").
  - Dispatches notification email explaining the issue.
  - Records rejection action in Audit Log.

### 2.5 Admin Tab: Staff Alumni Directory (`Figma: 3314:45619`) 👤 [OUR SCOPE - Module 2]
- [ ] Comprehensive searchable directory of all verified alumni.
- [ ] Filters:
  - By Academic Program (MCA, MBA).
  - By Batch / Graduation Year range.
  - By Industry (IT, Banking, Consulting, Healthcare, etc.).
  - By Skills / Technical Expertise (Python, React, AWS, Finance, etc.).
  - By Willingness & Availability format (Online, In-Person, Weekends).
- [ ] Alumnus card / row showing: Avatar, Name, Batch, Current Org & Designation, Top Skills, Contribution Points badge.
- [ ] Search bar with instant debounced filtering.
- [ ] Export directory data as CSV / Excel.

### 2.6 Admin Sub-Screen: View Alumnus Profile (`Figma: 3314:45697`) 👤 [OUR SCOPE - Module 2]
- [ ] Header banner with Alumni Unique ID (e.g., `AL-0108`), Name, Program & Batch.
- [ ] Verified checkmark badge and contact details (Email, Phone, LinkedIn).
- [ ] Professional details section: Current Organization, Designation, Industry, Years of Experience.
- [ ] Skills chips and Areas of Expertise tags.
- [ ] Engagement Preferences: Availability, Preferred Formats, Preferred Activity types.
- [ ] Historical Contribution Ledger: Table of all past activities attended, dates, cell, role, and points earned.
- [ ] Admin actions: Edit Profile, Deactivate Account, Adjust Points (with mandatory reason).

### 2.7 Admin Tab: Staff & Cells Management (`Figma: 3314:46982`, `3314:46836`) 👤 [OUR SCOPE - Module 5]
- [ ] **Cells Overview Section (`3314:46982`)**:
  - Grid of configured college cells: Placement & Career, Technical & Co-curricular, Cultural, Sports, Entrepreneurship, Research & Seminars.
  - Card displays: Cell Code, Name, Assigned Lead/Coordinators, Total Activities Hosted, Total Alumni Engaged.
  - "Create New Cell" button (`Figma: 3314:47045` modal with Cell Name, Code, Description).
  - Toggle Cell Active / Inactive status.
- [ ] **Staff Directory Section (`3314:46836`)**:
  - Table of all college staff and assigned roles.
  - Columns: Staff Name, Email, Assigned Cell, Role (College Admin, Cell Coordinator), Status (Active, Invited), Last Login.
  - "Add Staff Coordinator" button (`Figma: 3314:46917`).
- [ ] **Add Staff Invitation Modal (`Figma: 3314:46917`)**:
  - Fields: Full Name, College Email, Department, Select Assigned Cell, Role selection.
  - "Send Invitation" button: Dispatches onboarding link with token via Brevo.

### 2.8 Admin Tab: College Engagement Reports (`Figma: 3314:47100`) 👤 [OUR SCOPE - Module 8]
- [ ] Engagement metrics by Academic Year:
  - Total alumni engaged vs registered pool.
  - Activity distribution across cells (Pie/Doughnut chart).
  - Invitation acceptance rate trends (Bar chart).
  - Top contributing batches / graduation years.
- [ ] Report generation controls:
  - Date Range picker.
  - Filter by Cell / Department.
  - Filter by Activity Category.
- [ ] "Download Report" button (Formatted CSV / PDF export).

### 2.9 Admin Tab: Read-Only Audit Log (`Figma: 3314:47288`) 👤 [OUR SCOPE - Module 8]
- [ ] Immutable tabular ledger tracking critical institutional actions:
  - Columns: Timestamp (IST), Actor (Staff Name & Role), Action Type, Target Entity, Details, IP Address.
  - Action Types: `ALUMNI_VERIFIED`, `ALUMNI_REJECTED`, `STAFF_INVITED`, `CELL_CREATED`, `POINTS_ADJUSTED`, `ROLE_CHANGED`, `LOGIN_FAILURE`.
- [ ] Filter by Actor, Action Type, or Date Range.
- [ ] Tamper-evident, read-only interface (no delete or edit buttons).

### 2.10 Admin Tab: Notifications (`Figma: 3314:47228`) 👤 [OUR SCOPE - Module 8]
- [ ] Notification feed grouped by "Today", "Yesterday", and "Earlier".
- [ ] Real-time alerts for: New alumni registrations, Pending approvals, Coordinator nomination submissions.
- [ ] "Mark all as read" button.

---

## 3. 🎯 Cell Coordinator Workspace
*(Persona: Prof. Meera Kulkarni — Technical Cell Coordinator)*

### 3.1 Coordinator Navigation & Cell Scope 👤 [OUR SCOPE - Module 5]
- [ ] Left sidebar filtered to Coordinator's specific permissions:
  - `Dashboard`
  - `Alumni directory` (read-only search for invitation matching)
  - `Activities` (scoped to their cell only)
  - `Invitations` (cell invitations)
  - `Participation` (post-event attendance verification)
  - `Annual Awards` (seasonal nomination widget)
  - `Notifications`
- [ ] Header banner with active cell scope: *"Assigned cell • Technical Cell"*.

### 3.2 Coordinator Dashboard (`Figma: 3314:46128`) 👤 [OUR SCOPE - Module 5 & 8]
- [ ] Scoped Metric Cards:
  - Upcoming Activities for their cell.
  - Approved Alumni Participations (current semester/quarter).
  - Pending Invitations / Waiting for Response count.
- [ ] "Create Activity" CTA button.
- [ ] Quick list of upcoming cell events with RSVP progress bars.

### 3.3 Activities & Event Management (`Figma: 3314:45796`, `3314:45877`) 👥 [FRIEND'S SCOPE - Module 3]
- [ ] Activity List view with filter by status: `Draft`, `Published`, `Ongoing`, `Completed`.
- [ ] "Create Activity" Form:
  - Title, Description, Activity Category (Guest Lecture, Hackathon, Mock Interview, Sports, etc.).
  - Date, Time, Venue / Online meeting URL.
  - Required Alumni Expertise & Target Batch range.
  - Expected Role (Speaker, Judge, Mentor, Panelist).
  - Contribution Points Weight (default from scoring policy).
- [ ] Lifecycle transitions: Save as Draft ➔ Publish ➔ Mark Completed.

### 3.4 Find & Invite Alumni (`Figma: 3314:45957`) 👥 [FRIEND'S SCOPE - Module 4]
- [ ] **Smart Matchmaking & Recommendation Engine**:
  - Automatically compares Activity tags against Alumni profile tags (`skills`, `expertise`, `preferredActivities`).
  - Displays match percentage badges (`100% Match ⭐`, `67% Match`).
  - Sorts recommendations to the top of the coordinator's invite view.
  - "Invite All High-Match Alumni" 1-click bulk selection button.
- [ ] Manual multi-criteria filters:
  - Filter by industry, experience level, batch years, and preferred contribution format (Online/In-Person).
- [ ] Multi-select checkboxes for batch invitations.

- [ ] "Select All Matching" action.
- [ ] Dispatch Modal:
  - Preview invitation message.
  - Set RSVP deadline.
  - Channel toggles: Email (Brevo) and WhatsApp (`whatsapp-web.js`).
- [ ] Single-click "Dispatch Invitations" with automated progress bar.

### 3.5 Invitation Tracking (`Figma: 3314:46042`) 👥 [FRIEND'S SCOPE - Module 4]
- [ ] Per-activity invitation roster:
  - Columns: Alumnus Name, Organization, Sent Date, Channels, Status (`Sent`, `Accepted`, `Declined`, `Expired`).
  - Response notes / availability messages from alumni.
- [ ] "Send Reminder" button for pending responses.

### 3.6 Post-Event Participation Recording (`Figma: 3314:46261`) 👥 [FRIEND'S SCOPE - Module 6]
- [ ] Attendance roster of alumni who accepted the invitation:
  - Attendance toggle: `Attended` / `Absent`.
  - Contribution Role confirmation (e.g. Keynote Speaker, Panel Judge).
  - Upload supporting evidence (event photo, feedback summary, brochure).
- [ ] "Submit for Points Verification" button (sends to Admin Approval Queue if score > threshold).

### 3.7 Annual Awards: Coordinator Nomination Workflow 👤 [OUR & FRIEND'S INTERSECTION - Modules 5 & 7]
- [ ] "Nominate for Alumni of the Year" seasonal card on dashboard.
- [ ] Selection modal restricted to alumni who contributed to this coordinator's cell:
  - Pick up to 3 alumni.
  - Add justification/citation for each nominee.
  - Submit nomination (locks when 3 are submitted).
- [ ] Cast vote in final voting round (1 vote per coordinator).

---

## 4. 🎓 Alumni Portal
*(Persona: Aarav Deshmukh — MCA Class of 2018)*

### 4.1 Alumni Layout & Privacy Guarantee 👤 [OUR SCOPE - Module 2]
- [ ] Top horizontal navigation bar: `Home`, `Invitations`, `My profile`, `Notifications`.
- [ ] Prominent privacy badge: *"Your profile and contribution records stay private."*
- [ ] Alumni identity pill: Avatar, Name, Program & Batch (e.g., `AD • MCA Class of 2018`).

### 4.2 Alumni Home & Contribution History (`Figma: 3314:47367`) 👤 [OUR SCOPE - Module 2]
- [ ] Welcome header: *"Welcome back, Aarav. Here is your campus engagement summary."*
- [ ] Personal Engagement Stats:
  - Total Activities Participated.
  - Cells Contributed To (e.g., Technical & Placement).
  - Verified Contribution Points earned.
  - Total Hours of Mentorship / Sessions.
- [ ] Interactive Timeline / Table of past contributions:
  - Event title, cell, date, role performed, points awarded.
- [ ] Upcoming Accepted Activities card with event links / venue details.

### 4.3 Alumni Profile Completion & Preferences (`Figma: 3314:45198`) 👤 [OUR SCOPE - Module 2]
- [ ] Profile Completeness Indicator (e.g. `90% complete` with tip: *"Add your LinkedIn to complete"*).
- [ ] Professional Information:
  - Current Organization *
  - Designation *
  - Industry * (Dropdown)
  - LinkedIn Profile URL
  - Skills chips input (add/remove tags)
  - Areas of Expertise
- [ ] Engagement & Availability Preferences:
  - Availability (Weekends, Weekday evenings, Flexible).
  - Preferred Format (Online only, In-person only, Hybrid).
  - Preferred Activities checkboxes (Guest Lectures, Hackathon Judging, Mock Interviews, Student Mentoring, Curriculum Advice).
  - Availability Notes free-text box.
- [ ] Identity Card Preview (`AL-0108 • MCA 2018 • Verified`).
- [ ] "Save Profile" button with instant feedback toast.

### 4.4 Alumni Invitations Hub (`Figma: 3314:47466`) 👥 [FRIEND'S SCOPE - Module 4]
- [ ] List of pending invitations from college cells:
  - Card shows: Event Title, Cell Name, Date, Expected Role, RSVP Deadline, Description.
- [ ] Action buttons:
  - "Accept Invitation" (prompts for optional note/availability confirmation).
  - "Decline" (prompts for quick reason: Schedule conflict, Outside expertise, etc.).
- [ ] History of past invitations with RSVP status.

### 4.5 Alumni Notifications (`Figma: 3314:47544`) 👤 [OUR SCOPE - Module 8]
- [ ] Alerts for new invitations received.
- [ ] Reminders for upcoming confirmed events.
- [ ] Profile verification and points awarded updates.

---

## 5. 🏆 Leaderboard, Recognition & Scoring Rubric
*(Friend's Scope — Modules 6 & 7)*

### 5.1 Internal Private Leaderboard (`Figma: 3314:46444`) 👥 [FRIEND'S SCOPE - Module 7]
- [ ] **Strict Access Control**: Accessible ONLY to authorized college staff; hidden from public and alumni.
- [ ] Tabs:
  - Overall Ranking
  - Category / Cell Rankings (Placement, Technical, Cultural, Sports, Mentorship).
- [ ] Filters:
  - Academic Batch / Graduation Year.
  - Academic Year date range.
- [ ] Table Columns: Rank, Alumnus Name, Batch, Primary Cell, Total Activities Completed, Verified Points.
- [ ] Expandable row to view exact points breakdown per activity.

### 5.2 Annual Awards: Shortlist & Voting Flow (`Figma: 3314:46554`, `3314:46645`) 👥 [FRIEND'S SCOPE - Module 7]
- [ ] **Top 5 Shortlist Draft (`3314:46554`)**:
  - Aggregates the 3 nominations submitted by each Cell Coordinator.
  - Displays coordinator citations and points for each nominee.
- [ ] **Staff Voting Round**:
  - Admin opens the voting window.
  - Authorized staff cast votes for "Alumnus of the Year".
  - Live vote tally visible only to College Administrator.
- [ ] **Winner Approval & Certificate Generation (`3314:46645`, `3314:46718`)**:
  - College Admin confirms final winners.
  - Automated PDF certificate generation with IMCC Pune branding, signature, and citation.
  - Downloadable and shareable certificate preview.

### 5.3 Configurable Scoring Rubric Settings (`Figma: 3314:46772`) 👥 [FRIEND'S SCOPE - Module 6]
- [ ] Editable points matrix for college activity types:
  - Delivering Guest Lecture / Keynote (e.g. 20 pts).
  - Judging Hackathon / Technical Competition (e.g. 15 pts).
  - Conducting Mock Interviews / Placement Training (e.g. 15 pts).
  - Project Mentoring (per project / semester) (e.g. 10 pts).
  - Cultural / Sports Event Judging (e.g. 10 pts).
  - Panelist / Round-table Discussion (e.g. 10 pts).
- [ ] Admin approval threshold setting (e.g., any score adjustment > 25 pts requires dual sign-off).

---

## 6. ⚙️ Technical, Security & Infrastructure Layer

### 6.1 Database Schema (Prisma ORM + PostgreSQL)
- [ ] `User`: id, email, passwordHash, role, status, fullName, phone, avatarUrl, createdAt, updatedAt.
- [ ] `AlumniProfile`: id, userId, program, gradYear, enrollmentNo, verificationStatus, verificationNote, verifiedById, currentOrg, designation, industry, linkedinUrl, skills, expertise, availability, preferredFormat, preferredActivities, consentGiven, profileCompleted.
- [ ] `CollegeCell`: id, name, code, description, headStaffId, isActive.
- [ ] `CellCoordinator`: id, userId, cellId, assignedAt.
- [ ] `Activity`: id, title, description, cellId, activityType, date, venue, status, pointsWeight, createdById.
- [ ] `ActivityInvitation`: id, activityId, alumniId, status, rsvpDeadline, responseNote, sentViaEmail, sentViaWhatsapp, respondedAt.
- [ ] `ParticipationRecord`: id, activityId, alumniId, role, attended, pointsAwarded, evidenceUrl, verifiedById, verifiedAt.
- [ ] `AwardNomination`: id, academicYear, cellId, alumniId, nominatedById, justification, createdAt.
- [ ] `AwardVote`: id, nominationId, voterId, academicYear, createdAt (unique [voterId, academicYear]).
- [ ] `AuditLog`: id, userId, action, entityType, entityId, details, ipAddress, createdAt.
- [ ] `Notification`: id, userId, title, message, type, isRead, link, createdAt.
- [ ] `ScoringPolicy`: id, activityType, defaultPoints, description, updatedById.

### 6.2 External Integrations
- [ ] **Brevo Email Service**:
  - API / SMTP client configuration with retry logic.
  - HTML templates for: Registration Welcome, Verification Approved/Rejected, Staff Invitation, Activity Invitation, Password Reset.
- [ ] **WhatsApp Web Automation (`whatsapp-web.js`)**:
  - Headless client lifecycle management (initialize, QR generation, authenticated state, auto-reconnect).
  - Admin/Coordinator settings tab showing live QR code for one-time pairing.
  - Bulk queue dispatcher with rate-limiting throttling (1–2s delay per message).
  - Templated message formatter for invitations and status updates.

### 6.3 Security & Role-Based Access Control (RBAC)
- [ ] JWT authentication with secure HTTP-only cookies or Bearer auth.
- [ ] Middleware: `requireAuth`, `requireRole(['SUPER_ADMIN', 'COLLEGE_ADMIN'])`, `requireCellCoordinator`.
- [ ] Data scoping: Coordinators can only modify activities and invitations for their own cell.
- [ ] Alumni private information protection (contact details masked from unauthorized viewers).
- [ ] Complete audit trail logging on every sensitive mutation.

---

## 7. 🚀 Future Scope & Standout Enhancements (Academic & Institutional Impact)

- [ ] **7.1 Cryptographic Verifiable Certificates with QR Code**:
  - Assign each generated Award Certificate a tamper-evident Verification ID (e.g. `IMCC-CERT-2026-8941`).
  - Embed dynamic scannable QR code on the certificate PDF.
  - Public verification landing page (`/verify-certificate/:id`) validating authenticity against the database.
- [ ] **7.2 1-Click "NAAC Criteria 5.4" Accreditation Report Generator**:
  - Dedicated export option in Admin Reports formatted for Indian institutional accreditation (NAAC / NIRF).
  - Automatically aggregates alumni engagement hours, cell-wise guest sessions, student mentorship, and industry contributions.
- [ ] **7.3 "Alumni Footprint" — Geographic & Industry Dispersion Map**:
  - Interactive dashboard map widget visualizing geographic distribution of IMCC graduates (Pune Tech Hubs, Mumbai, Bengaluru, Hyderabad, Global).
  - Industry distribution breakdown (Software, FinTech, Consulting, Core Engineering).
- [ ] **7.4 Automated Calendar Integration (`.ics` / Google Calendar / Outlook)**:
  - Generate 1-click "Add to Google Calendar" links and downloadable `.ics` calendar files upon invitation acceptance.
  - Automatically handles timezone, event venue / virtual meeting link, and reminder alerts.
- [ ] **7.5 Alumni Industry Skill Matrix & Curriculum Gap Analytics**:
  - Aggregated analytics tracking trending technologies and skills across recent graduating batches.
  - Generates data-driven reports for HODs and Academic Councils to modernize student syllabus and workshop offerings.

