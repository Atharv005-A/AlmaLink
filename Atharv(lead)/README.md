# 🎓 AlmaLink — Alumni Management & Engagement Platform
**Institution:** MES Institute of Management & Career Courses (IMCC), Pune  

---

## 📌 Overview
**AlmaLink** is a centralized alumni management and engagement platform designed for MES IMCC, Pune. It streamlines alumni verification, cell-based activity coordination, intelligent tag-based matchmaking, automated WhatsApp/Email invitations, contribution points scoring, and annual recognition awards.

---

## 🏗️ Technology Stack (PERN + Supabase)

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **P — Database** | **Supabase (PostgreSQL)** | Cloud PostgreSQL with pgBouncer transaction pooling (`DATABASE_URL`) & direct migration access (`DIRECT_URL`). |
| **ORM** | **Prisma ORM** | Type-safe models, relation management, and multi-statement `$transaction`. |
| **E — Backend** | **Express.js (TypeScript)** | Persistent Node.js process running REST APIs, JWT authentication with RBAC, Brevo email client, and `whatsapp-web.js` daemon. |
| **R — Frontend** | **React 18 + Vite (TypeScript)** | Single Page Application with React Router v6, TanStack Query, and React Hook Form + Zod. |
| **UI & Styling** | **Tailwind CSS v3.4 + shadcn/ui** | Clean, accessible design system with `Work Sans` typography. |
| **Storage** | **Supabase Storage** | Cloud buckets for event evidence uploads and award certificate PDFs. |
| **N — Runtime** | **Node.js (LTS v20+)** | Server and developer tooling runtime. |

---

## 👥 Module Division

| Domain | Modules | Primary Features |
| :--- | :--- | :--- |
| **Foundational Administration & Governance** | **Modules 1, 2, 5, 8** | • Auth & RBAC (`SUPER_ADMIN`, `COLLEGE_ADMIN`, `CELL_COORDINATOR`, `ALUMNI`)<br>• Alumni Registration & Verification Queue<br>• Staff & Cell Management<br>• Master Dashboards, Reports, & Immutable Audit Logs |
| **Event Execution, Engagement & Recognition** | **Modules 3, 4, 6, 7** | • Activity & Event Management<br>• Smart Tag Matching & Automated Invitations (WhatsApp + Email)<br>• Attendance & Contribution Points Engine<br>• Private Leaderboard, Award Nominations & Staff Voting |

---

## 📁 Repository Structure
```text
AlmaLink/
├── client/                     # React 18 + Vite Frontend (SPA)
├── server/                     # Express.js + Prisma Backend API
├── shared/                     # Shared TypeScript Enums, Types & Validation Schemas
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Configuration

### Server (`/server/.env`)
```bash
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here

# Supabase PostgreSQL (Prisma Dual URL Standard)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Supabase API & Storage
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_ANON_KEY="your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_supabase_service_role_key"

# Brevo (Sendinblue)
BREVO_API_KEY="your_brevo_api_key"
BREVO_SENDER_EMAIL="alumni@imcc.mespune.in"
BREVO_SENDER_NAME="MES IMCC AlmaLink"
```

### Client (`/client/.env`)
```bash
VITE_API_BASE_URL="http://localhost:5000/api"
VITE_SUPABASE_URL="https://[project-ref].supabase.co"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

---

## 🔒 Security & Anti-"Vibecoding" Rules
- Strictly operational status badges (`VERIFIED`, `PENDING_REVIEW`, `REJECTED`, `DRAFT`, `ACCEPTED`, `DECLINED`).
- Authentic Pune organizations (Persistent, Infosys Hinjewadi, Barclays Pune, Veritas, etc.).
- Strict mobile table-to-card fallbacks on `< 768px`.
- Immutable contribution ledger with no arbitrary counters.
